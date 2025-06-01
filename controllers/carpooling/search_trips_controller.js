const TripService = require("../../services/trip_service");

exports.searchTrips = async (req, res) => {
  try {
    const { departureLocation, destinationLocation, maxDistance } = req.body;
    if (!departureLocation || !destinationLocation) {
      return res.status(400).json({
        message: "Departure location and destination location are required",
        success: false,
      });
    }

    const result = await TripService.searchTrips(
      departureLocation,
      destinationLocation,
      maxDistance
    );
    console.log("HERE");

    if (!result.success) {
      return res.status(400).json({
        message: result.error || "Error searching trips",
        success: false,
      });
    }

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        message: "No trips found matching the criteria",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Trips found successfully",
      success: true,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message || "An unexpected error occurred",
    });
  }
};
