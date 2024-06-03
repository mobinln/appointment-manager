import { Router } from "express";
import { createEvent, findEvents } from "./event.manager";
import { createEventZod } from "./zod/createEvent.zod";
import { createErrorMessage } from "../../utils/messages";

const eventRouter = Router();

eventRouter.get("/event", async (req, res) => {
  try {
    const events = await findEvents({
      member: req.query.member as string,
      slotId: req.query.slotId as string,
      status: req.query.status as string,
      title: req.query.title as string,
    });
    res.send(events);
  } catch (error) {
    res.status(500).send(error);
  }
});

eventRouter.post("/event", async (req, res) => {
  try {
    const body = createEventZod.parse(req.body);
    const newEvent = await createEvent(body);
    res.send(newEvent);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(createErrorMessage(error));
    }
  }
});

export default eventRouter;
