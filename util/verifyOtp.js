// Inside otp_controller.js
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
      message: "OTP verified successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
