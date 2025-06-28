const mongoose = require("mongoose");

const tripMemberSchema = new mongoose.Schema(
  {
    tripId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    firstJoinedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique combination of tripId and userId
tripMemberSchema.index({ tripId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("TripMember", tripMemberSchema);
