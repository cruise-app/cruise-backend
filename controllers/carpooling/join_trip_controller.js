const mongoose = require("mongoose");
const TripModel = require("../../models/trip_model");
const GeocodingService = require("../../services/google_maps_services/geocoding_service");

exports.joinTrip = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tripId, passengerId, username, passengerPickup, passengerDropoff } =
      req.body;
    console.log(
      tripId,
      passengerId,
      username,
      passengerPickup,
      passengerDropoff
    );
    if (
      !tripId ||
      !passengerId ||
      !username ||
      !passengerPickup ||
      !passengerDropoff
    ) {
      return res.status(400).json({
        message: "Trip and passenger details are required",
        success: false,
      });
    }

    const trip = await TripModel.findById(tripId).session(session);
    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
        success: false,
      });
    }

    if (trip.seatsAvailable <= 0) {
      return res.status(403).json({
        message: "No seats available in this trip",
        success: false,
      });
    }

    const alreadyJoined = trip.listOfPassengers.find(
      (p) => p.passengerId.toString() === passengerId
    );

    if (alreadyJoined) {
      return res.status(409).json({
        message: "You have already joined this trip",
        success: false,
      });
    }

    const pickupCoordinates = await GeocodingService.getCoordinates(
      passengerPickup
    );
    const dropoffCoordinates = await GeocodingService.getCoordinates(
      passengerDropoff
    );

    // Add passenger
    trip.listOfPassengers.push({
      passengerId,
      username,
      pickupLocationName: passengerPickup,
      pickupPoint: {
        type: "Point",
        coordinates: [pickupCoordinates.longitude, pickupCoordinates.latitude],
      },
      dropoffLocationName: passengerDropoff,
      dropoffPoint: {
        type: "Point",
        coordinates: [
          dropoffCoordinates.longitude,
          dropoffCoordinates.latitude,
        ],
      },
      status: "Pending", // default
    });

    // Update available seats
    trip.seatsAvailable -= 1;

    // Save changes in transaction
    await trip.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Successfully joined the trip",
      success: true,
      data: trip,
    });
  } catch (error) {
    // Rollback transaction in case of error
    await session.abortTransaction();
    session.endSession();

    console.error("Error joining trip:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
