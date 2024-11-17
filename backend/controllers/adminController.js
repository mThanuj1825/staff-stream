const Department = require("../models/Department");
const Task = require("../models/Task");
const User = require("../models/User");
const bcryptjs = require("bcryptjs");

const createDepartment = async (req, res) => {
  try {
    const { name, code, manager } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Department Code is required",
      });
    }

    const codeRegex = /^[A-Z]{4}$/;
    if (!codeRegex.test(code)) {
      return res.status(422).json({
        success: false,
        message: "Department Code must be in AAAA format",
      });
    }

    const existingName = await Department.findOne({ name }).lean();
    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "Department Name already assigned",
      });
    }

    const existingCode = await Department.findOne({ code }).lean();
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: "Department Code already assigned",
      });
    }

    let department = {
      name,
      code,
    };

    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser) {
        return res.status(404).json({
          success: false,
          message: "Manager not found",
        });
      }

      if (managerUser.department) {
        return res.status(409).json({
          success: false,
          message: "Manager already assigned",
        });
      }

      department.manager = manager;
    }

    const createdDepartment = await Department.create(department);

    res.status(201).json({
      success: true,
      message: "Department Created Successfully",
      department: createdDepartment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      username,
      password,
      department,
      role,
    } = req.body;

    if (!firstName) {
      return res.status(400).json({
        success: false,
        message: "First Name is required",
      });
    }
    if (!lastName) {
      return res.status(400).json({
        success: false,
        message: "Last Name is required",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(422).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const validRoles = ["EMPLOYEE", "MANAGER", "ADMIN"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role value",
      });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    let newUser = {
      firstName,
      lastName,
      email,
      role,
    };

    if (username) {
      const existingUsername = await User.findOne({ username });

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username already exists",
        });
      }
      newUser = { ...newUser, username };
    }
    if (password) {
      const hashedPassword = await bcryptjs.hash(password, 12);
      newUser = { ...newUser, password: hashedPassword };
    }
    if (department) {
      const departmentRecord = await Department.findById(department);

      if (!departmentRecord) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      if (role === "MANAGER" && departmentRecord.manager) {
        return res.status(409).json({
          success: false,
          message: "Department already has a manager",
        });
      }

      newUser = { ...newUser, department };
    }
    if (middleName) {
      newUser = { ...newUser, middleName };
    }

    const createdUser = await User.create(newUser);

    if (department && role === "MANAGER") {
      departmentRecord.manager = createdUser._id;
      await departmentRecord.save();
    }

    res.status(201).json({
      success: true,
      message: `${role} Created Successfully`,
      user: createdUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name, code, manager } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (name) {
      department.name = name;
    }
    if (code) {
      department.code = code;
    }

    if (manager) {
      const managerDocument = await User.findById(manager);

      if (!managerDocument) {
        return res.status(404).json({
          success: false,
          message: "Manager not found",
        });
      }

      if (managerDocument.role !== "MANAGER") {
        return res.status(403).json({
          success: false,
          message: "User is not a manager",
        });
      }

      if (department.manager) {
        const oldManager = await User.findById(department.manager);
        if (oldManager) {
          oldManager.department = null;
          await oldManager.save();
        }
      }

      department.manager = manager;
      managerDocument.department = departmentId;
      await managerDocument.save();
    } else {
      department.manager = null;
    }

    await department.save();

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, middleName, lastName, email, username, department } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (firstName) {
      user.firstName = firstName;
    }
    if (middleName) {
      user.middleName = middleName;
    }
    if (lastName) {
      user.lastName = lastName;
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        return res.status(422).json({
          success: false,
          message: "Invalid email format",
        });
      }
      user.email = email;
    }
    if (username) {
      user.username = username;
    }
    if (department) {
      const departmentRecord = await Department.findById(department);

      if (!departmentRecord) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }

      if (user.role === "MANAGER") {
        if (
          departmentRecord.manager &&
          departmentRecord.manager.toString() !== userId
        ) {
          return res.status(409).json({
            success: false,
            message: "Department already has a different manager",
          });
        }

        const previousDepartment = user.department;
        user.department = department;

        departmentRecord.manager = userId;
        await departmentRecord.save();

        if (
          previousDepartment &&
          previousDepartment.toString() !== department
        ) {
          const oldDepartmentRecord = await Department.findById(
            previousDepartment,
          );
          if (oldDepartmentRecord) {
            oldDepartmentRecord.manager = null;
            await oldDepartmentRecord.save();
          }
        }
      } else {
        user.department = department;
      }
    } else {
      user.department = null;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().lean().populate("manager");

    return res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      departments,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .lean()
      .populate("department")
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const tasksInDepartment = await Task.find({ department: departmentId });
    if (tasksInDepartment.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete department as there are tasks assigned to it",
      });
    }

    await User.updateMany(
      { department: departmentId },
      { $set: { department: null } },
    );

    const dept = await Department.findByIdAndDelete(departmentId);

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      department: dept,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const tasksRelatedToUser = await Task.find({
      $or: [{ assignedTo: userId }, { createdBy: userId }],
    });
    if (tasksRelatedToUser.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete user as they have tasks related to them. Please reassign or delete the tasks first.",
      });
    }

    if (user.role === "EMPLOYEE") {
      await Task.updateMany(
        { assignedTo: userId },
        { $set: { assignedTo: null, status: "PENDING" } },
      );
    }

    if (user.role === "MANAGER") {
      await Task.updateMany(
        { createdBy: userId },
        { $set: { createdBy: null } },
      );
    }

    const usr = await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: usr,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  createDepartment,
  createUser,
  updateDepartment,
  updateUser,
  getAllDepartments,
  getAllUsers,
  deleteDepartment,
  deleteUser,
};
