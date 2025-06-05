const TripModel = require("../../models/trip_model");

const GeocodingService = require("../../services/google_maps_services/geocoding_service");
const DistanceMatrixService = require("../../services/google_maps_services/distance_matrix_service");
const DirectionsService = require("../../services/google_maps_services/directions_service");

exports.createTrip = async (req, res) => {
  try {
    const {
      driverId,
      driverUsername,
      startLocationName,
      endLocationName,
      departureTime,
      vehicleType,
    } = req.body;

    if (!startLocationName || !endLocationName) {
      return res.status(400).json({
        message: "Start and end locations are required",
        success: false,
      });
    }

    // Get coordinates for start location
    const startLocationResult = await GeocodingService.getCoordinates(
      startLocationName
    );
    if (!startLocationResult.success) {
      return res.status(400).json({
        message: `Failed to geocode start location: ${startLocationResult.error}`,
        success: false,
      });
    }
    const startLocationPoint = startLocationResult.data;
    console.log("Start Location Point:", startLocationPoint);

    // Get coordinates for end location
    const endLocationResult = await GeocodingService.getCoordinates(
      endLocationName
    );
    if (!endLocationResult.success) {
      return res.status(400).json({
        message: `Failed to geocode end location: ${endLocationResult.error}`,
        success: false,
      });
    }
    const endLocationPoint = endLocationResult.data;
    console.log("End Location Point:", endLocationPoint);

    // Get distance and duration
    const estimatedTripDistanceAndTime =
      await DistanceMatrixService.getTripDistanceAndDuration(
        startLocationPoint,
        endLocationPoint
      );
    console.log("Distance and Duration:", estimatedTripDistanceAndTime);

    // Get polyline
    const polyline = await DirectionsService.getDirections(
      startLocationPoint,
      endLocationPoint
    );
    console.log("Polyline:", polyline);

    const newTrip = new TripModel({
      driverId,
      driverUsername,
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
      vehicleType,
    });

    await newTrip.save();

    return res.status(201).json({
      message: "Trip created successfully",
      success: true,
      data: newTrip,
    });
  } catch (error) {
    console.error("Error creating trip:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
