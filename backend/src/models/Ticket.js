import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    // Ticket Title (Required)
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
    },

    // Description (Optional)
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Status - controlled by Admin/Manager
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },

    // Assigned To - references another User
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Created By - the user who created the ticket
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "CreatedBy is required"],
    },

    // Optional tags (for categorization)
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Text Index for Full-Text Search on Title + Description
ticketSchema.index({ title: "text", description: "text" });

// Compound Index for Efficient Filtering
ticketSchema.index({ status: 1, createdBy: 1, createdAt: -1 });

// Auto-update `updatedAt` before save
ticketSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Populate common fields automatically when querying
ticketSchema.pre(/^find/, function (next) {
  this.populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");
  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
