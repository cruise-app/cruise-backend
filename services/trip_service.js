const Trip = require("../models/trip_model");
const GeocodingService = require("../services/google_maps_services/geocoding_service");
const MatchTrip = require("../util/match_trips");
const mongoose = require("mongoose");

class TripService {
  static async getUpcomingTripsByUserId(userId) {
    try {
      console.log("Searching trips for userId:", userId);
      console.log("User ID type:", typeof userId);

      // Try to convert string ID to ObjectId if needed
      const searchId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;

      // Query for all trips where user is driver or passenger
      const query = {
        $or: [
          { driverId: searchId },
          { "listOfPassengers.passengerId": searchId },
        ],
      };

      // For future trips only (commented out for now)
      // const now = new Date();
      // const query = {
      //   $and: [
      //     {
      //       $or: [
      //         { driverId: searchId },
      //         { "listOfPassengers.passengerId": searchId }
      //       ]
      //     },
      //     { departureTime: { $gt: now } }
      //   ]
      // };

      console.log("Query:", JSON.stringify(query, null, 2));

      const upcomingTrips = await Trip.find(query).sort({ departureTime: 1 });

      console.log("Number of trips found:", upcomingTrips.length);
      console.log("Trips:", JSON.stringify(upcomingTrips, null, 2));

      return upcomingTrips;
    } catch (error) {
      console.error("Error in getUpcomingTripsByUserId:", error);
      return {
        success: false,
        error: `Error fetching upcoming trips: ${error.message}`,
      };
    }
  }

  static async addTrip(tripData, userId) {
    try {
      const newTrip = new Trip({
        ...tripData,
        userId,
      });

      await newTrip.save();
      return {
        success: true,
        data: newTrip,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error adding new trip: ${error.message}`,
      };
    }
  }

  static async updateTrip(tripId, updatedData) {
    try {
      const updatedTrip = await Trip.findByIdAndUpdate(tripId, updatedData, {
        new: true,
      });

      if (!updatedTrip) {
        return {
          success: false,
          error: "Trip not found",
        };
      }

      return {
        success: true,
        data: updatedTrip,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error updating trip: ${error.message}`,
      };
    }
  }

  static async deleteTrip(tripId) {
    try {
      const result = await Trip.findByIdAndDelete(tripId);
      if (!result) {
        return {
          success: false,
          error: "Trip not found",
        };
      }
      return {
        success: true,
        data: { message: "Trip successfully deleted" },
      };
    } catch (error) {
      return {
        success: false,
        error: `Error deleting trip: ${error.message}`,
      };
    }
  }

  static async deleteTripByOwner(userId, tripId) {
    try {
      // Ensure userId is ObjectId
      const ownerId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;
      const trip = await Trip.findOne({ _id: tripId, driverId: ownerId });
      if (!trip) {
        return {
          success: false,
          error: "Trip not found or you are not the owner",
        };
      }
      await Trip.findByIdAndDelete(tripId);
      return {
        success: true,
        data: { message: "Trip successfully deleted" },
      };
    } catch (error) {
      return {
        success: false,
        error: `Error deleting trip: ${error.message}`,
      };
    }
  }

  static async searchTrips(
    userId,
    startLocationName,
    endLocationName,
    maxDistance
  ) {
    console.log(
      "Searching trips from",
      startLocationName,
      "to",
      endLocationName
    );
    try {
      if (!startLocationName || !endLocationName) {
        return {
          success: false,
          error: "Departure and destination locations are required",
        };
      }

      const startCoordinatesResult = await GeocodingService.getCoordinates(
        startLocationName
      );
      if (!startCoordinatesResult.success) {
        return {
          success: false,
          error: startCoordinatesResult.error,
        };
      }

      const endCoordinatesResult = await GeocodingService.getCoordinates(
        endLocationName
      );
      if (!endCoordinatesResult.success) {
        return {
          success: false,
          error: endCoordinatesResult.error,
        };
      }
      console.log("I am here");
      console.log(
        "Start Coordinates:",
        startCoordinatesResult.data,
        "End Coordinates:",
        endCoordinatesResult.data
      );
      const tripsResult = await MatchTrip.findSuitableTrips({
        userId: userId,
        passengerPickUp: startCoordinatesResult.data,
        passengerDropOff: endCoordinatesResult.data,
        maxDistance: maxDistance,
      });

      if (!tripsResult.success) {
        return {
          success: false,
          error: tripsResult.error,
        };
      }

      return {
        success: true,
        data: tripsResult.data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error searching trips: ${error.message}`,
      };
    }
  }

  static async leaveTrip(userId, tripId) {
    try {
      console.log("Leaving trip:", userId, tripId);
      // Ensure userId is ObjectId
      const passengerId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return { success: false, error: "Trip not found" };
      }
      // Find the passenger index
      const passengerIndex = trip.listOfPassengers.findIndex(
        (p) => p.passengerId.toString() === passengerId.toString()
      );
      console.log("Passenger index:", passengerIndex);
      if (passengerIndex === -1) {
        return {
          success: false,
          error: "You are not a passenger in this trip",
        };
      }
      // Remove the passenger
      trip.listOfPassengers.splice(passengerIndex, 1);
      trip.seatsAvailable += 1;
      await trip.save();
      return { success: true, data: { message: "Successfully left the trip" } };
    } catch (error) {
      return { success: false, error: `Error leaving trip: ${error.message}` };
    }
  }
}

module.exports = TripService;
