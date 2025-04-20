const findSuitableTrips = require("../../util/match_trips");
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
