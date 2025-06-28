const liveLocationSocket = (io) => {
  const analyticsClients = new Set();

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("joinTrip", ({ tripId, userId }) => {
      console.log(
        `Client ${socket.id} joined trip ${tripId} with userId ${userId}`
      );
      socket.join(tripId);
      socket.tripId = tripId;
      socket.userId = userId;
    });

    socket.on("joinAnalytics", () => {
      console.log(`Client ${socket.id} joined analytics room`);
      analyticsClients.add(socket.id);
      socket.join("analytics");
    });

    socket.on("locationUpdate", (data) => {
      console.log("Received locationUpdate:", data);
      // Validate data
      if (!data || !data.tripId || !data.userId) {
        console.log("Invalid locationUpdate data:", data);
        return;
      }
      // Broadcast to all users in the trip (including sender)
      io.to(data.tripId).emit("userLocation", data);
      // Broadcast to all analytics clients
      io.to("analytics").emit("analyticsLocation", data);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      analyticsClients.delete(socket.id);
    });
  });
};

module.exports = { liveLocationSocket };
// module.exports = { setupChatSocket };
