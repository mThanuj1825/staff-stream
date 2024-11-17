const express = require("express");
const isManager = require("../middlewares/isManager");
const {
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/managerController");

const managerRouter = express.Router();

managerRouter.use(isManager);

managerRouter.post("/task", createTask);
managerRouter.patch("/task/:taskId", updateTask);
managerRouter.delete("/task/:taskId", deleteTask);

module.exports = managerRouter;
