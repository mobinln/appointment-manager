export class Slot {
  timetableId?: string;
  startTime: Date;
  endTime: Date;
  taken: boolean;
  metadata?: any;

  constructor(params: { timetableId?: string; startTime: Date; endTime: Date; taken: boolean; metadata?: any }) {
    this.timetableId = params.timetableId;
    this.startTime = params.startTime;
    this.endTime = params.endTime;
    this.taken = params.taken;
    this.metadata = params.metadata;
  }
}
