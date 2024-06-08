import { createClient } from "redis";

export async function createAndConnectRedisClient() {
  const client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  console.log("Redis client connected");

  return client;
}
