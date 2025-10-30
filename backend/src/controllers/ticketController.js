import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";
import { sendNotification } from "../utils/notify.js"; // 🆕 Added import

/* ==================================================
   CREATE TICKET
   ================================================== */
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      priority,
      status,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
    });

    // 🧾 Log activity
    await logActivity({
      user: req.user.id,
      action: "CREATE",
      model: "Ticket",
      documentId: newTicket._id,
      changes: { created: newTicket },
    });

    // 📨 Notify assigned user (if any)
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        await sendNotification({
          to: assignedUser.email,
          subject: "New Ticket Assigned",
          message: `You have been assigned a new ticket: "${title}".`,
          type: "email",
        });

        await sendNotification({
          to: assignedUser.phone || "N/A",
          subject: "New Ticket Assigned",
          message: `Ticket "${title}" has been assigned to you.`,
          type: "sms",
        });
      }
    }

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ==================================================
   GET ALL TICKETS (Admin/Manager can see all)
   ================================================== */
export const getTickets = async (req, res) => {
  try {
    const filter = {};

    if (["user", "developer", "tester"].includes(req.user.role)) {
      filter.$or = [{ createdBy: req.user._id }, { assignedTo: req.user._id }];
    }

    const tickets = await Ticket.find(filter)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Get Tickets Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* ==================================================
   SEARCH & FILTER TICKETS
   ================================================== */
export const searchTickets = async (req, res) => {
  try {
    const { search, status, assignedTo } = req.query;
    const query = {};

    if (["user", "developer", "tester"].includes(req.user.role)) {
      query.$or = [{ createdBy: req.user._id }, { assignedTo: req.user._id }];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const tickets = await Ticket.find(query)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Search Tickets Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* ==================================================
   UPDATE TICKET STATUS (Admin/Manager Only)
   ================================================== */
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    // 🧾 Log status change
    await logActivity({
      user: req.user.id,
      action: "STATUS_CHANGE",
      model: "Ticket",
      documentId: ticket._id,
      changes: { status: { old: oldStatus, new: status } },
    });

    // 📨 Notify ticket creator and assignee
    const creator = await User.findById(ticket.createdBy);
    const assignee = await User.findById(ticket.assignedTo);

    if (creator) {
      await sendNotification({
        to: creator.email,
        subject: "Ticket Status Updated",
        message: `Your ticket "${ticket.title}" status changed to "${status}".`,
        type: "email",
      });
    }

    if (assignee) {
      await sendNotification({
        to: assignee.email,
        subject: "Ticket Update",
        message: `Ticket "${ticket.title}" is now "${status}".`,
        type: "email",
      });
    }

    const updatedTicket = await Ticket.findById(id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    res.status(200).json({
      message: "Ticket status updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Update Ticket Status Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* ==================================================
   ASSIGN TICKET TO USER (Admin/Manager Only)
   ================================================== */
export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(assignedTo);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const oldAssignee = ticket.assignedTo;
    ticket.assignedTo = assignedTo;
    await ticket.save();

    // 🧾 Log assignment
    await logActivity({
      user: req.user.id,
      action: "UPDATE",
      model: "Ticket",
      documentId: ticket._id,
      changes: { assignedTo: { old: oldAssignee, new: assignedTo } },
    });

    // 📨 Notify new assignee
    await sendNotification({
      to: user.email,
      subject: "Ticket Assigned",
      message: `A new ticket "${ticket.title}" has been assigned to you.`,
      type: "email",
    });

    await sendNotification({
      to: user.phone || "N/A",
      subject: "Ticket Assigned",
      message: `New ticket assigned: "${ticket.title}"`,
      type: "sms",
    });

    const updatedTicket = await Ticket.findById(id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    res.status(200).json({
      message: `Ticket assigned to ${user.name}`,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Assign Ticket Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* ==================================================
   DELETE TICKET (Admin Only)
   ================================================== */
export const deleteTicket = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // 🧾 Log deletion
    await logActivity({
      user: req.user.id,
      action: "DELETE",
      model: "Ticket",
      documentId: id,
      changes: { deleted: ticket },
    });

    // 📨 Notify ticket creator
    const creator = await User.findById(ticket.createdBy);
    if (creator) {
      await sendNotification({
        to: creator.email,
        subject: "Ticket Deleted",
        message: `Your ticket "${ticket.title}" was deleted by admin.`,
        type: "email",
      });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete Ticket Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
