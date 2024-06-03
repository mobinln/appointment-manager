import { HydratedDocument } from "mongoose";
import TimeTable, { TimeTableInterface } from "./timetable.schema";
import { divideRangeToSlots } from "../slot/utils";
import { createSlot } from "../slot/slot.manager";
import { addMinutes } from "date-fns";

export async function createTimeTable(
  data: TimeTableInterface
): Promise<HydratedDocument<TimeTableInterface>> {
  const timeTable = new TimeTable(data);
  await timeTable.save();
  return timeTable as HydratedDocument<TimeTableInterface>;
}

export async function findTimeTable(): Promise<TimeTableInterface[]> {
  const timeTable = await TimeTable.find().exec();
  return timeTable as TimeTableInterface[];
}

export async function findTimeTableById(
  id: string
): Promise<HydratedDocument<TimeTableInterface>> {
  const result = await TimeTable.findById(id).exec();
  return result as HydratedDocument<TimeTableInterface>;
}

export async function deleteTimeTable(id: string) {
  await TimeTable.findByIdAndDelete(id).exec();
}

export async function createTimeTableSlots(
  timetable: HydratedDocument<TimeTableInterface>
) {
  for (let day in timetable.timetable) {
    const dayInfo =
      timetable.timetable[day as keyof typeof timetable.timetable];
    if (!dayInfo) {
      continue;
    }
    for (let range in dayInfo) {
      const rangeInfo = dayInfo[range as keyof typeof dayInfo];
      if (!rangeInfo) {
        continue;
      }
      const slotStarts = divideRangeToSlots({
        date: new Date(),
        interval: rangeInfo.interval,
        range: range,
      });

      await Promise.all(
        slotStarts.map(
          async (s) =>
            await createSlot({
              startTime: s,
              endTime: addMinutes(s, rangeInfo.interval),
              timetableId: timetable._id,
            })
        )
      );
    }
  }
}
