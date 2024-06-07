import { Router } from "express";
import { createSlot, findSlots } from "./slot.manager";
import { formatDate } from "../../utils/date";
import { getSlotsZod } from "./zod/getSlots.zod";
import { createSlotZod } from "./zod/createSlot.zod";

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

slotRouter.post("/slot", async (req, res) => {
  try {
    const slot = await createSlot(createSlotZod.parse(req.body));

    res.send(slot);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

export default slotRouter;
