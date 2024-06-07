import { z } from "zod";

export const rejectByUserZod = z.object({
  eventId: z.string(),
  comment: z.string(),
});
