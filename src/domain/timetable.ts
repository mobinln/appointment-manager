import { z } from "zod";
import { addMinutes, compareAsc, set } from "date-fns";

import { Slot } from "./slot";

const hourKey = z.string().refine((v) => {
  if (/^\d+-\d+$/.test(v)) {
    const [a, b] = v.split("-");
    if (Number(a) < Number(b) && Number(a) < 25 && Number(a) > -1 && Number(b) < 25 && Number(b) > -1) {
      return true;
    }
    return false;
  }
  return false;
});

const hourInfo = z.object({
  interval: z.coerce.number().min(1).max(120),
});

type TimeTableType = {
  sat: Record<string, z.infer<typeof hourInfo>>;
  sun: Record<string, z.infer<typeof hourInfo>>;
  mon: Record<string, z.infer<typeof hourInfo>>;
  tue: Record<string, z.infer<typeof hourInfo>>;
  wed: Record<string, z.infer<typeof hourInfo>>;
  thu: Record<string, z.infer<typeof hourInfo>>;
  fri: Record<string, z.infer<typeof hourInfo>>;
};

export class TimeTable {
  id?: string;
  timetable: TimeTableType;
  name: string;
  user: string;
  repeatable: boolean;

  constructor(params: { id?: string; timetable: TimeTableType; name: string; user: string; repeatable: boolean }) {
    this.id = params.id;
    this.name = params.name;
    this.timetable = params.timetable;
    this.user = params.user;
    this.repeatable = params.repeatable;
  }

  isValidTimetable(): boolean {
    for (const day in this.timetable) {
      const dayInfo = this.timetable[day as keyof typeof this.timetable];

      for (const key in dayInfo) {
        if (Object.prototype.hasOwnProperty.call(dayInfo, key)) {
          try {
            hourKey.parse(key);
            hourInfo.parse(dayInfo[key]);
          } catch (error) {
            console.log({ dayInfo, key }, error);

            return false;
          }
        }
      }

      if (dayInfo) {
        const ranges = Object.keys(dayInfo);
        const numericRanges = ranges.map((range) => range.split("-").map(Number)) as [number, number][];
        numericRanges.sort((a, b) => a[0] - b[0]);

        for (let i = 1; i < numericRanges.length; i++) {
          const prevRange = numericRanges[i - 1];
          const currRange = numericRanges[i];

          // If the end value of the previous range is greater than or equal to the start value of the current range,
          // then there is an overlap
          if (currRange && prevRange && prevRange[1] > currRange[0]) {
            return false;
          }
        }
      }
    }

    return true;
  }

  generateSlots({ startDate }: { startDate: Date }): Slot[] {
    let result: Slot[] = [];

    for (const day in this.timetable) {
      const dayValue = this.timetable[day as keyof typeof this.timetable];
      if (dayValue) {
        for (const timeRange in dayValue) {
          const interval = dayValue[timeRange]?.interval;
          const [start, end] = timeRange.split("-").map(Number);
          if (!start || !end || !interval) {
            continue;
          }

          let currentStartTime = set(startDate, { hours: start, minutes: 0, seconds: 0 });
          const endTime = set(startDate, { hours: end, minutes: 0, seconds: 0 });

          while (compareAsc(addMinutes(currentStartTime, interval), endTime) < 1) {
            result.push(
              new Slot({
                startTime: currentStartTime,
                endTime: addMinutes(currentStartTime, interval),
                taken: false,
                timetableId: this.id,
              })
            );
            currentStartTime = addMinutes(currentStartTime, interval);
          }
        }
      }
    }
    return result;
  }
}
