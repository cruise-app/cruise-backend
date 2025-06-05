const Trip = require("../models/trip_model");
const GeocodingService = require("../services/google_maps_services/geocoding_service");
const MatchTrip = require("../util/match_trips");

class TripService {
  static async getUpcomingTripsByUserId(userId) {
    try {
      const now = new Date();
      const upcomingTrips = await Trip.find({
        $or: [{ driverId: userId }, { "listOfPassengers.passengerId": userId }],
      }).sort({ departureTime: 1 });

      return upcomingTrips;
    } catch (error) {
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
      const tripsResult = await MatchTrip.findSuitableTrips(
        userId,
        startCoordinatesResult.data,

        endCoordinatesResult.data,
        maxDistance
      );

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
}

module.exports = TripService;
