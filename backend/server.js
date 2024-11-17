const express = require("express");
const cors = require("cors");
const adminRouter = require("./routes/adminRoutes");
const authRouter = require("./routes/authRoutes");
const employeeRouter = require("./routes/employeeRoutes");
const managerRouter = require("./routes/managerRoutes");
const taskRouter = require("./routes/taskRoutes");
const startServer = require("./configs/startServer");
require("./configs/cronJobs");
require("dotenv").config();

const PORT = process.env.PORT || 3333;

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/manager", managerRouter);
app.use("/api/task", taskRouter);

startServer(app, PORT);
