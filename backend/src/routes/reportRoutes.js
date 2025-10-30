import express from "express";
import { getReportsOverview } from "../controllers/reportController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", authMiddleware, authorizeRoles("admin", "manager"), getReportsOverview);

export default router;
