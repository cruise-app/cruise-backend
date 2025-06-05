const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driverUsername: {
    type: String,
    required: true,
  },

  vehicleType: {
    type: String,
    enum: ["Sedan", "SUV", "Minibus", "Motorcycle"],
    required: true,
  },

  seatsAvailable: {
    type: Number,
    default: function () {
      const defaultSeatMap = {
        Sedan: 3,
        SUV: 5,
        Minibus: 13,
        Motorcycle: 1,
      };
      return defaultSeatMap[this.vehicleType] || 4;
    },
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
        type: String,
        required: true,
      },
      pickupPoint: {
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

  startLocationPoint: {
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

  endLocationPoint: {
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
    type: String,
    required: true,
  },

  estimatedTripDistance: {
    type: String,
    required: true,
  },
});

// Geo indexes
tripSchema.index({ "listOfPassengers.pickupPoint": "2dsphere" });
tripSchema.index({ "listOfPassengers.dropoffPoint": "2dsphere" });
tripSchema.index({ startLocationPoint: "2dsphere" });
tripSchema.index({ endLocationPoint: "2dsphere" });

module.exports = mongoose.model("Trip", tripSchema);
