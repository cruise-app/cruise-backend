const TripModel = require("../../models/trip_schema");
const findSuitableTrips = require("../../util/match_trips");
const GeocodingService = require("../../services/google_maps_services/geocoding_service");
const DistanceMatrixService = require("../../services/google_maps_services/distance_matrix_service");
const DirectionsService = require("../../services/google_maps_services/directions_service");

exports.createTrip = async (req, res) => {
  try {
    const {
      driverId,
      startLocationName,
      endLocationName,
      departureTime,
      //estimatedTripTime,
      //estimatedTripDistance,
      //polyline,
      //listOfPassengers,
    } = req.body;
    console.log(startLocationName, endLocationName, departureTime);
    if (!startLocationName || !endLocationName) {
      return res.status(400).json({
        message: "Start and end locations are required",
        success: false,
      });
    }
    startLocationPoint = await GeocodingService.getCoordinates(
      startLocationName
    );
    console.log(startLocationPoint); // Assuming you have a function to get the start location point
    endLocationPoint = await GeocodingService.getCoordinates(endLocationName);
    console.log(endLocationPoint); // Assuming you have a function to get the end location point
    estimatedTripDistanceAndTime =
      await DistanceMatrixService.getTripDistanceAndDuration(
        startLocationPoint,
        endLocationPoint
      );
    console.log(estimatedTripDistanceAndTime); // Assuming you have a function to get the estimated trip distance
    polyline = await DirectionsService.getDirections(
      startLocationPoint,
      endLocationPoint
    ); // Assuming you have a function to generate the polyline

    console.log(polyline);

    const newTrip = new TripModel({
      driverId,
      startLocationPoint: {
        type: "Point",
        coordinates: [
          startLocationPoint.longitude,
          startLocationPoint.latitude,
        ],
      },
      startLocationName,
      endLocationPoint: {
        type: "Point",
        coordinates: [endLocationPoint.longitude, endLocationPoint.latitude],
      },
      endLocationName,
      departureTime,
      estimatedTripTime: estimatedTripDistanceAndTime.duration,
      estimatedTripDistance: estimatedTripDistanceAndTime.distance,
      polyline,
      listOfPassengers: [],
    });

    await newTrip.save();

    return res.status(201).json({
      message: "Trip created successfully",
      success: true,
      data: newTrip,
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.matchSuitableTrips = async (req, res) => {
  try {
    const {
      passengerPickup,
      passengerDropoff,
      maxPickupDistance,
      maxDropoffDistance,
    } = req.body;

    if (!passengerPickup || !passengerDropoff) {
      return res.status(400).json({
        message: "Passenger pickup and dropoff locations are required",
        success: false,
      });
    }
    const passengerPickupCoordinates = {
      latitude: passengerPickup[0],
      longitude: passengerPickup[1],
    };
    const passengerDropoffCoordinates = {
      latitude: passengerDropoff[0],
      longitude: passengerDropoff[1],
    };
    const suitableTrips = await findSuitableTrips(
      passengerPickupCoordinates,
      passengerDropoffCoordinates,
      maxPickupDistance,
      maxDropoffDistance
    );

    if (suitableTrips.length === 0) {
      return res.status(404).json({
        message: "No suitable trips found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Suitable trips found",
      success: true,
      data: suitableTrips,
    });
  } catch (error) {
    console.error("Error matching trips:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
