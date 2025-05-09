const placesService = require("../../services/google_maps_services/places_service");

exports.getSuggestedLocations = async (req, res) => {
  try {
    const { input } = req.body; // Extract the input from the request body

    if (!input) {
      return res.status(400).json({
        message: "Input is required",
        success: false,
      });
    }

    // Get place suggestions from the PlacesService
    const suggestions = await placesService.getPlacesSuggestions(input);

    return res.status(200).json({
      message: "Place suggestions retrieved successfully",
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Error fetching suggested locations:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
