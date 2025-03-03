const Sequelize = require("sequelize");
const sequelize = new Sequelize("cruise", "root", "cruise123", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
