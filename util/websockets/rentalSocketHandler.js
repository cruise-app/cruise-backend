const setupRentalSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join rental-specific rooms
    socket.on("joinRentalRoom", (data) => {
      const { renterId, carId } = data;

      if (renterId) {
        socket.join(`renter_${renterId}`);
        console.log(`User ${socket.id} joined renter room: renter_${renterId}`);
      }

      if (carId) {
        socket.join(`car_${carId}`);
        console.log(`User ${socket.id} joined car room: car_${carId}`);
      }
    });

    // Leave rental rooms
    socket.on("leaveRentalRoom", (data) => {
      const { renterId, carId } = data;

      if (renterId) {
        socket.leave(`renter_${renterId}`);
        console.log(`User ${socket.id} left renter room: renter_${renterId}`);
      }

      if (carId) {
        socket.leave(`car_${carId}`);
        console.log(`User ${socket.id} left car room: car_${carId}`);
      }
    });

    // Handle rental status updates
    socket.on("updateRentalStatus", (data) => {
      const { rentalId, status, renterId, carId } = data;

      // Broadcast to relevant rooms
      if (renterId) {
        socket.to(`renter_${renterId}`).emit("rentalStatusUpdated", {
          rentalId,
          status,
          timestamp: new Date().toISOString(),
        });
      }

      if (carId) {
        socket.to(`car_${carId}`).emit("carStatusUpdated", {
          carId,
          rentalId,
          status,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle real-time car availability updates
    socket.on("updateCarAvailability", (data) => {
      const { carId, isAvailable, reason } = data;

      socket.to(`car_${carId}`).emit("carAvailabilityUpdated", {
        carId,
        isAvailable,
        reason,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to all users interested in car listings
      socket.broadcast.emit("carListingUpdated", {
        carId,
        isAvailable,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle rental location updates (for pickup/dropoff)
    socket.on("updateRentalLocation", (data) => {
      const { rentalId, location, type, renterId } = data; // type: 'pickup' or 'dropoff'

      if (renterId) {
        socket.to(`renter_${renterId}`).emit("rentalLocationUpdated", {
          rentalId,
          location,
          type,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle rental notifications
    socket.on("sendRentalNotification", (data) => {
      const { renterId, carOwnerId, message, type, rentalId } = data;

      if (renterId) {
        socket.to(`renter_${renterId}`).emit("rentalNotification", {
          message,
          type,
          rentalId,
          timestamp: new Date().toISOString(),
        });
      }

      if (carOwnerId) {
        socket.to(`owner_${carOwnerId}`).emit("ownerNotification", {
          message,
          type,
          rentalId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle rental reminders
    socket.on("sendRentalReminder", (data) => {
      const { renterId, reminderType, rentalId, message } = data;

      if (renterId) {
        socket.to(`renter_${renterId}`).emit("rentalReminder", {
          reminderType, // 'pickup', 'return', 'overdue'
          rentalId,
          message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle emergency situations
    socket.on("rentalEmergency", (data) => {
      const { rentalId, renterId, carId, emergencyType, location, message } =
        data;

      // Notify all relevant parties
      if (renterId) {
        socket.to(`renter_${renterId}`).emit("emergencyAlert", {
          rentalId,
          emergencyType,
          location,
          message,
          timestamp: new Date().toISOString(),
        });
      }

      if (carId) {
        socket.to(`car_${carId}`).emit("emergencyAlert", {
          rentalId,
          emergencyType,
          location,
          message,
          timestamp: new Date().toISOString(),
        });
      }

      // Notify admin/support
      socket.broadcast.emit("emergencyAlert", {
        rentalId,
        emergencyType,
        location,
        message,
        priority: "high",
        timestamp: new Date().toISOString(),
      });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Utility functions for emitting events from services
  const emitRentalCreated = (rentalData) => {
    io.emit("rentalCreated", {
      rentalId: rentalData._id,
      carId: rentalData.carId,
      renterId: rentalData.renterId,
      message: "New rental created",
      timestamp: new Date().toISOString(),
    });

    // Notify specific rooms
    if (rentalData.renterId) {
      io.to(`renter_${rentalData.renterId}`).emit(
        "myRentalCreated",
        rentalData
      );
    }

    if (rentalData.carId) {
      io.to(`car_${rentalData.carId}`).emit("carRented", {
        carId: rentalData.carId,
        rentalId: rentalData._id,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const emitRentalCompleted = (rentalData) => {
    io.emit("rentalCompleted", {
      rentalId: rentalData._id,
      carId: rentalData.carId,
      renterId: rentalData.renterId,
      message: "Rental completed",
      timestamp: new Date().toISOString(),
    });

    // Notify specific rooms
    if (rentalData.renterId) {
      io.to(`renter_${rentalData.renterId}`).emit(
        "myRentalCompleted",
        rentalData
      );
    }

    if (rentalData.carId) {
      io.to(`car_${rentalData.carId}`).emit("carReturned", {
        carId: rentalData.carId,
        rentalId: rentalData._id,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const emitRentalCancelled = (rentalData) => {
    io.emit("rentalCancelled", {
      rentalId: rentalData._id,
      carId: rentalData.carId,
      renterId: rentalData.renterId,
      message: "Rental cancelled",
      timestamp: new Date().toISOString(),
    });

    // Notify specific rooms
    if (rentalData.renterId) {
      io.to(`renter_${rentalData.renterId}`).emit(
        "myRentalCancelled",
        rentalData
      );
    }

    if (rentalData.carId) {
      io.to(`car_${rentalData.carId}`).emit("carRentalCancelled", {
        carId: rentalData.carId,
        rentalId: rentalData._id,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Attach utility functions to the io object for use in services
  io.emitRentalCreated = emitRentalCreated;
  io.emitRentalCompleted = emitRentalCompleted;
  io.emitRentalCancelled = emitRentalCancelled;
};

module.exports = {
  setupRentalSocket,
};
