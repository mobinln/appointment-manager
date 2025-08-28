import { HydratedDocument, Types } from "mongoose";
import Slot, { SlotInterface } from "./slot.schema";
import TimeTable from "../timetable/timetable.schema";

export async function createSlot(data: {
  timetableId?: string | Types.ObjectId;
  startTime: Date;
  endTime: Date;
  metadata?: any;
}): Promise<HydratedDocument<SlotInterface> | Error> {
  if (data.timetableId) {
    const timetable = await TimeTable.findById(data.timetableId);
    if (!timetable) {
      return new Error("timetable not found");
    }
  }

  const slot = new Slot(data);
  await slot.save();
  return slot;
}

export async function findSlots(filters: {
  timetableId?: string;
  taken?: boolean;
  "min:startTime"?: Date;
  "max:startTime"?: Date;
  "min:endTime"?: Date;
  "max:endTime"?: Date;
}): Promise<HydratedDocument<SlotInterface>[]> {
  const query = {
    ...(filters.taken !== undefined ? { taken: filters.taken } : {}),
    ...(filters.timetableId ? { timetableId: filters.timetableId } : {}),
    ...(filters["min:startTime"] || filters["max:startTime"]
      ? {
          startTime: {
            ...(filters["min:startTime"] ? { $gte: filters["min:startTime"] } : {}),
            ...(filters["max:startTime"] ? { $lte: filters["max:startTime"] } : {}),
          },
        }
      : {}),
    ...(filters["min:endTime"] || filters["max:endTime"]
      ? {
          endTime: {
            ...(filters["min:endTime"] ? { $gte: filters["min:endTime"] } : {}),
            ...(filters["max:endTime"] ? { $lte: filters["max:endTime"] } : {}),
          },
        }
      : {}),
  };
  return Slot.find(query).sort("startTime").exec();
}

export async function takeSlot(slotId: Types.ObjectId): Promise<void | Error> {
  const slot = await Slot.findById(slotId);
  if (!slot) {
    return new Error("slot not found");
  }

  slot.taken = true;
  await slot.save();
}
