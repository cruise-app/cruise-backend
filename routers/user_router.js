const router = require("express").Router();
const UserController = require("../controllers/register_user_controller");
router.post("/register", UserController.registerUser);
router.post("/check-email", UserController.checkEmail);
router.post("/check-phoneNumber", UserController.checkPhoneNumber);
router.post("/verify-otp", UserController.verifyOTP);
router.post("/send-email-otp", UserController.sendEmailOTP);
router.post("/send-sms-otp", UserController.sendSMSOTP);

module.exports = router;
