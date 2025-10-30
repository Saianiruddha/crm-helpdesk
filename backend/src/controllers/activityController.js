import Activity from "../models/ActivityLog.js";

export const getActivities = async (req, res) => {
  try {
    const { search, action } = req.query;
    const filter = {};

    // Filter by action type
    if (action) {
      filter.action = action;
    }

    // Optional text search (by model name)
    if (search) {
      filter.$or = [{ model: new RegExp(search, "i") }];
    }

    // ✅ Populate user to show name/email/role in frontend
    const activities = await Activity.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(50); // latest 50 entries

    res.status(200).json(activities);
  } catch (error) {
    console.error("Get Activities Error:", error);
    res.status(500).json({ message: "Failed to load activity logs" });
  }
};
