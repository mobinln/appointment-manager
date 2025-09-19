import { Slot } from "../../domain/slot";

// Mock mongoose
// jest.mock("mongoose", () => ({
//   Document: class MockDocument {
//     constructor() {}
//   },
//   Schema: {
//     Types: {
//       ObjectId: "ObjectId",
//       Mixed: "Mixed",
//     },
//   },
//   model: jest.fn(),
// }));

describe("Slot", () => {
  let slotParams: {
    timetableId?: string;
    startTime: Date;
    endTime: Date;
    taken: boolean;
    metadata?: any;
    createdAt: Date;
    updatedAt?: Date;
  };

  beforeEach(() => {
    slotParams = {
      timetableId: "timetable-123",
      startTime: new Date("2023-12-01T10:00:00Z"),
      endTime: new Date("2023-12-01T11:00:00Z"),
      taken: false,
      metadata: { room: "Conference Room A" },
      createdAt: new Date("2023-11-01T00:00:00Z"),
      updatedAt: new Date("2023-11-01T12:00:00Z"),
    };
  });

  describe("constructor", () => {
    it("should create a slot with all properties", () => {
      const slot = new Slot(slotParams);

      expect(slot.timetableId).toBe("timetable-123");
      expect(slot.startTime).toEqual(new Date("2023-12-01T10:00:00Z"));
      expect(slot.endTime).toEqual(new Date("2023-12-01T11:00:00Z"));
      expect(slot.taken).toBe(false);
      expect(slot.metadata).toEqual({ room: "Conference Room A" });
      expect(slot.createdAt).toEqual(new Date("2023-11-01T00:00:00Z"));
      expect(slot.updatedAt).toEqual(new Date("2023-11-01T12:00:00Z"));
    });
  });

  describe("reserve", () => {
    it("should reserve an available slot", () => {
      const slot = new Slot({ ...slotParams, taken: false });

      slot.reserve();

      expect(slot.taken).toBe(true);
    });

    it("should throw error when trying to reserve an already taken slot", () => {
      const slot = new Slot({ ...slotParams, taken: true });

      expect(() => {
        slot.reserve();
      }).toThrow("Slot already taken");
    });

    it("should not change taken status when reserve throws error", () => {
      const slot = new Slot({ ...slotParams, taken: true });

      try {
        slot.reserve();
      } catch (error) {
        // Expected error
      }

      expect(slot.taken).toBe(true);
    });
  });

  describe("free", () => {
    it("should free a taken slot", () => {
      const slot = new Slot({ ...slotParams, taken: true });

      slot.free();

      expect(slot.taken).toBe(false);
    });

    it("should free an already available slot without error", () => {
      const slot = new Slot({ ...slotParams, taken: false });

      expect(() => {
        slot.free();
      }).not.toThrow();

      expect(slot.taken).toBe(false);
    });

    it("should set taken to false regardless of initial state", () => {
      const takenSlot = new Slot({ ...slotParams, taken: true });
      const availableSlot = new Slot({ ...slotParams, taken: false });

      takenSlot.free();
      availableSlot.free();

      expect(takenSlot.taken).toBe(false);
      expect(availableSlot.taken).toBe(false);
    });
  });

  describe("slot state transitions", () => {
    it("should support reserve -> free -> reserve cycle", () => {
      const slot = new Slot({ ...slotParams, taken: false });

      // Initially available
      expect(slot.taken).toBe(false);

      // Reserve it
      slot.reserve();
      expect(slot.taken).toBe(true);

      // Free it
      slot.free();
      expect(slot.taken).toBe(false);

      // Reserve it again
      slot.reserve();
      expect(slot.taken).toBe(true);
    });

    it("should support multiple free calls without error", () => {
      const slot = new Slot({ ...slotParams, taken: true });

      slot.free();
      slot.free();
      slot.free();

      expect(slot.taken).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle complex metadata objects", () => {
      const complexMetadata = {
        room: "Conference Room A",
        equipment: ["projector", "whiteboard", "video-conference"],
        capacity: 10,
        location: {
          building: "Main Office",
          floor: 2,
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
        bookingRules: {
          maxDuration: 120,
          allowRecurring: true,
          requireApproval: false,
        },
      };

      const slot = new Slot({ ...slotParams, metadata: complexMetadata });

      expect(slot.metadata).toEqual(complexMetadata);
    });
  });
});
