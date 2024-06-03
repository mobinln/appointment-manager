import { HydratedDocument, Types } from "mongoose";
import Event, { EventInterface } from "./event.schema";
import Slot from "../slot/slot.schema";
import { takeSlot } from "../slot/slot.manager";

export async function findEvents(filters: {
  status?: string;
  slotId?: string;
  title?: string;
  member?: string;
}): Promise<HydratedDocument<EventInterface>[]> {
  const query = {
    ...(filters.status ? { status: { $in: filters.status?.split(",") } } : {}),
    ...(filters.slotId ? { slotId: filters.slotId } : {}),
    ...(filters.title ? { title: { $regex: filters.title } } : {}),
    ...(filters.member ? { member: filters.member } : {}),
  };
  const events = await Event.find(query).exec();
  return events;
}

export async function createEvent(data: {
  slotId: string;
  title: string;
  member: string;
  metadata?: any;
}): Promise<HydratedDocument<EventInterface> | Error> {
  const slot = await Slot.findById(data.slotId);
  if (!slot) {
    throw new Error("Slot not found");
  }
  if (slot.taken) {
    throw new Error("Slot already taken");
  }
  await takeSlot(slot._id);

  const newEvent = new Event(data);

  newEvent.history.push({
    author: "system",
    comment: "event created",
  });

  return await newEvent.save();
}
