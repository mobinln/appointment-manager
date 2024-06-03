import mongoose, { Schema, Types } from "mongoose";

export interface SlotInterface {
  timetableId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  taken?: boolean;
  metadata?: any;
}

const slotSchema = new mongoose.Schema<SlotInterface>(
  {
    timetableId: { type: Schema.Types.ObjectId, ref: "TimeTable" },
    startTime: Date,
    endTime: Date,
    taken: { type: Boolean, default: false },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Slot = mongoose.model<SlotInterface>("Slot", slotSchema);

export default Slot;
