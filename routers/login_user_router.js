const router = require("express").Router();
const LoginUserController = require("../controllers/login_user_controller");

router.post("/login", LoginUserController.login);

module.exports = router;
