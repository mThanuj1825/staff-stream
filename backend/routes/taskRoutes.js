const express = require("express");
const {
  getAllTasks,
  getTaskById,
  getTasksByUser,
  getTasksByDepartment,
} = require("../controllers/taskController");

const taskRouter = express.Router();

taskRouter.get("/", getAllTasks);
taskRouter.get("/task/:taskId", getTaskById);
taskRouter.get("/user/:userId", getTasksByUser);
taskRouter.get("/department/:departmentId", getTasksByDepartment);

module.exports = taskRouter;
