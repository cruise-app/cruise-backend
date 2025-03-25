const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../../models/user_model");
require("dotenv").config();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login Attempt:", email);

    const user = await UserModel.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, firstName: user.firstName },
      "b1a7d6c91f5a1a9d47dcd4925e4c5aeb9f7b8a91dfc5d3a1fda5e9e8c1d2a3b7",
      { expiresIn: "7d" }
    );
    console.log("Login successful:", email);
    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: { id: user.id, userName: user.userName, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
