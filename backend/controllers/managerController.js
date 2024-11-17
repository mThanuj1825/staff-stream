const Task = require("../models/Task");
const User = require("../models/User");

const createTask = async (req, res) => {
  try {
    const { title, description, deadline, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }
    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: "Deadline is required",
      });
    }

    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Deadline must be in the future",
      });
    }

    let newTask = {
      title,
      deadline: new Date(deadline),
    };

    if (description) {
      newTask = { ...newTask, description };
    }
    if (assignedTo) {
      newTask = { ...newTask, assignedTo };
    }

    const userId = req.body.userId;
    const manager = await User.findById(userId).lean();

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    if (assignedTo) {
      const employee = await User.findById(assignedTo);
      if (
        !employee ||
        employee.department.toString() !== manager.department.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid or unauthorized employee",
        });
      }
    }

    newTask = { ...newTask, department: manager.department, createdBy: userId };

    const createdTask = await Task.create(newTask);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: createdTask,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      deadline,
      status,
      assignedTo,
      department,
      priority,
    } = req.body;
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    let updates = {};
    if (title) {
      updates.title = title;
    }
    if (description) {
      updates.description = description;
    }
    if (deadline) {
      if (new Date(deadline) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Deadline must be in the future",
        });
      }
      updates.deadline = new Date(deadline);
    }
    if (status) {
      const validStatuses = ["PENDING", "ACTIVE", "COMPLETED", "FAILED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }
      updates.status = status;
    }
    if (priority) {
      const validPriorities = ["LOW", "MEDIUM", "HIGH"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority value",
        });
      }
      updates.priority = priority;
    }
    if (assignedTo) {
      const employee = await User.findById(assignedTo);
      if (
        !employee ||
        (department && employee.department.toString() !== department)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid or unauthorized employee",
        });
      }
      updates.assignedTo = assignedTo;
    }
    if (department) {
      updates.department = department;
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
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

module.exports = {
  createTask,
  updateTask,
  deleteTask,
};
