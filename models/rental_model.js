const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalCar",
      required: true,
    },
    renterId: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    pickupLocation: {
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
    dropoffLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    paymentId: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    returnDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
    damageReport: {
      type: String,
      trim: true,
    },
    extraCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for efficient queries
rentalSchema.index({ carId: 1, status: 1 });
rentalSchema.index({ renterId: 1, status: 1 });
rentalSchema.index({ startDate: 1, endDate: 1 });

// Virtual for rental duration in days
rentalSchema.virtual("durationInDays").get(function () {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for actual duration (if returned)
rentalSchema.virtual("actualDurationInDays").get(function () {
  if (this.startDate && this.returnDate) {
    return Math.ceil((this.returnDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return this.durationInDays;
});

// Method to check if rental is overdue
rentalSchema.methods.isOverdue = function () {
  return this.status === "active" && new Date() > this.endDate;
};

// Method to calculate late fees
rentalSchema.methods.calculateLateFees = function (dailyLateFee = 50) {
  if (!this.isOverdue()) return 0;
  
  const overdueDays = Math.ceil((new Date() - this.endDate) / (1000 * 60 * 60 * 24));
  return overdueDays * dailyLateFee;
};

// Static method to find overlapping rentals
rentalSchema.statics.findOverlapping = function (carId, startDate, endDate) {
  return this.find({
    carId,
    status: { $in: ["active", "pending"] },
    $or: [
      {
        startDate: { $lt: endDate },
        endDate: { $gt: startDate },
      },
    ],
  });
};

// Static method to find active rentals for a user
rentalSchema.statics.findActiveByUser = function (renterId) {
  return this.find({
    renterId,
    status: "active",
  }).populate("carId");
};

// Pre-save middleware to validate dates
rentalSchema.pre("save", function (next) {
  if (this.startDate >= this.endDate) {
    next(new Error("End date must be after start date"));
  }
  
  if (this.startDate < new Date() && this.isNew) {
    next(new Error("Start date cannot be in the past"));
  }
  
  next();
});

// Post-save middleware to update car rental count
rentalSchema.post("save", async function (doc) {
  if (doc.status === "completed" && doc.isModified("status")) {
    await mongoose.model("RentalCar").findByIdAndUpdate(
      doc.carId,
      { $inc: { totalRentals: 1 } }
    );
  }
});

module.exports = mongoose.model("Rental", rentalSchema); 