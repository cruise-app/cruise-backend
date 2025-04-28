const router = require("express").Router();

const CreateTripController = require("../controllers/carpooling/create_trip_controller");
const MatchTripsController = require("../controllers/carpooling/match_trips_controller");
const JoinTripController = require("../controllers/carpooling/join_trip_controller");
const GetSuggestedLocationsController = require("../controllers/carpooling/get_suggested_locations_controller");
//const { verifyToken } = require("../middlewares/auth_middleware");

// Create a new trip

// Match suitable trips
router.post("/match-suitable-trips", MatchTripsController.matchSuitableTrips);
router.post("/create-trip", CreateTripController.createTrip);
router.post(
  "/get-suggested-locations",
  GetSuggestedLocationsController.getSuggestedLocations
);
router.post("/join-trip", JoinTripController.joinTrip);
module.exports = router;
