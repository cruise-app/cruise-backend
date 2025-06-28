const Message = require("../models/message");

// Get all messages for a specific trip
exports.getMessages = async (req, res) => {
  try {
    const { tripId } = req.params;
    const messages = await Message.find({ tripId }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};

// Handle sending a new message (used by socket.io)
exports.handleSendMessage = async (io, data) => {
  try {
    const { tripId, senderId, content, createdAt } = data;

    // Create and save the new message
    const newMessage = new Message({
      tripId,
      senderId,
      content,
      createdAt,
    });

    const savedMessage = await newMessage.save();

    // Broadcast the message to all users in the trip room
    io.to(tripId).emit("newMessage", savedMessage);

    return savedMessage;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};
