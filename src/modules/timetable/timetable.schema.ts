import mongoose, { Schema } from "mongoose";
import { type TimeTableZod } from "./zod/timetable.zod.js";

export interface TimeTableInterface {
  name: string;
  timetable: TimeTableZod;
  user: string;
  repeatable: boolean;
  timezone: string;
}

const timetableSchema = new mongoose.Schema<TimeTableInterface>(
  {
    timetable: Schema.Types.Mixed,
    name: String,
    user: String,
    repeatable: { type: Boolean, default: false },
    timezone: String,
  },
  { timestamps: true }
);

const TimeTable = mongoose.model<TimeTableInterface>("TimeTable", timetableSchema);

export default TimeTable;
