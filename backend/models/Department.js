const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      match: [/^[a-zA-Z]{4}$/, "Code must be in AAAA format"],
      index: true,
    },
    manager: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.Department || mongoose.model("Department", departmentSchema);
