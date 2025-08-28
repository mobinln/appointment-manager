import { z } from "zod";
import { zodBoolean } from "../../../utils/zod.js";

export const getSlotsZod = z.object({
  timetableId: z.string().optional(),
  taken: zodBoolean.optional(),
  "min:startTime": z.coerce.date().optional(),
  "max:startTime": z.coerce.date().optional(),
  "min:endTime": z.coerce.date().optional(),
  "max:endTime": z.coerce.date().optional(),
});
