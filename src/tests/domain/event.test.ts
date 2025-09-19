import { Event, EventStatus, EventHistoryInterface } from "../../domain/event";
import { Slot } from "../../domain/slot";

// Mock the Slot class
jest.mock("../slot");

describe("Event", () => {
  let mockSlot: jest.Mocked<Slot>;
  let eventParams: {
    status: EventStatus;
    slotId: string | null;
    title: string;
    member: string;
    metadata?: any;
    history: EventHistoryInterface[];
    slot: Slot | null;
  };

  beforeEach(() => {
    mockSlot = {
      _id: "slot-123",
      timetableId: "timetable-1",
      startTime: new Date("2023-12-01T10:00:00Z"),
      endTime: new Date("2023-12-01T11:00:00Z"),
      taken: true,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      reserve: jest.fn(),
      free: jest.fn(),
    } as any;

    eventParams = {
      status: "pending-user",
      slotId: "slot-123",
      title: "Test Event",
      member: "john-doe",
      metadata: { type: "meeting" },
      history: [
        {
          comment: "Event created",
          author: "system",
        },
      ],
      slot: mockSlot,
    };
  });

  describe("constructor", () => {
    it("should create an event with all properties", () => {
      const event = new Event(eventParams);

      expect(event.status).toBe("pending-user");
      expect(event.slotId).toBe("slot-123");
      expect(event.title).toBe("Test Event");
      expect(event.member).toBe("john-doe");
      expect(event.metadata).toEqual({ type: "meeting" });
      expect(event.history).toHaveLength(1);
      expect(event.slot).toBe(mockSlot);
    });

    it("should create an event without optional properties", () => {
      const minimalParams = {
        status: "accepted" as EventStatus,
        slotId: null,
        title: "Minimal Event",
        member: "jane-doe",
        history: [],
        slot: null,
      };

      const event = new Event(minimalParams);

      expect(event.status).toBe("accepted");
      expect(event.slotId).toBeNull();
      expect(event.title).toBe("Minimal Event");
      expect(event.member).toBe("jane-doe");
      expect(event.metadata).toBeUndefined();
      expect(event.history).toHaveLength(0);
      expect(event.slot).toBeNull();
    });
  });

  describe("cancel", () => {
    it("should cancel a pending-user event successfully", () => {
      const event = new Event({ ...eventParams, status: "pending-user" });

      event.cancel({ author: "user-123", comment: "Changed my mind" });

      expect(event.status).toBe("canceled");
      expect(mockSlot.free).toHaveBeenCalledTimes(1);
      expect(event.history).toHaveLength(2);
      expect(event.history[1]).toEqual({
        author: "user-123",
        comment: "Changed my mind",
      });
    });

    it("should cancel a pending-member event successfully", () => {
      const event = new Event({ ...eventParams, status: "pending-member" });

      event.cancel({ author: "member-456" });

      expect(event.status).toBe("canceled");
      expect(mockSlot.free).toHaveBeenCalledTimes(1);
      expect(event.history).toHaveLength(2);
      expect(event.history[1]).toEqual({
        author: "member-456",
        comment: "Event canceled",
      });
    });

    it("should cancel an accepted event successfully", () => {
      const event = new Event({ ...eventParams, status: "accepted" });

      event.cancel({ author: "admin-789" });

      expect(event.status).toBe("canceled");
      expect(mockSlot.free).toHaveBeenCalledTimes(1);
    });

    it("should work without slot", () => {
      const event = new Event({ ...eventParams, slot: null });

      event.cancel({ author: "user-123" });

      expect(event.status).toBe("canceled");
      expect(mockSlot.free).not.toHaveBeenCalled();
    });

    it("should throw error when trying to cancel already canceled event", () => {
      const event = new Event({ ...eventParams, status: "canceled" });

      expect(() => {
        event.cancel({ author: "user-123" });
      }).toThrow("event status is canceled");
    });

    it("should throw error when trying to cancel rejected-by-user event", () => {
      const event = new Event({ ...eventParams, status: "rejected-by-user" });

      expect(() => {
        event.cancel({ author: "user-123" });
      }).toThrow("event status is rejected-by-user");
    });

    it("should throw error when trying to cancel rejected-by-member event", () => {
      const event = new Event({ ...eventParams, status: "rejected-by-member" });

      expect(() => {
        event.cancel({ author: "user-123" });
      }).toThrow("event status is rejected-by-member");
    });

    it("should throw error when trying to cancel done event", () => {
      const event = new Event({ ...eventParams, status: "done" });

      expect(() => {
        event.cancel({ author: "user-123" });
      }).toThrow("event status is done");
    });
  });

  describe("reject", () => {
    it("should reject event by user successfully", () => {
      const event = new Event({ ...eventParams, status: "pending-user" });

      event.reject({ author: "user-123", comment: "Not available", by: "user" });

      expect(event.status).toBe("rejected-by-user");
      expect(mockSlot.free).toHaveBeenCalledTimes(1);
      expect(event.history).toHaveLength(2);
      expect(event.history[1]).toEqual({
        author: "user-123",
        comment: "Not available",
      });
    });

    it("should reject event by member successfully", () => {
      const event = new Event({ ...eventParams, status: "pending-member" });

      event.reject({ author: "member-456", by: "member" });

      expect(event.status).toBe("rejected-by-member");
      expect(mockSlot.free).toHaveBeenCalledTimes(1);
      expect(event.history).toHaveLength(2);
      expect(event.history[1]).toEqual({
        author: "member-456",
        comment: "Event rejected-by-member",
      });
    });

    it("should work without slot", () => {
      const event = new Event({ ...eventParams, slot: null });

      event.reject({ author: "user-123", by: "user" });

      expect(event.status).toBe("rejected-by-user");
      expect(mockSlot.free).not.toHaveBeenCalled();
    });

    it("should throw error when trying to reject already canceled event", () => {
      const event = new Event({ ...eventParams, status: "canceled" });

      expect(() => {
        event.reject({ author: "user-123", by: "user" });
      }).toThrow("event status is canceled");
    });

    it("should throw error when trying to reject already rejected-by-user event", () => {
      const event = new Event({ ...eventParams, status: "rejected-by-user" });

      expect(() => {
        event.reject({ author: "user-123", by: "user" });
      }).toThrow("event status is rejected-by-user");
    });

    it("should throw error when trying to reject already rejected-by-member event", () => {
      const event = new Event({ ...eventParams, status: "rejected-by-member" });

      expect(() => {
        event.reject({ author: "member-456", by: "member" });
      }).toThrow("event status is rejected-by-member");
    });

    it("should throw error when trying to reject done event", () => {
      const event = new Event({ ...eventParams, status: "done" });

      expect(() => {
        event.reject({ author: "user-123", by: "user" });
      }).toThrow("event status is done");
    });
  });

  describe("reschedule", () => {
    let newMockSlot: jest.Mocked<Slot>;

    beforeEach(() => {
      newMockSlot = {
        _id: "new-slot-456",
        timetableId: "timetable-1",
        startTime: new Date("2023-12-02T10:00:00Z"),
        endTime: new Date("2023-12-02T11:00:00Z"),
        taken: false,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        reserve: jest.fn(),
        free: jest.fn(),
      } as any;
    });

    it("should reschedule event successfully", () => {
      const event = new Event({ ...eventParams, status: "accepted" });

      event.reschedule({
        newSlot: newMockSlot,
        author: "admin-123",
        comment: "Better time slot",
      });

      expect(mockSlot.free).toHaveBeenCalledTimes(1);
      expect(event.slotId).toBe("new-slot-456");
      expect(event.slot).toBe(newMockSlot);
      expect(event.status).toBe("pending-member");
      expect(event.history).toHaveLength(2);
      expect(event.history[1]).toEqual({
        author: "admin-123",
        comment: "Better time slot",
      });
    });

    it("should reschedule event with default comment", () => {
      const event = new Event({ ...eventParams, status: "accepted" });

      event.reschedule({
        newSlot: newMockSlot,
        author: "admin-123",
      });

      expect(event.history[1]).toEqual({
        author: "admin-123",
        comment: "Event rescheduled",
      });
    });

    it("should work when current slot is null", () => {
      const event = new Event({ ...eventParams, slot: null });

      event.reschedule({
        newSlot: newMockSlot,
        author: "admin-123",
      });

      expect(event.slotId).toBe("new-slot-456");
      expect(event.slot).toBe(newMockSlot);
      expect(event.status).toBe("pending-member");
    });

    it("should throw error when new slot is taken", () => {
      const takenSlot = { ...newMockSlot, taken: true };
      const event = new Event({ ...eventParams, status: "accepted" });

      expect(() => {
        event.reschedule({
          newSlot: takenSlot as any,
          author: "admin-123",
        });
      }).toThrow("the new slot is taken");
    });
  });

  describe("complete", () => {
    it("should complete an accepted event successfully", () => {
      const event = new Event({ ...eventParams, status: "accepted" });

      event.complete({ author: "member-123", comment: "Meeting finished" });

      expect(event.status).toBe("done");
      expect(event.history).toHaveLength(2);
      expect(event.history[1]).toEqual({
        author: "member-123",
        comment: "Meeting finished",
      });
    });

    it("should complete event with default comment", () => {
      const event = new Event({ ...eventParams, status: "accepted" });

      event.complete({ author: "member-123" });

      expect(event.status).toBe("done");
      expect(event.history[1]).toEqual({
        author: "member-123",
        comment: "Event completed",
      });
    });

    it("should throw error when trying to complete canceled event", () => {
      const event = new Event({ ...eventParams, status: "canceled" });

      expect(() => {
        event.complete({ author: "member-123" });
      }).toThrow("event status is canceled");
    });

    it("should throw error when trying to complete rejected-by-user event", () => {
      const event = new Event({ ...eventParams, status: "rejected-by-user" });

      expect(() => {
        event.complete({ author: "member-123" });
      }).toThrow("event status is rejected-by-user");
    });

    it("should throw error when trying to complete rejected-by-member event", () => {
      const event = new Event({ ...eventParams, status: "rejected-by-member" });

      expect(() => {
        event.complete({ author: "member-123" });
      }).toThrow("event status is rejected-by-member");
    });

    it("should throw error when trying to complete already done event", () => {
      const event = new Event({ ...eventParams, status: "done" });

      expect(() => {
        event.complete({ author: "member-123" });
      }).toThrow("event status is done");
    });

    it("should throw error when trying to complete pending-user event", () => {
      const event = new Event({ ...eventParams, status: "pending-user" });

      expect(() => {
        event.complete({ author: "member-123" });
      }).toThrow("event status is pending-user");
    });

    it("should throw error when trying to complete pending-member event", () => {
      const event = new Event({ ...eventParams, status: "pending-member" });

      expect(() => {
        event.complete({ author: "member-123" });
      }).toThrow("event status is pending-member");
    });
  });

  describe("eventStatuses and EventStatus type", () => {
    it("should contain all expected statuses", () => {
      const { eventStatuses } = require("../event");

      expect(eventStatuses).toEqual([
        "pending-user",
        "pending-member",
        "accepted",
        "done",
        "rejected-by-user",
        "rejected-by-member",
        "canceled",
      ]);
    });
  });
});
