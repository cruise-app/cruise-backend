const UserService = require("../services/user_services");
const redis = require("../util/redis");
const sendEmail = require("../util/send_email");
const sendSMS = require("../util/send_sms.js");
const generateOTP = require("../util/generate_otp");

exports.registerUser = async (req, res, next) => {
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

    console.log(dateOfBirth);
    console.log(typeof dateOfBirth);
    console.log(userName);
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
    console.log(error);
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.checkUsername = async (req, res, next) => {
  const { userName } = req.body;
  console.log(userName);

  try {
    const existingUser = await UserService.checkUsername(userName);

    if (existingUser) {
      console.log("Username exists");
      return res
        .status(200)
        .json({ message: "Username exists", success: false });
    }

    return res
      .status(200)
      .json({ message: "Username is available", success: true });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ error: error.message, success: false });
  }
};

exports.checkEmail = async (req, res, next) => {
  console.log("checking email");
  const { email } = req.body;
  console.log(email);

  try {
    const existingUser = await UserService.checkEmail(email);
    console.log(existingUser);

    if (existingUser) {
      console.log("Email exists");
      return res.status(409).json({ error: "Email exists" });
    }

    return res.status(200).json({ message: "Email is available" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

exports.sendEmailOTP = async (req, res, next) => {
  const { email } = req.body;
  try {
    const otp = generateOTP();

    // Set timeout to avoid infinite load in case Redis hangs
    const redisPromise = redis.setEx(`otp:${email}`, 300, otp);
    const emailPromise = sendEmail(email, otp, "Email Verification");

    await Promise.race([
      Promise.all([redisPromise, emailPromise]),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: Email verification failed")),
          10000
        )
      ),
    ]);

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.message });
  }
};

exports.checkPhoneNumber = async (req, res, next) => {
  const { phoneNumber } = req.body;
  console.log(phoneNumber);

  try {
    const existingUser = await UserService.checkPhoneNumber(phoneNumber);
    if (existingUser) {
      console.log("Phone number exists");
      return res.status(400).json({ error: "Phone number exists" });
    }

    return res.status(200).json({ message: "Phone number is available" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

exports.sendSMSOTP = async (req, res, next) => {
  const { phoneNumber } = req.body;
  try {
    const otp = generateOTP();
    console.log("Inner log: Sending right now to phone");
    // Set timeout to avoid infinite load
    const redisPromise = redis.setEx(`otp:${phoneNumber}`, 300, otp);
    const smsPromise = sendSMS(phoneNumber, otp, "Phone Number Verification");

    await Promise.race([
      Promise.all([redisPromise, smsPromise]),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: Phone verification failed")),
          10000
        )
      ),
    ]);

    console.log("Inner log: OTP sent to phone number");
    return res.status(200).json({ message: "OTP sent to phone number" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res, next) => {
  const { toVerify, otp } = req.body;

  try {
    if (!toVerify) {
      return res
        .status(400)
        .json({ message: "Email or phone number is required" });
    }
    console.log("Verifying");
    const key = `otp:${toVerify}`;

    // Set timeout in case Redis takes too long
    const storedOtp = await Promise.race([
      redis.get(key),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: Redis failed to respond")),
          5000
        )
      ),
    ]);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP or expired" });
    }

    await redis.del(key);
    return res.json({
      message: "OTP verified, proceed with registration",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};
