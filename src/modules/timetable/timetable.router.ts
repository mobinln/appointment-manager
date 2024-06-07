import { Router } from "express";
import { TimeTableInterface } from "./timetable.schema";
import { createTimetableZod } from "./timetable.zod";
import {
  findTimeTable,
  createTimeTable,
  deleteTimeTable,
  findTimeTableById,
  createTimeTableSlots,
  updateTimeTable,
} from "./timetable.manager";
import { editTimeTableZod } from "./zod/editTimeTable.zod";

const router = Router();

router.get("/timetable", async (req, res) => {
  try {
    const timetables = await findTimeTable({
      name: req.query.name as string,
      user: req.query.user as string,
      repeatable:
        req.query.repeatable !== undefined
          ? req.query.repeatable === "true"
          : undefined,
    });
    res.send(timetables);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.patch("/timetable/:id", async (req, res) => {
  try {
    const timetable = await updateTimeTable({
      id: req.params.id,
      data: editTimeTableZod.parse(req.body),
    });

    if (!timetable) {
      res.status(404).send("timetable not found");
    }

    res.send(timetable);
  } catch (error) {
    console.log(error);

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
