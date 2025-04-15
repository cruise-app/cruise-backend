const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(
      "mongodb+srv://CruiseDB:cVR9n199knvMMGCs@cluster0.rgfcr8x.mongodb.net/CruiseDB?retryWrites=true&w=majority"
    );
    console.log("MongoDB connected");

    // Load models
    require("../models/user_model");
    require("../models/otp_model");

    const User = mongoose.model("User");
    const Otp = mongoose.model("OTP");

    // Force collection creation by inserting and deleting a dummy doc
    await Promise.all([User.createCollection(), Otp.createCollection()]);

    console.log("Collections ensured");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
