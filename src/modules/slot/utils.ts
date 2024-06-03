import { addMinutes, getHours, set, setHours } from "date-fns";

export function divideRangeToSlots({
  date,
  interval,
  range,
}: {
  date: Date;
  range: string;
  interval: number;
}) {
  const [start, end] = range.split("-").map(Number);
  const result: Date[] = [];

  result.push(set(date, { hours: start, minutes: 0, seconds: 0 }));
  while (getHours(result[result.length - 1]) < getHours(setHours(date, end))) {
    result.push(addMinutes(result[result.length - 1], interval));
  }

  return result;
}

export function checkOverlappingRanges(ranges: string[]): boolean {
  // Convert each string range into an array of [start, end] numbers
  const numericRanges = ranges.map((range) => range.split("-").map(Number));

  // Sort the numeric ranges based on their start values
  numericRanges.sort((a, b) => a[0] - b[0]);

  // Check for overlap between consecutive ranges
  for (let i = 1; i < numericRanges.length; i++) {
    const prevRange = numericRanges[i - 1];
    const currRange = numericRanges[i];

    // If the end value of the previous range is greater than or equal to the start value of the current range,
    // then there is an overlap
    if (prevRange[1] > currRange[0]) {
      return true;
    }
  }

  // If no overlap is found, return false
  return false;
}
