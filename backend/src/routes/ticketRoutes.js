import express from "express";
import {
  createTicket,
  getTickets,
  searchTickets,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
} from "../controllers/ticketController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new ticket (Any logged-in user)
router.post("/", authMiddleware, createTicket);

// Get all tickets
// Admin/Manager → all tickets
// Regular users → only their tickets
router.get("/all", authMiddleware, getTickets);

// Search & Filter tickets
router.get("/", authMiddleware, searchTickets);

// Update ticket status (Admin & Manager only)
router.put(
  "/:id/status",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updateTicketStatus
);

// Assign ticket to a user (Admin & Manager only)
router.put(
  "/:id/assign",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  assignTicket
);

// Delete ticket (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteTicket
);

export default router;
