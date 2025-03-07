const UserService = require("../services/user_services");
const redis = require("../util/redis");
const sendEmail = require("../util/send_email");
const sendSMS = require("../util/send_sms");
const generateOTP = require("../util/generate_otp");

exports.registerUser = async (req, res, next) => {
  const {
    firstName,
    lastName,
    password,
    confirmPassword,
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

    const user = await UserService.registerUser(
      firstName,
      lastName,
      password,
      email,
      phoneNumber,
      gender,
      dateOfBirth
    );

    return res.status(201).json({
      message: "User created successfully",
      userId: user.id,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
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
      return res.status(400).json({ error: "Email exists" });
    }

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
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
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

    const otp = generateOTP();

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

    console.log("OTP sent to phone number");
    return res.status(200).json({ message: "OTP sent to phone number" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res, next) => {
  const { email, phoneNumber, otp } = req.body;

  try {
    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({ message: "Email or phone number is required" });
    }

    const key = email ? `otp:${email}` : `otp:${phoneNumber}`;

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
