const express = require("express");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const userRouter = require("./routers/user_router");
const port = 3000;
// const path = require('path');
// const bodyParser = require('body-parser');
//const rootDir = require('./util/path');

const app = express();

app.use(bodyParser.json());
app.use("/", userRouter);
// app.use(express.static(path.join(rootDir, 'public')));
const User = require("./models/user_model");

sequelize
  .sync()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
