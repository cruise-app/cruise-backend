const UserService = require("../../services/user_services");
const generateOTP = require("../../util/generate_otp");
const sendEmail = require("../../util/send_email");
const OTPModel = require("../../models/otp_model");

exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserService.checkEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not found", success: false });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 mins

    // Save or update OTP
    await OTPModel.findOneAndUpdate(
      { identifier: email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP
    await sendEmail(email, otp, "Use this OTP to reset your password");

    return res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { toVerify, otp } = req.body;

    if (!toVerify || !otp) {
      return res
        .status(400)
        .json({ message: "Identifier and OTP are required", success: false });
    }

    const storedOtpDoc = await OTPModel.findOne({ identifier: toVerify });

    if (!storedOtpDoc) {
      return res
        .status(404)
        .json({ message: "No OTP found for this user", success: false });
    }

    if (storedOtpDoc.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP", success: false });
    }

    // OTP is valid, delete it
    await OTPModel.deleteOne({ identifier: toVerify });

    return res.status(200).json({
      message: "OTP verified successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createNewPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match", success: false });
    }

    const user = await UserService.checkEmail(email);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not found", success: false });
    }

    await UserService.updatePassword(email, password);

    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
