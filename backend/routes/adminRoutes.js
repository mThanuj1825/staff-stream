const express = require("express");
const {
  createDepartment,
  updateDepartment,
  updateUser,
  createUser,
  getAllDepartments,
  getAllUsers,
  deleteUser,
  deleteDepartment,
} = require("../controllers/adminController");
const isAdmin = require("../middlewares/isAdmin");

const adminRouter = express.Router();

adminRouter.use(isAdmin);

adminRouter.get("/department", getAllDepartments);
adminRouter.get("/user", getAllUsers);

adminRouter.post("/department", createDepartment);
adminRouter.post("/user", createUser);

adminRouter.patch("/department/:departmentId", updateDepartment);
adminRouter.patch("/user/:userId", updateUser);

adminRouter.delete("/department/:departmentId", deleteDepartment);
adminRouter.delete("/user/:userId", deleteUser);

module.exports = adminRouter;
