import { z } from "zod";

export const rejectByMemberZod = z.object({
  eventId: z.string(),
  suggestedTime: z.coerce.date(),
});
