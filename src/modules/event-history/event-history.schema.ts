import mongoose, { Schema } from "mongoose";

export interface EventHistoryInterface {
  comment: string;
  author: string;
  metadata?: any;
}

export const EventHistorySchema = new mongoose.Schema<EventHistoryInterface>(
  {
    comment: String,
    author: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);
