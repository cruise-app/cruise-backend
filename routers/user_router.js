const router = require("express").Router();
const UserController = require("../controllers/user_controller");
router.post("/register", UserController.registerUser);
router.post("/check-email", UserController.checkEmail);
router.post("/check-phoneNumber", UserController.checkPhoneNumber);
router.post("/verify-otp", UserController.verifyOTP);

module.exports = router;
