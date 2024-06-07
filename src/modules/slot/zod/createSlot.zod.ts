import { z } from "zod";

export const createSlotZod = z.object({
  timetableId: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  metadata: z.any().optional(),
});
