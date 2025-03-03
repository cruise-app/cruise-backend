const UserModel = require("../models/user_model");
const sendEmail = require("../util/send_email");
const generateOTP = require("../util/generate_otp");
const redis = require("../util/redis");
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

  static async checkEmail(email) {
    const existingUser = await UserModel.findOne({ where: { email } });
    console.log(existingUser);
    if (existingUser) {
      throw new Error("Email already exists");
    }
    try {
      console.log("Redis is working");
      const otp = generateOTP();
      console.log(otp);
      console.log(email);
      await redis.setEx(`otp:${email}`, 300, otp);
      console.log("Redis is working");
      await sendEmail(email, otp, "Email Verification");
      return;
    } catch (error) {
      throw new Error("Error sending OTP. Please try again");
    }
    // 5 minutes
  }
}

module.exports = UserService;
