const UserService = require("../../services/user_services");
const generateOTP = require("../../util/generate_otp");
const sendEmail = require("../../util/send_email");
const redis = require("../../util/redis");

exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserService.checkEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "Email not found",
        success: false,
      });
    }

    const otp = generateOTP();
    sendEmail(user.email, otp, "Use this OTP to reset your password");
    redis.setEx(`otp:${user.email}`, 300, otp);

    return res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.verifyOTP = async (req, res) => {
  const { toVerify, otp } = req.body;

  try {
    if (!toVerify) {
      return res.status(400).json({
        message: "Email or phone number is required",
        success: false,
      });
    }

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
      return res.status(401).json({
        message: "Invalid or expired OTP",
        success: false,
      });
    }

    await redis.del(key);

    return res.status(200).json({
      message: "OTP verified, proceed with password reset",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.createNewPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        success: false,
      });
    }

    const user = await UserService.checkEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "Email not found",
        success: false,
      });
    }

    await UserService.updatePassword(email, password);

    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
