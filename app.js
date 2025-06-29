const express = require("express");
const connectDB = require("./util/mongoDB");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const RegisterUserRouter = require("./routers/register_user_router");
const LoginUserRouter = require("./routers/login_user_router");
const ForgetPasswordRouter = require("./routers/forget_password_router");
const RentalRouter = require("./routers/rental_router");

const { setupRentalSocket } = require("./util/websockets/socketHandlers");

require("dotenv").config();
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
global.io = io;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/register", RegisterUserRouter);
app.use("/login", LoginUserRouter);
app.use("/forget-password", ForgetPasswordRouter);
app.use("/api/rentals", RentalRouter);
app.use("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Car Rental API",
  });
});

connectDB()
  .then(() => {
    // Setup socket handlers
    setupRentalSocket(io);

    server.listen(port, "0.0.0.0", () => {
      console.log(`Car Rental Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }); 