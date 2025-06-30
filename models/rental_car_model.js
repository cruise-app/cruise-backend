const mongoose = require("mongoose");

const rentalCarSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Sedan", "SUV", "Electric", "Compact", "Standard"],
      default: "Standard",
    },
    ownerId: {
      type: String,
      required: true,
    },
    location: {
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
    availability: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    },
    insuranceTerms: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=800&q=80",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    features: {
      type: [String],
      default: [],
    },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      default: "Petrol",
    },
    transmission: {
      type: String,
      enum: ["Manual", "Automatic"],
      default: "Manual",
    },
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRentals: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
rentalCarSchema.index({ location: "2dsphere" });

// Create compound index for efficient filtering
rentalCarSchema.index({ category: 1, dailyRate: 1, isAvailable: 1 });

// Virtual for formatted location
rentalCarSchema.virtual("formattedLocation").get(function () {
  if (this.location && this.location.coordinates) {
    return `${this.location.coordinates[1]}, ${this.location.coordinates[0]}`;
  }
  return "";
});

// Method to check availability for date range
rentalCarSchema.methods.isAvailableForDates = function(startDate, endDate) {
  return (
    this.isAvailable &&
    new Date(startDate) >= this.availability.start &&
    new Date(endDate) <= this.availability.end
  );
};

// Static method to find cars near location
rentalCarSchema.statics.findNearLocation = function(lng, lat, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistance,
      },
    },
    isAvailable: true,
  });
};

module.exports = mongoose.model("RentalCar", rentalCarSchema); 