import express from "express";
import config from "dotenv";

import connectMongo from "./src/mongo";

import timetableRouter from "./src/modules/timetable/timetable.router";
import slotsRouter from "./src/modules/slot/slot.router";
import eventRouter from "./src/modules/event/event.router";

import { slotCronCreator } from "./src/cron/slot.cron";

config.config();

async function bootstrap() {
  const app = express();

  app.use(express.json());

  await connectMongo();
  console.log("mongo connected");

  const slotCron = slotCronCreator();
  slotCron.start();

  app.use("/api", timetableRouter);
  app.use("/api", slotsRouter);
  app.use("/api", eventRouter);

  app.listen(3000);
  console.log("Server is up in port", 3000);
}

bootstrap();
