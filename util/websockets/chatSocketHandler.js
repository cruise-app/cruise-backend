const Message = require("../../models/message");
const { handleSendMessage } = require("../../controllers/message_controller");
const TripMember = require("../../models/tripMember");

const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected to chat:", socket.id);

    // Listen when a user joins a specific trip room
    socket.on("joinTrip", async ({ tripId, userId }) => {
      try {
        socket.join(tripId);
        console.log(`Socket ${socket.id} joined trip room: ${tripId}`);

        // Check if this is the user's first time joining this trip
        let tripMember = await TripMember.findOne({ tripId, userId });

        if (!tripMember) {
          // First time joining - create new trip member record
          tripMember = new TripMember({
            tripId,
            userId,
            firstJoinedAt: new Date(),
          });
          await tripMember.save();

          // Send a system message notifying about the first-time join
          io.to(tripId).emit("userJoined", {
            userId: socket.id,
            message: `${socket.id} has joined the trip for the first time!`,
            timestamp: new Date().toISOString(),
            isFirstTime: true,
          });
        } else {
          // Returning member - only notify about online status
          socket.to(tripId).emit("userOnline", {
            userId: socket.id,
            timestamp: new Date().toISOString(),
          });
        }

        // Fetch previous messages for this trip
        const messages = await Message.find({ tripId }).sort({ createdAt: 1 });

        // Send the old messages to ONLY the user who just joined
        socket.emit("previousMessages", messages);
      } catch (error) {
        console.error("Error in joinTrip:", error);
        // Emit error to the client
        socket.emit("error", {
          type: "JOIN_ERROR",
          message: "Failed to join trip chat",
          details: error.message,
        });
      }
    });

    // Listen for new messages
    socket.on("sendMessage", async (data) => {
      try {
        const result = await handleSendMessage(io, data);
        // Acknowledge successful message delivery
        socket.emit("messageDelivered", {
          messageId: result._id,
          timestamp: result.createdAt,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", {
          type: "MESSAGE_ERROR",
          message: "Failed to send message",
          details: error.message,
        });
      }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      const { tripId, isTyping, userId } = data;
      socket.to(tripId).emit("userTyping", { userId, isTyping });
    });

    // Handle when user leaves a trip room
    socket.on("leaveTrip", (tripId) => {
      socket.leave(tripId);
      socket.to(tripId).emit("userOffline", {
        userId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected from chat:", socket.id);
      // Notify all rooms this socket was in
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          // Skip the default room
          socket.to(room).emit("userOffline", {
            userId: socket.id,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });
  });
};

module.exports = { setupChatSocket };
