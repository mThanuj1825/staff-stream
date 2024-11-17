const Task = require("../models/Task");
const User = require("../models/User");

const updateTaskStatus = async (taskId, userId, status, res) => {
  try {
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingTask.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Task not assigned to User",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: `${status} the task`,
      task: updatedTask,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const acceptTask = (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;

  return updateTaskStatus(taskId, userId, "ACTIVE", res);
};

const completeTask = (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;

  return updateTaskStatus(taskId, userId, "COMPLETED", res);
};

module.exports = {
  acceptTask,
  completeTask,
};
