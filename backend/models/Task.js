const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    deadline: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > Date.now();
        },
        message: "Deadline must be in the future",
      },
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    department: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);
