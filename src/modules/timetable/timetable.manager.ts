import { HydratedDocument } from "mongoose";
import TimeTable, { TimeTableInterface } from "./timetable.schema";
import { divideRangeToSlots } from "../slot/utils";
import { createSlot } from "../slot/slot.manager";
import { addMinutes, addWeeks, compareAsc, set, setDay } from "date-fns";
import Slot from "../slot/slot.schema";
import { getWeekDayNumber } from "../../utils/date";

export async function createTimeTable(
  data: TimeTableInterface
): Promise<HydratedDocument<TimeTableInterface>> {
  const timeTable = new TimeTable(data);
  await timeTable.save();
  return timeTable as HydratedDocument<TimeTableInterface>;
}

export async function updateTimeTable({
  data,
  id,
}: {
  id: string;
  data: Partial<TimeTableInterface>;
}): Promise<HydratedDocument<TimeTableInterface> | Error> {
  const updatedTimeTable = await TimeTable.findOneAndUpdate(
    { _id: id },
    data
  ).exec();
  if (!updatedTimeTable) {
    return new Error("timetable not found");
  }

  if (data.timetable) {
    const timeTableSlots = await Slot.find({
      taken: false,
      timetableId: id,
      startTime: { $gte: new Date() },
    });

    await Slot.deleteMany({
      _id: { $in: timeTableSlots.map((s) => s._id) },
    }).exec();

    const updated = await findTimeTableById(id);
    await createTimeTableSlots(updated);
  }

  const updated = await findTimeTableById(id);
  return updated;
}

export async function findTimeTables(filters: {
  name?: string;
  user?: string;
  repeatable?: boolean;
}): Promise<TimeTableInterface[]> {
  const query = {
    ...(filters.name ? { name: { $regex: filters.name } } : {}),
    ...(filters.user ? { user: filters.user } : {}),
    ...(filters.repeatable !== undefined
      ? { repeatable: filters.repeatable }
      : {}),
  };
  const timeTable = await TimeTable.find(query).exec();
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
  for (let weekNumber = 1; weekNumber <= 2; weekNumber++) {
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
          date: addWeeks(
            setDay(new Date(), getWeekDayNumber(day)!),
            weekNumber
          ),
          interval: rangeInfo.interval,
          range: range,
        });

        await Promise.all(
          slotStarts
            .filter((s) => compareAsc(s, new Date()) >= 1)
            .map(
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
}
