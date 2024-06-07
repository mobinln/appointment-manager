import { format } from "date-fns";

export function formatDate(date: number | Date) {
  return format(date, "yyyy-MM-dd HH:mm");
}

export function getWeekDayNumber(day: string): number | null {
  switch (day) {
    case "sun":
      return 0;
    case "mon":
      return 1;
    case "tue":
      return 2;
    case "wed":
      return 3;
    case "thu":
      return 4;
    case "fri":
      return 5;
    case "sat":
      return 6;
    default:
      return null;
  }
}
