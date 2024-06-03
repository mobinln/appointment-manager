import mongoose, { Schema, Types } from "mongoose";
import {
  EventHistoryInterface,
  EventHistorySchema,
} from "../event-history/event-history.schema";

export const eventTypes = [
  "archived",
  "pending-member",
  "pending-user",
  "done",
];
export type EventTypes = (typeof eventTypes)[number];

export interface EventInterface {
  status: EventTypes;
  slotId: Types.ObjectId;
  title: string;
  member: string;
  metadata?: any;
  history: EventHistoryInterface[];
}

const eventSchema = new mongoose.Schema<EventInterface>(
  {
    status: { type: String, enum: eventTypes, default: "pending-user" },
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
