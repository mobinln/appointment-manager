import { Router } from "express";
import {
  cancelEvent,
  changeEventStatus,
  createEvent,
  deleteEvent,
  findEvents,
  rejectEventByMember,
  rejectEventByUser,
  rescheduleEvent,
} from "./event.manager.js";
import { createEventZod } from "./zod/createEvent.zod.js";
import { createErrorMessage, createSimpleMessage } from "../../utils/messages.js";
import { rescheduleEventZod } from "./zod/rescheduleEvent.zod.js";
import { rejectByMemberZod } from "./zod/rejectByMember.zod.js";
import { rejectByUserZod } from "./zod/rejectByUser.zod.js";

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

eventRouter.post("/event/:id/reschedule", async (req, res) => {
  try {
    const body = rescheduleEventZod.parse({ eventId: req.params.id, ...req.body });
    const event = await rescheduleEvent(body);

    res.send(event);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error);
    }
  }
});

eventRouter.post("/event/:id/reject-by-member", async (req, res) => {
  try {
    const event = await rejectEventByMember(
      rejectByMemberZod.parse({
        eventId: req.params.id,
        ...req.body,
      })
    );

    res.send(event);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error);
    }
  }
});

eventRouter.post("/event/:id/reject-by-user", async (req, res) => {
  try {
    const event = await rejectEventByUser(
      rejectByUserZod.parse({
        eventId: req.params.id,
        ...req.body,
      })
    );

    res.send(event);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error);
    }
  }
});

eventRouter.post("/event/:id/cancel", async (req, res) => {
  try {
    await cancelEvent(req.params.id);

    res.send(createSimpleMessage({ message: "done" }));
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error);
    }
  }
});

eventRouter.post("/event/:id/accept", async (req, res) => {
  try {
    const event = await changeEventStatus({
      eventId: req.params.id,
      status: "accepted",
    });

    res.send(event);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error);
    }
  }
});

eventRouter.post("/event/:id/done", async (req, res) => {
  try {
    const event = await changeEventStatus({
      eventId: req.params.id,
      status: "done",
    });

    res.send(event);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error);
    }
  }
});

eventRouter.post("/event/:id/archive", async (req, res) => {
  try {
    const event = await changeEventStatus({
      eventId: req.params.id,
      status: "archived",
    });

    res.send(event);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error);
    }
  }
});

eventRouter.delete("/event/:id", async (req, res) => {
  try {
    await deleteEvent(req.params.id);
    res.send(createSimpleMessage({ message: "done" }));
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error);
    }
  }
});

export default eventRouter;
