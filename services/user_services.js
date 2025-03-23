const { where } = require("sequelize");
const UserModel = require("../models/user_model");

class UserService {
  static async registerUser(
    firstName,
    lastName,
    userName,
    password,
    email,
    phoneNumber,
    gender,
    dateOfBirth
  ) {
    try {
      return await UserModel.create({
        firstName,
        lastName,
        userName,
        password,
        email,
        phoneNumber,
        gender,
        dateOfBirth,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async checkEmail(email) {
    return await UserModel.findOne({
      where: { email },
    });
  }

  static async checkPhoneNumber(phoneNumber) {
    return await UserModel.findOne({
      where: { phoneNumber },
    });
  }

  static async checkUsername(userName) {
    return await UserModel.findOne({
      where: { userName },
    });
  }
}

module.exports = UserService;
