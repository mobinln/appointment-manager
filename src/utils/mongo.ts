import mongoose from "mongoose";

const uri = process.env.MONGO_URI || "mongodb://mongodb:27017/appointments";

export default async function connectToMongo() {
  const client = await mongoose.connect(uri);

  return client;
}
