const express = require("express");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const RegisterUserRouter = require("./routers/register_user_router");
const LoginUserRouter = require("./routers/login_user_router");
const ForgetPasswordRouter = require("./routers/forget_password_router");
const port = 3000;
// const path = require('path');
// const bodyParser = require('body-parser');
//const rootDir = require('./util/path');

const app = express();

app.use(bodyParser.json());
app.use("/register", RegisterUserRouter);
app.use("/login", LoginUserRouter);
app.use("/forget-password", ForgetPasswordRouter);
// app.use(express.static(path.join(rootDir, 'public')));
const User = require("./models/user_model");

sequelize
  .sync({ force: false })
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
