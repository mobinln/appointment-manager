export class Slot {
  private _id?: string;
  private _timetableId?: string;
  private _startTime: Date;
  private _endTime: Date;
  private _taken: boolean;
  private _metadata?: any;

  constructor(params: {
    id?: string;
    timetableId?: string;
    startTime: Date;
    endTime: Date;
    taken?: boolean;
    metadata?: any;
  }) {
    this.validateTimeRange(params.startTime, params.endTime);

    this._id = params.id;
    this._timetableId = params.timetableId;
    this._startTime = params.startTime;
    this._endTime = params.endTime;
    this._taken = params.taken ?? false;
    this._metadata = params.metadata;
  }

  // Getters
  get id(): string | undefined {
    return this._id;
  }
  get timetableId(): string | undefined {
    return this._timetableId;
  }
  get startTime(): Date {
    return this._startTime;
  }
  get endTime(): Date {
    return this._endTime;
  }
  get taken(): boolean {
    return this._taken;
  }
  get metadata(): any {
    return this._metadata;
  }

  reserve(): void {
    if (this._taken) {
      throw new Error("Slot is already taken");
    }
    this._taken = true;
  }

  free(): void {
    this._taken = false;
  }

  isAvailable(): boolean {
    return !this._taken;
  }

  getDurationInMinutes(): number {
    return (this._endTime.getTime() - this._startTime.getTime()) / (1000 * 60);
  }

  overlaps(other: Slot): boolean {
    return this._startTime <= other._endTime && this._endTime >= other._startTime;
  }

  updateTimes(startTime: Date, endTime: Date): void {
    this.validateTimeRange(startTime, endTime);
    this._startTime = startTime;
    this._endTime = endTime;
  }

  updateMetadata(metadata: any): void {
    this._metadata = metadata;
  }

  private validateTimeRange(startTime: Date, endTime: Date): void {
    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }

    if (startTime < new Date()) {
      throw new Error("Cannot create slot in the past");
    }
  }

  toPlainObject() {
    return {
      id: this._id,
      timetableId: this._timetableId,
      startTime: this._startTime,
      endTime: this._endTime,
      taken: this._taken,
      metadata: this._metadata,
    };
  }

  static fromPlainObject(data: any): Slot {
    return new Slot({
      id: data.id,
      timetableId: data.timetableId,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      taken: data.taken,
      metadata: data.metadata,
    });
  }
}
