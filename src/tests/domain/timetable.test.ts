import { getHours } from "date-fns";
import { TimeTable } from "../../domain/timetable";

describe("Timetable", () => {
  let startDate: Date;

  beforeEach(() => {
    startDate = new Date("2024-01-15T00:00:00.000Z");
  });

  it("should validate correct timetable", () => {
    const t = new TimeTable({
      name: "t1",
      repeatable: true,
      user: "u1",
      timetable: {
        sat: {
          "9-14": { interval: 15 },
        },
        sun: {
          "9-14": { interval: 15 },
        },
        mon: {
          "9-14": { interval: 15 },
        },
        tue: {
          "9-14": { interval: 15 },
        },
        wed: {
          "9-14": { interval: 15 },
        },
        thu: {
          "9-14": { interval: 15 },
        },
        fri: {
          "9-14": { interval: 15 },
        },
      },
    });

    expect(t.isValidTimetable()).toBe(true);
  });

  it("should return false for invalid timetable", () => {
    const t = new TimeTable({
      name: "t1",
      repeatable: true,
      user: "u1",
      timetable: {
        sat: {
          "9-14": { interval: 15 },
          "10-11": { interval: 15 },
        },
        sun: {},
        mon: {},
        tue: {},
        wed: {},
        thu: {},
        fri: {},
      },
    });

    expect(t.isValidTimetable()).toBe(false);
  });

  it("should generate slots for a simple time range with 60-minute intervals", () => {
    const t1 = new TimeTable({
      name: "test-id",
      timetable: {
        mon: {
          "9-17": { interval: 60 },
        },
        sat: {},
        sun: {},
        tue: {},
        wed: {},
        thu: {},
        fri: {},
      },
      repeatable: false,
      user: "u1",
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(8); // 9am to 5pm with 60min intervals = 8 slots
    expect(getHours(slots[0].startTime)).toBe(9);
    expect(getHours(slots[0].endTime)).toBe(10);
    expect(getHours(slots[7].startTime)).toBe(16);
    expect(getHours(slots[7].endTime)).toBe(17);
  });

  it("should generate slots for 30-minute intervals", () => {
    const t1 = new TimeTable({
      name: "test-id",
      timetable: {
        mon: {},
        sat: {},
        sun: {},
        tue: {
          "10-11": { interval: 30 },
          "11-12": { interval: 30 },
        },
        wed: {},
        thu: {},
        fri: {},
      },
      repeatable: false,
      user: "u1",
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(4);
    expect(getHours(slots[0].startTime)).toBe(10);
    expect(slots[0].startTime.getMinutes()).toBe(0);
    expect(getHours(slots[1].startTime)).toBe(10);
    expect(slots[1].startTime.getMinutes()).toBe(30);
    expect(getHours(slots[3].endTime)).toBe(12);
  });

  it("should generate slots for 15-minute intervals", () => {
    const t1 = new TimeTable({
      name: "test-id",
      timetable: {
        mon: {},
        sat: {},
        sun: {},
        tue: {},
        wed: {
          "14-15": { interval: 15 },
        },
        thu: {},
        fri: {},
      },
      repeatable: false,
      user: "u1",
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(4);
    expect(slots.every((slot) => slot.endTime.getTime() - slot.startTime.getTime() === 15 * 60 * 1000)).toBe(true);
  });

  it("should handle multiple time ranges in a single day", () => {
    const t1 = new TimeTable({
      name: "test-id",
      repeatable: false,
      user: "u1",
      timetable: {
        fri: {
          "9-11": { interval: 60 },
          "14-16": { interval: 60 },
        },
        sat: {},
        sun: {},
        mon: {},
        tue: {},
        wed: {},
        thu: {},
      },
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(4);

    const morningSlots = slots.filter((slot) => getHours(slot.startTime) < 12);
    const afternoonSlots = slots.filter((slot) => getHours(slot.startTime) >= 14);

    expect(morningSlots).toHaveLength(2);
    expect(afternoonSlots).toHaveLength(2);
  });

  it("should handle multiple days", () => {
    const t1 = new TimeTable({
      name: "test-id",
      repeatable: false,
      user: "u1",
      timetable: {
        fri: {},
        sat: {},
        sun: {},
        mon: {
          "9-11": { interval: 60 },
        },
        tue: {
          "10-12": { interval: 60 },
        },
        wed: {},
        thu: {},
      },
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(4);
  });

  it("should not generate slots that exceed the end time", () => {
    const t1 = new TimeTable({
      name: "test-id",
      repeatable: false,
      user: "u1",
      timetable: {
        fri: {},
        sat: {},
        sun: {},
        mon: {},
        tue: {},
        wed: {},
        thu: {
          "9-10": { interval: 90 }, // 90 minutes won't fit in 1-hour window},
        },
      },
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(0);
  });

  it("should handle exact fit scenarios", () => {
    const t1 = new TimeTable({
      name: "test-id",
      repeatable: false,
      user: "u1",
      timetable: {
        fri: {},
        sat: {
          "10-12": { interval: 120 }, // Exactly 2 hours
        },
        sun: {},
        mon: {},
        tue: {},
        wed: {},
        thu: {},
      },
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(1);
    expect(getHours(slots[0].startTime)).toBe(10);
    expect(getHours(slots[0].endTime)).toBe(12);
  });

  it("should handle single hour with large interval", () => {
    const t1 = new TimeTable({
      name: "test-id",
      repeatable: false,
      user: "u1",
      timetable: {
        fri: {},
        sat: {},
        sun: {
          "15-16": { interval: 45 }, // 45 minutes in 1-hour window
        },
        mon: {},
        tue: {},
        wed: {},
        thu: {},
      },
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(1);
    expect(getHours(slots[0].startTime)).toBe(15);
    expect(slots[0].startTime.getMinutes()).toBe(0);
    expect(getHours(slots[0].endTime)).toBe(15);
    expect(slots[0].endTime.getMinutes()).toBe(45);
  });

  test("should skip invalid time ranges", () => {
    const t1 = new TimeTable({
      name: "test-id",
      timetable: {
        mon: {
          "invalid-range": { interval: 60 },
          "9-11": { interval: 60 },
        },
        sat: {},
        sun: {},
        tue: {},
        wed: {},
        thu: {},
        fri: {},
      },
      repeatable: false,
      user: "u1",
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(2);
  });

  test("should skip entries without interval", () => {
    const t1 = new TimeTable({
      name: "test-id",
      timetable: {
        mon: {},
        sat: {},
        sun: {},
        tue: {
          "9-11": {} as { interval: number },
          "14-16": { interval: 60 },
        },
        wed: {},
        thu: {},
        fri: {},
      },
      repeatable: false,
      user: "u1",
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(2);
  });

  test("should handle empty timetable", () => {
    const t1 = new TimeTable({
      name: "test-id",
      timetable: {
        mon: {},
        sat: {},
        sun: {},
        tue: {},
        wed: {},
        thu: {},
        fri: {},
      },
      repeatable: false,
      user: "u1",
    });

    const slots = t1.generateSlots({ startDate });

    expect(slots).toHaveLength(0);
  });
});
