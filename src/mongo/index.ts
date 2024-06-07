import { config } from "dotenv";
import mongoose from "mongoose";
config();

const uri = `mongodb://127.0.0.1:${process.env.MONGO_PORT}/appointmentManager`;

export default async function connectToMongo() {
  const client = await mongoose.connect(uri);

  return client;
}
