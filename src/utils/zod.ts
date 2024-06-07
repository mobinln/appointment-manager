import { z } from "zod";

export const zodBoolean = z.boolean().or(
  z
    .string()
    .refine((value) => ["true", "false"].includes(value.toLowerCase()))
    .transform((value) => value.toLowerCase() === "true")
);
