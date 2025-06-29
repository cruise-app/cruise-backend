const RentalService = require("../../services/rental_service");
const { validateRentalData, validateReturnData, validateListData } = require("../../util/validation");

const listAvailableCars = async (req, res) => {
  try {
    const validationResult = validateListData(req.query);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.errors,
      });
    }

    const cars = await RentalService.listAvailableCars(validationResult.data);
    
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
    const validationResult = validateRentalData(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.errors,
      });
    }

    const rental = await RentalService.reserveCar(validationResult.data);
    
    res.status(201).json({
      success: true,
      data: rental,
      message: "Car reserved successfully",
    });
  } catch (error) {
    console.error("Error in reserveCar:", error);
    
    if (error.message.includes("not available") || error.message.includes("already reserved")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const returnCar = async (req, res) => {
  try {
    const validationResult = validateReturnData(req.params);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.errors,
      });
    }

    const rental = await RentalService.returnCar(validationResult.data.rentId);
    
    res.status(200).json({
      success: true,
      data: rental,
      message: "Car returned successfully",
    });
  } catch (error) {
    console.error("Error in returnCar:", error);
    
    if (error.message.includes("not found") || error.message.includes("not active")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
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

    const reservations = await RentalService.getReservations(plateNumber);
    
    res.status(200).json({
      success: true,
      data: reservations,
      message: "Reservations retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getReservations:", error);
    
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  listAvailableCars,
  reserveCar,
  returnCar,
  getReservations,
}; 