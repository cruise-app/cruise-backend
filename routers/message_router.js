const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message_controller");

// Get all messages for a specific trip
router.get("/:tripId", messageController.getMessages);

module.exports = router;
