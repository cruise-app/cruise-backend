const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../../models/user_model");
require("dotenv").config();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login Attempt:", email);

    // 🛠️ Mongoose syntax
    const user = await UserModel.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("comparing password:", hashedPassword, " ", user.password);
    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        message: "Invalid Credentials",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password not matching");
      return res.status(401).json({
        message: "Invalid Credentials",
        success: false,
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, firstName: user.firstName },
      "b1a7d6c91f5a1a9d47dcd4925e4c5aeb9f7b8a91dfc5d3a1fda5e9e8c1d2a3b7",
      { expiresIn: "7d" }
    );

    console.log("Login successful:", email);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
      success: true,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
