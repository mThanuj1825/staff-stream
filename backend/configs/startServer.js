const connectDB = require("./db");

const startServer = async (app, PORT) => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting the server:", err);
    process.exit(1);
  }
};

module.exports = startServer;
