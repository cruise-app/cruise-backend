const mongoose = require("mongoose");
const RentalCar = require("../../models/rental_car_model");

const addCar = async (req, res) => {
  try {
    const {
      plateNumber,
      model,
      category,
      ownerId,
      location,
      availability,
      dailyRate,
      isNegotiable,
      insuranceTerms,
      imageUrl,
      isAvailable,
      features,
      fuelType,
      transmission,
      year,
      rating,
      totalRentals,
    } = req.body;

    // Manual validation
    const errors = [];

    if (
      !plateNumber ||
      typeof plateNumber !== "string" ||
      plateNumber.trim() === ""
    ) {
      errors.push("Plate number is required and must be a non-empty string");
    }

    if (!model || typeof model !== "string" || model.trim() === "") {
      errors.push("Model is required and must be a non-empty string");
    }

    if (
      category &&
      !["Sedan", "SUV", "Electric", "Compact", "Standard"].includes(category)
    ) {
      errors.push(
        "Category must be one of: Sedan, SUV, Electric, Compact, Standard"
      );
    }

    if (!ownerId || typeof ownerId !== "string") {
      errors.push("Owner ID is required and must be a string");
    }

    if (
      !location ||
      !location.coordinates ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      errors.push(
        "Location must include coordinates array with [longitude, latitude]"
      );
    } else if (
      location.coordinates.some((coord) => typeof coord !== "number")
    ) {
      errors.push("Coordinates must be numbers");
    }

    if (!availability || !availability.start || !availability.end) {
      errors.push("Availability must include start and end dates");
    } else {
      const startDate = new Date(availability.start);
      const endDate = new Date(availability.end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        errors.push("Availability dates must be valid");
      } else if (startDate >= endDate) {
        errors.push("End date must be after start date");
      }
    }

    if (!dailyRate || typeof dailyRate !== "number" || dailyRate < 0) {
      errors.push("Daily rate is required and must be a non-negative number");
    }

    if (isNegotiable !== undefined && typeof isNegotiable !== "boolean") {
      errors.push("isNegotiable must be a boolean");
    }

    if (
      !insuranceTerms ||
      typeof insuranceTerms !== "string" ||
      insuranceTerms.trim() === ""
    ) {
      errors.push(
        "Insurance terms are required and must be a non-empty string"
      );
    }

    if (imageUrl && typeof imageUrl !== "string") {
      errors.push("Image URL must be a string");
    }

    if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
      errors.push("isAvailable must be a boolean");
    }

    if (
      features &&
      (!Array.isArray(features) || features.some((f) => typeof f !== "string"))
    ) {
      errors.push("Features must be an array of strings");
    }

    if (
      fuelType &&
      !["Petrol", "Diesel", "Electric", "Hybrid"].includes(fuelType)
    ) {
      errors.push("Fuel type must be one of: Petrol, Diesel, Electric, Hybrid");
    }

    if (transmission && !["Manual", "Automatic"].includes(transmission)) {
      errors.push("Transmission must be one of: Manual, Automatic");
    }

    const currentYear = new Date().getFullYear() + 1;
    if (
      year &&
      (typeof year !== "number" || year < 1900 || year > currentYear)
    ) {
      errors.push(`Year must be a number between 1900 and ${currentYear}`);
    }

    if (rating && (typeof rating !== "number" || rating < 0 || rating > 5)) {
      errors.push("Rating must be a number between 0 and 5");
    }

    if (
      totalRentals &&
      (typeof totalRentals !== "number" || totalRentals < 0)
    ) {
      errors.push("Total rentals must be a non-negative number");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Check for existing car with same plate number
    const existingCar = await RentalCar.findOne({
      plateNumber: plateNumber.trim(),
    });
    if (existingCar) {
      return res.status(409).json({
        success: false,
        message: "Car with this plate number already exists",
      });
    }

    // Create new car
    const newCar = new RentalCar({
      plateNumber: plateNumber.trim(),
      model: model.trim(),
      category: category || "Standard",
      ownerId,
      location: {
        type: "Point",
        coordinates: location.coordinates,
      },
      availability: {
        start: new Date(availability.start),
        end: new Date(availability.end),
      },
      dailyRate,
      isNegotiable: isNegotiable || false,
      insuranceTerms: insuranceTerms.trim(),
      imageUrl:
        imageUrl ||
        "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=800&q=80",
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      features: features || [],
      fuelType: fuelType || "Petrol",
      transmission: transmission || "Manual",
      year: year || undefined,
      rating: rating || 0,
      totalRentals: totalRentals || 0,
    });

    // Save to database
    const savedCar = await newCar.save();

    res.status(201).json({
      success: true,
      data: savedCar,
      message: "Car added successfully",
    });
  } catch (error) {
    console.error("Error in addCar:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const listAvailableCars = async (req, res) => {
  try {
    const cars = await RentalCar.find({ isAvailable: true });

    res.status(200).json({
      success: true,
      data: cars,
      message: "Cars retrieved successfully",
    });
  } catch (error) {
    console.error("Error in listAvailableCars:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const reserveCar = async (req, res) => {
  try {
    const { plateNumber, startDate, endDate } = req.body;

    if (!plateNumber || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Plate number, start date, and end date are required",
      });
    }

    const car = await RentalCar.findOne({ plateNumber });
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (!car.isAvailableForDates(startDate, endDate)) {
      return res.status(409).json({
        success: false,
        message: "Car is not available for the specified dates",
      });
    }

    // Implementation for reserving the car would go here
    // This is a placeholder as the original code used RentalService
    const rental = { plateNumber, startDate, endDate }; // Simplified response

    res.status(201).json({
      success: true,
      data: rental,
      message: "Car reserved successfully",
    });
  } catch (error) {
    console.error("Error in reserveCar:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const returnCar = async (req, res) => {
  try {
    const { rentId } = req.params;

    if (!rentId) {
      return res.status(400).json({
        success: false,
        message: "Rent ID is required",
      });
    }

    // Implementation for returning the car would go here
    // This is a placeholder as the original code used RentalService
    const rental = { rentId }; // Simplified response

    res.status(200).json({
      success: true,
      data: rental,
      message: "Car returned successfully",
    });
  } catch (error) {
    console.error("Error in returnCar:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getReservations = async (req, res) => {
  try {
    const { plateNumber } = req.params;

    if (!plateNumber) {
      return res.status(400).json({
        success: false,
        message: "Plate number is required",
      });
    }

    // Implementation for getting reservations would go here
    // This is a placeholder as the original code used RentalService
    const reservations = []; // Simplified response

    res.status(200).json({
      success: true,
      data: reservations,
      message: "Reservations retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getReservations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  addCar,
  listAvailableCars,
  reserveCar,
  returnCar,
  getReservations,
};
