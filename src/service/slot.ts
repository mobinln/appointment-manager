import { Slot } from "../domain/slot";
import { SlotRepository } from "../infrastructure/repositories/slot";

export class SlotService {
  constructor(private slotRepository: SlotRepository) {}

  async createSlot(params: { timetableId?: string; startTime: Date; endTime: Date; metadata?: any }): Promise<Slot> {
    // Additional business logic can go here
    const slot = new Slot({
      timetableId: params.timetableId,
      startTime: params.startTime,
      endTime: params.endTime,
      taken: false,
      metadata: params.metadata,
    });

    // Check for overlapping slots
    if (params.timetableId) {
      const existingSlots = await this.slotRepository.findByTimetableId(params.timetableId);
      const hasOverlap = existingSlots.some((existingSlot) => slot.overlaps(existingSlot));

      if (hasOverlap) {
        throw new Error("Slot overlaps with existing slot");
      }
    }

    return await this.slotRepository.save(slot);
  }

  async reserveSlot(slotId: string): Promise<Slot> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    slot.reserve();
    return await this.slotRepository.save(slot);
  }

  async freeSlot(slotId: string): Promise<Slot> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    slot.free();
    return await this.slotRepository.save(slot);
  }

  async getAvailableSlots(timetableId: string, startDate: Date, endDate: Date): Promise<Slot[]> {
    return await this.slotRepository.findAvailableSlots(timetableId, startDate, endDate);
  }
}
