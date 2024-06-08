import { z } from "zod";
import { timetableZod } from "./timetable.zod";

export const editTimeTableZod = z.object({
  user: z.string().optional(),
  timetable: timetableZod.optional(),
  repeatable: z.boolean().optional(),
  timezone: z.string().optional(),
  name: z.string().optional(),
});
