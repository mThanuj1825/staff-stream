const express = require("express");
const authenticateUser = require("../middlewares/authenticateUser");
const {
  acceptTask,
  completeTask,
} = require("../controllers/employeeController");

const employeeRouter = express.Router();

employeeRouter.use(authenticateUser);

employeeRouter.patch("/accept-task/:taskId", acceptTask);
employeeRouter.patch("/complete-task/:taskId", completeTask);

module.exports = employeeRouter;
