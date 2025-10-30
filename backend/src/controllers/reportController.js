import Ticket from "../models/Ticket.js";
import mongoose from "mongoose";

export const getReportsOverview = async (req, res) => {
  try {
    // 1️⃣ Group by status
    const byStatus = await Ticket.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    // 2️⃣ Group by priority
    const byPriority = await Ticket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $project: { _id: 0, priority: "$_id", count: 1 } },
    ]);

    // 3️⃣ Tickets created per month (last 6 months)
    const monthlyTrends = await Ticket.aggregate([
      {
        $group: {
          _id: { $substr: ["$createdAt", 0, 7] }, // "YYYY-MM"
          tickets: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: "$_id", tickets: 1 } },
    ]);

    res.status(200).json({ byStatus, byPriority, monthlyTrends });
  } catch (error) {
    console.error("Reports Error:", error);
    res.status(500).json({ message: "Failed to generate reports" });
  }
};
