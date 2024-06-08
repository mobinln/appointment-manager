import mongoose, { Schema } from "mongoose";
import { TimeTableZod } from "./zod/timetable.zod";

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
    repeatable: { type: Boolean, default: true },
    timezone: String,
  },
  { timestamps: true }
);

const TimeTable = mongoose.model<TimeTableInterface>(
  "TimeTable",
  timetableSchema
);

export default TimeTable;
