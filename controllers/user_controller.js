const UserService = require("../services/user_services");
const redis = require("../util/redis");
const sendEmail = require("../util/send_email");
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
  const { email } = req.body;

  try {
    const existingUser = await UserService.checkUser(email);

    if (existingUser) {
      console.log("Email exists");
      res.status(400).json({ error: "Email exists" });
      return;
    }

    const otp = generateOTP();
    await redis.setEx(`otp:${email}`, 300, otp);

    await sendEmail(email, otp, "Email Verification");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP or expired" });
  }

  await redis.del(`otp:${email}`);

  res.json({
    message: "OTP verified, proceed with registeration",
  });
};
