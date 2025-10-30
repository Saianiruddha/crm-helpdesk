// backend/utils/logActivity.js
import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async ({ user, action, model, documentId, changes = {} }) => {
  try {
    await ActivityLog.create({
      user,
      action,
      model,
      documentId,
      changes,
    });
  } catch (err) {
    // avoid crashing the request if logging fails
    console.error("logActivity error:", err?.message || err);
  }
};
