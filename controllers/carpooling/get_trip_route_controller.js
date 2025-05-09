const polyline = require("@mapbox/polyline");
const GeocodingService = require("../../services/google_maps_services/geocoding_service");
const DirectionsService = require("../../services/google_maps_services/directions_service");

exports.getTripRoute = async (req, res) => {
  try {
    const { startLocationName, endLocationName } = req.body;

    if (!startLocationName || !endLocationName) {
      return res.status(400).json({
        message: "Start and end locations are required",
        success: false,
      });
    }

    // Get coordinates
    const startLocationPoint = await GeocodingService.getCoordinates(
      startLocationName
    );
    const endLocationPoint = await GeocodingService.getCoordinates(
      endLocationName
    );

    // Get encoded polyline from directions API
    const encodedPolyline = await DirectionsService.getDirections(
      startLocationPoint,
      endLocationPoint
    );

    if (!encodedPolyline) {
      return res.status(404).json({
        message: "No route found",
        success: false,
      });
    }

    // Decode polyline to an array of [lat, lng]
    const decodedPath = polyline.decode(encodedPolyline);
    console.log("Decoded Path:", decodedPath);
    // Convert to array of { latitude, longitude } objects
    const formattedPath = decodedPath.map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));

    const route = {
      startLocation: startLocationPoint,
      endLocation: endLocationPoint,
      polyline: formattedPath,
    };

    return res.status(200).json({
      message: "Route fetched successfully",
      success: true,
      data: route,
    });
  } catch (error) {
    console.error("Error fetching trip route:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
