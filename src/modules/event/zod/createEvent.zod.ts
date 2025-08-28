import { z } from "zod";

export const createEventZod = z.object({
  slotId: z.string(),
  title: z.string(),
  member: z.string(),
  metadata: z.any(),
});
