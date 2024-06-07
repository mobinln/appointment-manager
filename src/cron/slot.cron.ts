import { CronJob } from "cron";
import { createTimeTableSlots } from "../modules/timetable/timetable.manager";
import TimeTable from "../modules/timetable/timetable.schema";
import Slot from "../modules/slot/slot.schema";

export const slotCronCreator = () =>
  new CronJob(
    "0 0 */14 * *",
    async function () {
      try {
        await Slot.deleteMany({
          taken: false,
          startTime: { $lt: new Date() },
          endTime: { $lt: new Date() },
        });

        const timeTables = await TimeTable.find({
          repeatable: true,
        });
        for (const timeTable of timeTables) {
          await createTimeTableSlots(timeTable);
        }
        console.log(new Date(), "Generated new slots");
      } catch (error) {
        console.log(new Date(), "Could not create slots", error);
      }
    },
    null,
    false
  );
