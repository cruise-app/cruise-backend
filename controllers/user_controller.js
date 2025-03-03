const UserService = require("../services/user_services");

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
    await UserService.checkEmail(email);
    res.status(200).json({
      message: "Email sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
