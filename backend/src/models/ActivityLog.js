// backend/models/ActivityLog.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE"],
      required: true,
    },
    model: { type: String, required: true },        // e.g. "Ticket"
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    changes: { type: Object, default: {} },         // { field: { old, new } }
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
