import mongoose from "mongoose";
import dotenv from "dotenv";
import Ticket from "../models/Ticket.js";

dotenv.config();

const dbUri = process.env.MONGO_URI || "mongodb://localhost:27017/crm-helpdesk";

async function main() {
  try {
    await mongoose.connect(dbUri);
    console.log("Connected to DB, creating indexes...");

    await Ticket.createIndexes();

    const indexes = await Ticket.collection.getIndexes();
    console.log("Ticket indexes created:", indexes);

    await mongoose.disconnect();
    console.log("Done. Disconnected from DB.");
  } catch (err) {
    console.error("createIndexes error:", err);
    process.exit(1);
  }
}

main();
