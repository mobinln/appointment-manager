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

  constructor(params: {
    status: EventStatus;
    slotId: string | null;
    title: string;
    member: string;
    metadata?: any;
    history: EventHistoryInterface[];
  }) {
    this.status = params.status;
    this.slotId = params.slotId;
    this.title = params.title;
    this.member = params.member;
    this.metadata = params.metadata;
    this.history = params.history;
  }
}
