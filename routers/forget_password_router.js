const router = require("express").Router();

const ForgetPasswordController = require("../controllers/authentication/forget_password_controller");

router.post("/verify-email", ForgetPasswordController.verifyEmail);

router.post("/verify-otp", ForgetPasswordController.verifyOTP);

router.post("/create-new-password", ForgetPasswordController.createNewPassword);

module.exports = router;
