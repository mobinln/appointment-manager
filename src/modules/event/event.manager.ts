import { HydratedDocument, Types } from "mongoose";
import Event, { EventInterface, EventStatus } from "./event.schema";
import Slot from "../slot/slot.schema";
import { createSlot, takeSlot } from "../slot/slot.manager";

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

export async function deleteEvent(
  eventId: string | Types.ObjectId
): Promise<Error | void> {
  const event = await Event.findById(eventId);
  if (!event) {
    return new Error("event not found");
  }

  const slot = await Slot.findById(event.slotId);
  if (!slot) {
    return new Error("event's slot not found !!");
  }

  slot.taken = false;
  await slot.save();

  await event.deleteOne().exec();
}

export async function changeEventStatus({
  eventId,
  status,
  comment,
  metadata,
}: {
  eventId: string | Types.ObjectId;
  status: EventStatus;
  comment?: string;
  metadata?: any;
}): Promise<HydratedDocument<EventInterface> | Error> {
  const event = await Event.findById(eventId);
  if (!event) {
    return new Error("event not found");
  }
  event.status = status;
  event.history.push({
    author: "system",
    comment: "Change status to " + status,
  });
  if (comment) {
    event.history.push({
      author: "user",
      comment: comment,
      metadata,
    });
  }
  await event.save();

  return event;
}

export async function rescheduleEvent({
  eventId,
  manualTime,
  slotId,
}: {
  eventId: string | Types.ObjectId;
  slotId?: string | Types.ObjectId;
  manualTime?: { start: Date; end: Date };
}): Promise<HydratedDocument<EventInterface> | Error> {
  const event = await Event.findById(eventId);
  if (!event) {
    return new Error("event not found");
  }
  if (!slotId && !manualTime) {
    return new Error("slotId or manualTime is required");
  }
  if (slotId) {
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return new Error("slot not found");
    }
    event.slotId = slotId as Types.ObjectId;
    event.history.push({
      author: "system",
      comment: "Rescheduled event",
      metadata: { slotId: slotId },
    });
  } else if (manualTime) {
    const slot = await createSlot({
      startTime: manualTime.start,
      endTime: manualTime.end,
    });
    if (slot instanceof Error) {
      return slot;
    }
    event.slotId = slot._id;
    event.history.push({
      author: "system",
      comment: "Created a manual slot and rescheduled event",
      metadata: { slotId: slot._id },
    });
  }

  event.status = "pending-member";
  await event.save();

  return event;
}

export async function rejectEventByMember({
  eventId,
  suggestedTime,
}: {
  eventId: Types.ObjectId | string;
  suggestedTime: Date;
}) {
  const event = await Event.findById(eventId);
  if (!event) {
    return new Error("event not found");
  }
  event.status = "rejected-by-member";
  event.history.push({
    author: "system",
    comment: "Rejected by member",
    metadata: { suggestedTime },
  });
  await event.save();

  return event;
}

export async function rejectEventByUser({
  eventId,
  comment,
}: {
  eventId: Types.ObjectId | string;
  comment: string;
}) {
  const event = await Event.findById(eventId);
  if (!event) {
    return new Error("event not found");
  }
  event.status = "rejected-by-user";
  event.history.push({
    author: "system",
    comment: "Rejected by user",
    metadata: { comment },
  });
  await event.save();

  return event;
}

export async function cancelEvent(eventId: string | Types.ObjectId) {
  const event = await Event.findById(eventId);
  if (!event) {
    return new Error("event not found");
  }

  const slot = await Slot.findById(event.slotId);
  if (!slot) {
    return new Error("slot not found !!");
  }
  slot.taken = false;
  await slot.save();

  event.status = "canceled";
  event.history.push({
    author: "system",
    comment: "Canceled",
  });

  await event.save();
}
