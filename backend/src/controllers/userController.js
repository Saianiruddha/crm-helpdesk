import User from "../models/User.js";

// Get all users (for dropdowns, admin view, etc.)
export const getAllUsers = async (req, res) => {
  try {
    // Only allow Admins/Managers to view all users
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({}, "name email role"); // only select needed fields
    res.status(200).json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
