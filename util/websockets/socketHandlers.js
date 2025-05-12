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

    socket.on("disconnect", () => {
      if (socket.userId) {
        userSockets.delete(socket.userId); // Remove the userId from the map
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
}

module.exports = { setupTripSocket, userSockets };
