// ping-mongo.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

async function run() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const result = await client.db("admin").command({ ping: 1 });
    console.log("Ping response:", result);
  } catch (err) {
    console.error("Ping failed:", err);
  } finally {
    await client.close();
  }
}

run();
