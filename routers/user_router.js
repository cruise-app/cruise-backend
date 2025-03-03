const router = require("express").Router();
const UserController = require("../controllers/user_controller");
router.post("/register", UserController.registerUser);
router.post("/check-email", UserController.checkEmail);

module.exports = router;
