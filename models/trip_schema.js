const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  listOfPassengers: [
    {
      passengerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ["Accepted", "Pending", "Rejected"],
        default: "Pending",
      },
      pickupLocationName: {
        type: String, // e.g., "123 Main Street"
        required: true,
      },
      pickupPoint: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
      dropoffLocationName: {
        type: String,
        required: true,
      },
      dropoffPoint: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
  ],

  startLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  startLocationName: {
    type: String,
    required: true,
  },
  polyline: {
    type: String,
    required: true,
  },

  endLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  endLocationName: {
    type: String,
    required: true,
  },

  departureTime: {
    type: Date,
    required: true,
  },

  estimatedTripTime: {
    type: Number,
    required: true,
  },

  estimatedTripDistance: {
    type: Number,
    required: true,
  },
});

tripSchema.index({ "listOfPassengers.pickupPoint": "2dsphere" });
tripSchema.index({ "listOfPassengers.dropoffPoint": "2dsphere" });
tripSchema.index({ startLocation: "2dsphere" });
tripSchema.index({ endLocation: "2dsphere" });

module.exports = mongoose.model("Trip", tripSchema);
