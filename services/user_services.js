const UserModel = require("../models/user_model");
const sendEmail = require("./send_email");
const generateOTP = require("./generate_otp");
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

}


module.exports = UserService;
