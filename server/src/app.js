
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const reportRoutes = require("./routes/report.routes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN
}));

app.use(express.json());

// Reports API
app.use("/api/v1/reports", reportRoutes);

// Health API
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "FindBack Ethiopia API is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

async function startServer() {
  await connectDB();

  const PORT = process.env.PORT || 5001;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
