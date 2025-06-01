const router = require("express").Router();

const CreateTripController = require("../controllers/carpooling/create_trip_controller");
const MatchTripsController = require("../controllers/carpooling/match_trips_controller");
const JoinTripController = require("../controllers/carpooling/join_trip_controller");
const GetSuggestedLocationsController = require("../controllers/carpooling/get_suggested_locations_controller");
const GetTripRouteController = require("../controllers/carpooling/get_trip_route_controller");
const SearchTripController = require("../controllers/carpooling/search_trips_controller");

//const { verifyToken } = require("../middlewares/auth_middleware");

// Create a new trip

// Match suitable trips
router.post("/match-suitable-trips", MatchTripsController.matchSuitableTrips);
router.post("/create-trip", CreateTripController.createTrip);
router.post(
  "/get-suggested-locations",
  GetSuggestedLocationsController.getSuggestedLocations
);
router.get("/get-trip-route", GetTripRouteController.getTripRoute);
router.post("/join-trip", JoinTripController.joinTrip);
router.get("/search-trips", SearchTripController.searchTrips);

module.exports = router;
