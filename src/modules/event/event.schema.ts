import mongoose, { Schema, Types } from "mongoose";
import { EventHistoryInterface, EventHistorySchema } from "../event-history/event-history.schema";

export const eventStatuses = [
  "pending-user",
  "accepted",
  "pending-member",
  "rejected-by-user",
  "rejected-by-member",
  "canceled",
  "done",
  "archived",
] as const;
export type EventStatus = (typeof eventStatuses)[number];

export interface EventInterface {
  status: EventStatus;
  slotId: Types.ObjectId;
  title: string;
  member: string;
  metadata?: any;
  history: EventHistoryInterface[];
}

const eventSchema = new mongoose.Schema<EventInterface>(
  {
    status: { type: String, enum: eventStatuses, default: "pending-user" },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot" },
    member: String,
    title: String,
    metadata: Schema.Types.Mixed,
    history: [EventHistorySchema],
  },
  { timestamps: true }
);

const Event = mongoose.model<EventInterface>("Event", eventSchema);

export default Event;
