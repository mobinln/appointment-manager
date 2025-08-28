import express from "express";
import config from "dotenv";

import connectMongo from "./utils/mongo.js";
import { logger } from "./utils/logger.js";

import slotsRouter from "./modules/slot/slot.router.js";
import eventRouter from "./modules/event/event.router.js";
import timetableRouter from "./modules/timetable/timetable.router.js";

import { slotCronCreator } from "./jobs/slot.js";

config.config();

async function bootstrap() {
  try {
    const app = express();

    app.use(express.json());

    await connectMongo();
    logger.info({ message: "mongo connected" });

    const slotCron = slotCronCreator();
    slotCron.start();
    logger.info({ message: "slot cron job started" });

    app.use("/api", timetableRouter);
    app.use("/api", slotsRouter);
    app.use("/api", eventRouter);

    const port = process.env.APP_PORT || 3000;
    app.listen(port);
    logger.info({ message: `web server is running at ${port}` });
  } catch (error) {
    logger.error({ message: "error on bootstrapping web server", error });
  }
}

bootstrap();
