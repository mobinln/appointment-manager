import { Slot } from "../../domain/slot";
import { SlotModel, SlotDocument } from "../persistence/slot-model";

export interface SlotRepository {
  save(slot: Slot): Promise<Slot>;
  findById(id: string): Promise<Slot | null>;
  findByTimetableId(timetableId: string): Promise<Slot[]>;
  findAvailableSlots(timetableId: string, startDate: Date, endDate: Date): Promise<Slot[]>;
  delete(id: string): Promise<void>;
}

export class MongoSlotRepository implements SlotRepository {
  async save(slot: Slot): Promise<Slot> {
    const data = slot.toPlainObject();

    if (data.id) {
      // Update existing
      const doc = await SlotModel.findByIdAndUpdate(
        data.id,
        { ...data, id: undefined }, // Remove id from update data
        { new: true, runValidators: true }
      );
      if (!doc) throw new Error("Slot not found");
      return this.toDomainObject(doc);
    } else {
      // Create new
      const doc = new SlotModel(data);
      const saved = await doc.save();
      return this.toDomainObject(saved);
    }
  }

  async findById(id: string): Promise<Slot | null> {
    const doc = await SlotModel.findById(id);
    return doc ? this.toDomainObject(doc) : null;
  }

  async findByTimetableId(timetableId: string): Promise<Slot[]> {
    const docs = await SlotModel.find({ timetableId }).sort({ startTime: 1 });
    return docs.map((doc) => this.toDomainObject(doc));
  }

  async findAvailableSlots(timetableId: string, startDate: Date, endDate: Date): Promise<Slot[]> {
    const docs = await SlotModel.find({
      timetableId,
      taken: false,
      startTime: { $gte: startDate },
      endTime: { $lte: endDate },
    }).sort({ startTime: 1 });

    return docs.map((doc) => this.toDomainObject(doc));
  }

  async delete(id: string): Promise<void> {
    const result = await SlotModel.findByIdAndDelete(id);
    if (!result) throw new Error("Slot not found");
  }

  private toDomainObject(doc: SlotDocument): Slot {
    return new Slot({
      id: doc._id.toString(),
      timetableId: doc.timetableId,
      startTime: doc.startTime,
      endTime: doc.endTime,
      taken: doc.taken,
      metadata: doc.metadata,
    });
  }
}
