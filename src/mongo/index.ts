import mongoose from "mongoose";

const uri = "mongodb://127.0.0.1:27017/appointmentManager";

export default async function connectToMongo() {
  const client = await mongoose.connect(uri);

  return client;
}
