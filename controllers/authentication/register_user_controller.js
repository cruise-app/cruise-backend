const UserService = require("../../services/user_services.js");
const sendEmail = require("../../util/send_email.js");
const sendSMS = require("../../util/send_sms.js");
const generateOTP = require("../../util/generate_otp.js");
const OTPModel = require("../../models/otp_model.js");

exports.registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    password,
    confirmPassword,
    userName,
    email,
    phoneNumber,
    gender,
    day,
    month,
    year,
  } = req.body;

  try {
    const dateOfBirth = `${String(year)}-${String(month).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    const user = await UserService.registerUser(
      firstName,
      lastName,
      userName,
      password,
      email,
      phoneNumber,
      gender,
      dateOfBirth
    );

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: "fail",
      message: "User registration failed",
    });
  }
};

exports.checkUsername = async (req, res) => {
  const { userName } = req.body;

  try {
    const existingUser = await UserService.checkUsername(userName);

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username exists", success: false });
    }

    return res
      .status(200)
      .json({ message: "Username is available", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await UserService.checkEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: "Email exists" });
    }

    return res.status(200).json({ message: "Email is available" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.sendEmailOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Promise.race([
      OTPModel.findOneAndUpdate(
        { identifier: email },
        { otp, expiresAt },
        { upsert: true, new: true }
      ).then(() => sendEmail(email, otp, "Email Verification")),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: Email verification failed")),
          10000
        )
      ),
    ]);

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

exports.checkPhoneNumber = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const existingUser = await UserService.checkPhoneNumber(phoneNumber);

    if (existingUser) {
      return res.status(409).json({ message: "Phone number exists" });
    }

    return res.status(200).json({ message: "Phone number is available" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.sendSMSOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Promise.race([
      OTPModel.findOneAndUpdate(
        { identifier: phoneNumber },
        { otp, expiresAt },
        { upsert: true, new: true }
      ).then(() => sendSMS(phoneNumber, otp, "Phone Number Verification")),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: SMS verification failed")),
          10000
        )
      ),
    ]);

    return res.status(200).json({ message: "OTP sent to phone number" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { toVerify, otp } = req.body;

  try {
    if (!toVerify) {
      return res
        .status(400)
        .json({ message: "Email or phone number is required" });
    }

    const otpDoc = await Promise.race([
      OTPModel.findOne({ identifier: toVerify }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout: DB query failed")), 5000)
      ),
    ]);

    if (!otpDoc || otpDoc.otp !== otp || new Date() > otpDoc.expiresAt) {
      return res.status(401).json({ message: "Invalid OTP or expired" });
    }

    await OTPModel.deleteOne({ identifier: toVerify });

    return res
      .status(200)
      .json({ message: "OTP verified, proceed with registration" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
