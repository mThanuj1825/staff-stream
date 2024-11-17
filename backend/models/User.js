const mongoose = require("mongoose");
const Department = require("./Department");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxlength: [30, "First name cannot exceed 30 characters"],
    },
    middleName: {
      type: String,
      maxlength: [30, "Middle name cannot exceed 30 characters"],
    },
    lastName: {
      type: String,
      required: true,
      maxlength: [30, "Last name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email must be unique"],
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please enter a valid email address",
      ],
      index: true,
    },
    username: {
      type: String,
      unique: [true, "Username must be unique"],
      match: [
        /^[a-zA-Z]{6}@[a-zA-Z-]{4}$/,
        "Username must be in FFFLLL@DDDD format",
      ],
      index: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "EMPLOYEE"],
      index: true,
    },
    department: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const generateUsername = async function () {
  let deptCode = "----";

  if (this.department) {
    const dept = await Department.findById(this.department).lean();
    deptCode = dept ? dept.code.toLowerCase() : "----";
  }

  return (
    this.firstName.substring(0, 3) +
    this.lastName.substring(0, 3) +
    "@" +
    deptCode
  );
};

userSchema.pre("save", async function (next) {
  if (!this.username) {
    this.username = await generateUsername.call(this);
  }

  if (!this.password) {
    this.password = await bcryptjs.hash(this.username, 12);
  }

  if (this.isModified("department")) {
    try {
      this.username = await generateUsername.call(this);
      this.password = await bcryptjs.hash(this.username, 12);
    } catch (err) {
      return next(err);
    }
  }

  next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
