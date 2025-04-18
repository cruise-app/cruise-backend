const router = require("express").Router();

const CarpoolingController = require("../controllers/carpooling/carpooling_controller");
//const { verifyToken } = require("../middlewares/auth_middleware");

// Create a new trip

// Match suitable trips
router.post("/match-suitable-trips", CarpoolingController.matchSuitableTrips);
router.post("/create-trip", CarpoolingController.createTrip);
//router.post("/join-trip", CarpoolingController.joinTrip);
module.exports = router;
