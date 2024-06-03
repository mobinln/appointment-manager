import { Router } from "express";
import { TimeTableInterface } from "./timetable.schema";
import { createTimetableZod } from "./timetable.zod";
import {
  findTimeTable,
  createTimeTable,
  deleteTimeTable,
  findTimeTableById,
  createTimeTableSlots,
} from "./timetable.manager";

const router = Router();

router.get("/timetable", async (req, res) => {
  try {
    const timetables = await findTimeTable();
    res.send(timetables);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/timetable/:id", async (req, res) => {
  try {
    const timetable = await findTimeTableById(req.params.id);

    if (!timetable) {
      res.status(404).send("timetable not found");
    }

    res.send(timetable);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
});

router.post("/timetable", async (req, res) => {
  try {
    const body = createTimetableZod.parse(req.body) as TimeTableInterface;
    const newTimetable = await createTimeTable(body);

    await createTimeTableSlots(newTimetable);

    res.send(newTimetable);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/timetable/:id", async (req, res) => {
  try {
    await deleteTimeTable(req.params.id);

    res.send({ msg: "done" });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
