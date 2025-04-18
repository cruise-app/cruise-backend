const express = require("express");
const connectDB = require("./util/mongoDB");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const RegisterUserRouter = require("./routers/register_user_router");
const LoginUserRouter = require("./routers/login_user_router");
const ForgetPasswordRouter = require("./routers/forget_password_router");
const CarpoolingRouter = require("./routers/carpooling_router");
const port = 3000;
// const path = require('path');
// const bodyParser = require('body-parser');
//const rootDir = require('./util/path');

const app = express();

app.use(bodyParser.json());
app.use("/register", RegisterUserRouter);
app.use("/login", LoginUserRouter);
app.use("/forget-password", ForgetPasswordRouter);
app.use("/carpooling", CarpoolingRouter);
// app.use(express.static(path.join(rootDir, 'public')));

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  });
