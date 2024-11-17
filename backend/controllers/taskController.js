const Department = require("../models/Department");
const Task = require("../models/Task");

const getAllTasks = async (req, res) => {
  try {
    const {
      status,
      department,
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = req.query;

    if (!["asc", "desc"].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort order. Use 'asc' or 'desc'.",
      });
    }

    const query = {};
    if (status) {
      if (!["PENDING", "ACTIVE", "COMPLETED", "FAILED"].includes(status)) {
        return res.status(422).json({
          success: false,
          message: "Invalid status",
        });
      }
      query.status = status;
    }

    if (department) {
      const departments = await Department.find().lean().select("_id");
      const validDepartments = departments.map((dept) => dept._id.toString());

      if (!validDepartments.includes(department)) {
        return res.status(422).json({
          success: false,
          message: "Invalid department ID.",
        });
      }

      query.department = department;
    }

    const tasks = await Task.find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .lean()
      .populate("department", "name")
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email");

    return res.status(200).json({
      success: true,
      message: "All tasks fetched successfully",
      tasks,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId)
      .populate("department", "name")
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      task,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const getTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await Task.find({ assignedTo: userId })
      .lean()
      .populate("department", "name")
      .populate("createdBy", "firstName lastName email");

    return res.status(200).json({
      success: true,
      message: "Tasks for user fetched successfully",
      tasks,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const getTasksByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const tasks = await Task.find({ department: departmentId })
      .lean()
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email");

    return res.status(200).json({
      success: true,
      message: "Tasks for department fetched successfully",
      tasks,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  getTasksByUser,
  getTasksByDepartment,
};
