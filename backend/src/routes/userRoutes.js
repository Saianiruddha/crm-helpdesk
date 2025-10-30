import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all users (Admin/Manager only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.role;
    if (!["admin", "manager"].includes(userRole.toLowerCase())) {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({}, "name email role");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
