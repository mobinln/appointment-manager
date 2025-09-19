import mongoose, { Document, Schema, Types } from "mongoose";

export interface SlotDocument extends Document<Types.ObjectId> {
  timetableId?: string;
  startTime: Date;
  endTime: Date;
  taken: boolean;
  metadata?: any;
}

const slotSchema = new Schema<SlotDocument>(
  {
    timetableId: { type: Schema.Types.ObjectId, ref: "Timetable" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    taken: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
slotSchema.index({ startTime: 1, endTime: 1 });
slotSchema.index({ timetableId: 1, taken: 1 });

export const SlotModel = mongoose.model<SlotDocument>("Slot", slotSchema);
