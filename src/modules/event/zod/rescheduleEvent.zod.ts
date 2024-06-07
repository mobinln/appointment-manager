import { z } from "zod";

export const rescheduleEventZod = z.object({
  eventId: z.string(),
  slotId: z.string().optional(),
  manualTime: z
    .object({ start: z.coerce.date(), end: z.coerce.date() })
    .optional(),
});
