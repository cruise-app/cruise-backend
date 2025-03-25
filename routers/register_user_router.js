const router = require("express").Router();
const RegisterUserController = require("../controllers/authentication/register_user_controller");
router.post("/register", RegisterUserController.registerUser);
router.post("/check-email", RegisterUserController.checkEmail);
router.post("/check-phoneNumber", RegisterUserController.checkPhoneNumber);
router.post("/check-username", RegisterUserController.checkUsername);
router.post("/verify-otp", RegisterUserController.verifyOTP);
router.post("/send-email-otp", RegisterUserController.sendEmailOTP);
router.post("/send-sms-otp", RegisterUserController.sendSMSOTP);

module.exports = router;
