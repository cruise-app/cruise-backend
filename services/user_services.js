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
      const user = new UserModel({
        firstName,
        lastName,
        userName,
        password, // Password will be hashed via pre-save hook in the model
        email,
        phoneNumber,
        gender,
        dateOfBirth,
      });

      return await user.save();
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  static async checkEmail(email) {
    return await UserModel.findOne({ email });
  }

  static async checkPhoneNumber(phoneNumber) {
    return await UserModel.findOne({ phoneNumber });
  }

  static async checkUsername(userName) {
    return await UserModel.findOne({ userName });
  }

  static async updatePassword(email, password) {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { password },
        { new: true } // return the updated document
      );

      if (!updatedUser) {
        throw new Error("Password update failed (email not found)");
      }

      return true;
    } catch (error) {
      throw new Error(error.message || "Error updating password");
    }
  }
}

module.exports = UserService;
