import { z } from "zod";
import { checkOverlappingRanges } from "../slot/utils";

const hourKey = z.string().refine((v) => {
  if (/^\d+-\d+$/.test(v)) {
    const [a, b] = v.split("-");
    if (Number(a) < Number(b) && Number(a) < 25 && Number(b) < 25) {
      return true;
    }
    return false;
  }
  return false;
});

const hourInfo = z.object({
  interval: z.coerce.number().min(1).max(120),
});

const timetableZod = z
  .object({
    sat: z.record(hourKey, hourInfo).optional(),
    sun: z.record(hourKey, hourInfo).optional(),
    mon: z.record(hourKey, hourInfo).optional(),
    tue: z.record(hourKey, hourInfo).optional(),
    wed: z.record(hourKey, hourInfo).optional(),
    thu: z.record(hourKey, hourInfo).optional(),
    fri: z.record(hourKey, hourInfo).optional(),
  })
  .refine((v) => {
    for (const day in v) {
      const dayInfo = v[day as keyof typeof v];
      if (dayInfo) {
        const ranges = Object.keys(dayInfo);
        const hasOverlapping = checkOverlappingRanges(ranges);
        if (hasOverlapping) {
          return false;
        }
      }
    }

    return true;
  }, "has overlapping ranges in timetable");

export const createTimetableZod = z.object({
  user: z.string(),
  timetable: timetableZod,
  repeatable: z.boolean().optional(),
  timezone: z.string(),
  name: z.string(),
});

export type TimeTableZod = z.infer<typeof timetableZod>;
