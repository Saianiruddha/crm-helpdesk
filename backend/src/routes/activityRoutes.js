import express from "express";
import { getActivities } from "../controllers/activityController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Allow only Admins and Managers to view activity logs
router.get("/", authMiddleware, authorizeRoles("admin", "manager"), getActivities);

export default router;
