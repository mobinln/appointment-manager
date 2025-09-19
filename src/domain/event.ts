import { Slot } from "./slot";

export const eventStatuses = [
  "pending-user",
  "pending-member",
  "accepted",
  "done",
  "rejected-by-user",
  "rejected-by-member",
  "canceled",
] as const;
export type EventStatus = (typeof eventStatuses)[number];

export interface EventHistoryInterface {
  comment: string;
  author: string;
  metadata?: any;
}

export class Event {
  status: EventStatus;
  slotId: string | null;
  title: string;
  member: string;
  metadata?: any;
  history: EventHistoryInterface[];

  slot: Slot | null;

  constructor(params: {
    status: EventStatus;
    slotId: string | null;
    title: string;
    member: string;
    metadata?: any;
    history: EventHistoryInterface[];

    slot: Slot | null;
  }) {
    this.status = params.status;
    this.slotId = params.slotId;
    this.title = params.title;
    this.member = params.member;
    this.metadata = params.metadata;
    this.history = params.history;

    this.slot = params.slot;
  }

  cancel(params: { author: string; comment?: string }) {
    if (["canceled", "rejected-by-user", "rejected-by-member", "done"].includes(this.status)) {
      throw new Error("event status is " + this.status);
    }

    this.status = "canceled";

    if (this.slot) {
      this.slot.free();
    }

    this.history.push({
      author: params.author,
      comment: params.comment ?? "Event canceled",
    });
  }

  reject(params: { author: string; comment?: string; by: "user" | "member" }) {
    if (["canceled", "rejected-by-user", "rejected-by-member", "done"].includes(this.status)) {
      throw new Error("event status is " + this.status);
    }

    if (params.by === "member") {
      this.status = "rejected-by-member";
    } else {
      this.status = "rejected-by-user";
    }

    if (this.slot) {
      this.slot.free();
    }

    this.history.push({
      author: params.author,
      comment: params.comment ?? `Event rejected-by-${params.by}`,
    });
  }

  reschedule(params: { newSlot: Slot; author: string; comment?: string }) {
    if (params.newSlot.taken) {
      throw new Error("the new slot is taken");
    }

    this.slot?.free();

    this.slotId = params.newSlot.id || null;
    this.slot = params.newSlot;

    this.status = "pending-member";

    this.history.push({
      author: params.author,
      comment: params.comment ?? `Event rescheduled`,
    });
  }

  complete(params: { author: string; comment?: string }) {
    if (
      ["canceled", "rejected-by-user", "rejected-by-member", "done", "pending-user", "pending-member"].includes(
        this.status
      )
    ) {
      throw new Error("event status is " + this.status);
    }

    this.status = "done";

    this.history.push({
      author: params.author,
      comment: params.comment ?? `Event completed`,
    });
  }
}
