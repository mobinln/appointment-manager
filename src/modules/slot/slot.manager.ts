import { HydratedDocument, Types } from "mongoose";
import Slot, { SlotInterface } from "./slot.schema";
import TimeTable from "../timetable/timetable.schema";
import { tuple } from "zod";

export async function createSlot(
  data: SlotInterface
): Promise<HydratedDocument<SlotInterface> | Error> {
  const timetable = await TimeTable.findById(data.timetableId);
  if (!timetable) {
    return new Error("timetable not found");
  }

  const slot = new Slot(data);
  await slot.save();
  return slot;
}

export async function findSlots(): Promise<HydratedDocument<SlotInterface>[]> {
  return Slot.find().sort("start").exec();
}

export async function takeSlot(slotId: Types.ObjectId): Promise<void | Error> {
  const slot = await Slot.findById(slotId);
  if (!slot) {
    return new Error("slot not found");
  }

  slot.taken = true;
  await slot.save();
}
