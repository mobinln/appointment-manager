import express from "express";
import config from "dotenv";

import redisClient from "./src/redis";
import connectMongo from "./src/mongo";

import timetableRouter from "./src/modules/timetable/timetable.router";
import slotsRouter from "./src/modules/slot/slot.router";
import eventRouter from "./src/modules/event/event.router";

config.config();

async function bootstrap() {
  const app = express();

  app.use(express.json());

  await redisClient.connect();
  console.log("redis connected");

  await connectMongo();
  console.log("mongo connected");

  app.use("/api", timetableRouter);
  app.use("/api", slotsRouter);
  app.use("/api", eventRouter);

  app.listen(3001);
  console.log("Server is up in port", 3001);
}

bootstrap();
