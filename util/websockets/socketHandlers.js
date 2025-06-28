const userSockets = new Map(); // Maps userId -> socket.id
const TripSerivce = require("../../services/trip_service");

function setupTripSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("getUpComingTrips", async (userId) => {
      socket.userId = userId; // Store userId in socket object
      userSockets.set(userId, socket.id); // Store the userId directly
      console.log(`User ${userId} subscribed to getting upcoming trips`);

      try {
        const trips = await TripSerivce.getUpcomingTripsByUserId(userId);
        console.log("Upcoming trips fetched:", trips);
        socket.emit("upComingTrips", { success: true, data: trips });
      } catch (e) {
        socket.emit("upComingTrips", {
          success: false,
          message: e.message || "Error loading trips",
        });
      }
    });

    socket.on("deleteUpComingTrip", async (userId, tripId) => {
      try {
        const result = await TripSerivce.deleteTripByOwner(userId, tripId);
        if (result.success) {
          // Fetch updated trips after deletion
          const trips = await TripSerivce.getUpcomingTripsByUserId(userId);
          socket.emit("upComingTrips", {
            success: true,
            data: trips,
            message: result.data.message,
          });
        } else {
          socket.emit("upComingTrips", {
            success: false,
            message: result.error || "Error loading trips",
          });
        }
      } catch (e) {
        socket.emit("upComingTrips", {
          success: false,
          message: e.message || "Could not delete trip",
        });
      }
    });

    socket.on("leaveUpcomingTrip", async (userId, tripId) => {
      try {
        const result = await TripSerivce.leaveTrip(userId, tripId);
        // Fetch updated trips after leaving
        const trips = await TripSerivce.getUpcomingTripsByUserId(userId);
        if (result.success) {
          socket.emit("upComingTrips", {
            success: true,
            data: trips,
            message: result.data.message,
          });
        } else {
          socket.emit("upComingTrips", {
            success: false,
            data: trips,
            message: result.error || "Could not leave trip",
          });
        }
      } catch (e) {
        socket.emit("upComingTrips", {
          success: false,
          data: [],
          message: e.message || "Could not leave trip",
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        userSockets.delete(socket.userId); // Remove the userId from the map
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
}

module.exports = { setupTripSocket, userSockets };
