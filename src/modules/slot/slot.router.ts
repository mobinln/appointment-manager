import { Router } from "express";
import { findSlots } from "./slot.manager";
import { formatDate } from "../../utils/date";
import { getSlotsZod } from "./zod/getSlots.zod";

const slotRouter = Router();

slotRouter.get("/slot", async (req, res) => {
  try {
    const slots = await findSlots(getSlotsZod.parse(req.query));

    const formatted = slots.map((s) => ({
      ...s.toObject(),
      startTime: formatDate(s.startTime),
      endTime: formatDate(s.endTime),
    }));

    res.send(formatted);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

export default slotRouter;
