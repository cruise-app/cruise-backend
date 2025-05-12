const Trip = require("../models/trip_model"); // Assuming you have a `Trip` model defined

class TripService {
  // Method to fetch upcoming trips for a user by their userId
  static async getUpcomingTripsByUserId(userId) {
    try {
      const now = new Date();
      console.log("User ID:", userId);
      console.log("Current Date:", now);
      const upcomingTrips = await Trip.find({
        //departureTime: { $gte: now },
        $or: [{ driverId: userId }, { "listOfPassengers.passengerId": userId }],
      }).sort({ departureTime: 1 });

      return upcomingTrips;
    } catch (error) {
      throw new Error("Error fetching upcoming trips: " + error.message);
    }
  }

  // Method to add a new trip
  static async addTrip(tripData, userId) {
    try {
      const newTrip = new Trip({
        ...tripData,
        userId: userId, // Linking the userId to the trip
      });

      await newTrip.save();
      return newTrip;
    } catch (error) {
      throw new Error("Error adding new trip: " + error.message);
    }
  }

  // Method to update a specific trip by tripId
  static async updateTrip(tripId, updatedData) {
    try {
      const updatedTrip = await Trip.findByIdAndUpdate(
        tripId,
        updatedData,
        { new: true } // Return the updated trip, not the old one
      );

      return updatedTrip;
    } catch (error) {
      throw new Error("Error updating trip: " + error.message);
    }
  }

  // Method to delete a specific trip by tripId
  static async deleteTrip(tripId) {
    try {
      await Trip.findByIdAndDelete(tripId);
      return { success: true, message: "Trip successfully deleted." };
    } catch (error) {
      throw new Error("Error deleting trip: " + error.message);
    }
  }
}

module.exports = TripService;
