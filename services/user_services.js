const { where } = require("sequelize");
const UserModel = require("../models/user_model");
const bcrypt = require("bcrypt");

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

  static async updatePassword(email, password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [updated] = await UserModel.update(
        { password: hashedPassword },
        { where: { email } }
      );

      if (updated === 0) {
        throw new Error("Password update failed (email not found)");
      }

      return true;
    } catch (error) {
      throw new Error(error.message || "Error updating password");
    }
  }
}

module.exports = UserService;
