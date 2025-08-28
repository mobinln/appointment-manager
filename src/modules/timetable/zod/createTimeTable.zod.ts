import { z } from "zod";
import { timetableZod } from "./timetable.zod.js";

export const createTimetableZod = z.object({
  user: z.string(),
  timetable: timetableZod,
  repeatable: z.boolean().optional(),
  timezone: z.string(),
  name: z.string(),
});
