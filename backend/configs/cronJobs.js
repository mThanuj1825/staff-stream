const cron = require("node-cron");
const Task = require("../models/Task");

cron.schedule("0 0 * * *", async () => {
  try {
    const currentTime = new Date();

    const tasks = await Task.find({
      status: { $ne: ["COMPLETED", "FAILED"] },
      deadline: { $lt: currentTime },
    });

    if (tasks.length !== 0) {
      tasks.forEach(async (task) => {
        const updatedTask = await Task.findByIdAndUpdate(
          task._id,
          {
            $set: { status: "FAILED" },
          },
          {
            new: true,
            runValidators: true,
          },
        );
        console.log(
          `Task ${updatedTask._id} marked as FAILED due to expired deadline.`,
        );
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
});

module.exports = cron;
