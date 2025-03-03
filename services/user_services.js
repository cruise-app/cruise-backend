const UserModel = require("../models/user_model");

class UserService {
  static async registerUser(
    firstName,
    lastName,
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
  static async checkUser(email) {
    return await UserModel.findOne({ where: { email } });
  }
}

module.exports = UserService;
