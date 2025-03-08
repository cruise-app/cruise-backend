const router = require("express").Router();
const UserController = require("../controllers/user_controller");
router.post("/register", UserController.registerUser);
router.post("/verify-email", UserController.checkEmail);
router.post("/verify-phoneNumber", UserController.checkPhoneNumber);
router.post("/verify-otp", UserController.verifyOTP);

module.exports = router;
