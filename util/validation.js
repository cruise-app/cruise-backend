const validateRentalData = (data) => {
  const errors = [];
  const cleanData = {};

  // Validate carId
  if (!data.carId || typeof data.carId !== "string" || data.carId.trim() === "") {
    errors.push("Car ID is required and must be a valid string");
  } else {
    cleanData.carId = data.carId.trim();
  }

  // Validate renterId
  if (!data.renterId || typeof data.renterId !== "string" || data.renterId.trim() === "") {
    errors.push("Renter ID is required and must be a valid string");
  } else {
    cleanData.renterId = data.renterId.trim();
  }

  // Validate startDate
  if (!data.startDate) {
    errors.push("Start date is required");
  } else {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push("Start date must be a valid date");
    } else if (startDate < new Date()) {
      errors.push("Start date cannot be in the past");
    } else {
      cleanData.startDate = startDate.toISOString();
    }
  }

  // Validate endDate
  if (!data.endDate) {
    errors.push("End date is required");
  } else {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push("End date must be a valid date");
    } else {
      cleanData.endDate = endDate.toISOString();
      
      // Check if endDate is after startDate
      if (cleanData.startDate && endDate <= new Date(cleanData.startDate)) {
        errors.push("End date must be after start date");
      }
    }
  }

  // Validate pickupLocation
  if (!data.pickupLocation) {
    errors.push("Pickup location is required");
  } else {
    if (typeof data.pickupLocation !== "object") {
      errors.push("Pickup location must be an object");
    } else {
      const { lat, lng } = data.pickupLocation;
      
      if (typeof lat !== "number" || isNaN(lat) || lat < -90 || lat > 90) {
        errors.push("Pickup location latitude must be a valid number between -90 and 90");
      }
      
      if (typeof lng !== "number" || isNaN(lng) || lng < -180 || lng > 180) {
        errors.push("Pickup location longitude must be a valid number between -180 and 180");
      }
      
      if (errors.length === 0 || !errors.some(e => e.includes("latitude") || e.includes("longitude"))) {
        cleanData.pickupLocation = {
          type: "Point",
          coordinates: [lng, lat]
        };
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: cleanData,
  };
};

const validateReturnData = (data) => {
  const errors = [];
  const cleanData = {};

  // Validate rentId
  if (!data.rentId || typeof data.rentId !== "string" || data.rentId.trim() === "") {
    errors.push("Rental ID is required and must be a valid string");
  } else {
    // Basic MongoDB ObjectId validation
    if (!/^[0-9a-fA-F]{24}$/.test(data.rentId.trim())) {
      errors.push("Rental ID must be a valid MongoDB ObjectId");
    } else {
      cleanData.rentId = data.rentId.trim();
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: cleanData,
  };
};

const validateListData = (data) => {
  const errors = [];
  const cleanData = {};

  // Validate category (optional)
  if (data.category) {
    const validCategories = ["Sedan", "SUV", "Electric", "Compact", "Standard"];
    if (!validCategories.includes(data.category)) {
      errors.push(`Category must be one of: ${validCategories.join(", ")}`);
    } else {
      cleanData.category = data.category;
    }
  }

  // Validate model (optional)
  if (data.model) {
    if (typeof data.model !== "string" || data.model.trim() === "") {
      errors.push("Model must be a valid string");
    } else {
      cleanData.model = data.model.trim();
    }
  }

  // Validate minPrice (optional)
  if (data.minPrice !== undefined) {
    const minPrice = parseFloat(data.minPrice);
    if (isNaN(minPrice) || minPrice < 0) {
      errors.push("Minimum price must be a valid positive number");
    } else {
      cleanData.minPrice = minPrice;
    }
  }

  // Validate maxPrice (optional)
  if (data.maxPrice !== undefined) {
    const maxPrice = parseFloat(data.maxPrice);
    if (isNaN(maxPrice) || maxPrice < 0) {
      errors.push("Maximum price must be a valid positive number");
    } else {
      cleanData.maxPrice = maxPrice;
    }
  }

  // Validate price range
  if (cleanData.minPrice && cleanData.maxPrice && cleanData.minPrice > cleanData.maxPrice) {
    errors.push("Minimum price cannot be greater than maximum price");
  }

  // Validate location (optional)
  if (data.location) {
    if (typeof data.location !== "object") {
      errors.push("Location must be an object");
    } else {
      const { lat, lng } = data.location;
      
      if (lat !== undefined) {
        const latitude = parseFloat(lat);
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
          errors.push("Location latitude must be a valid number between -90 and 90");
        } else {
          cleanData.location = cleanData.location || {};
          cleanData.location.lat = latitude;
        }
      }
      
      if (lng !== undefined) {
        const longitude = parseFloat(lng);
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
          errors.push("Location longitude must be a valid number between -180 and 180");
        } else {
          cleanData.location = cleanData.location || {};
          cleanData.location.lng = longitude;
        }
      }
    }
  }

  // Validate startDate (optional, for availability filtering)
  if (data.startDate) {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push("Start date must be a valid date");
    } else {
      cleanData.startDate = startDate.toISOString();
    }
  }

  // Validate endDate (optional, for availability filtering)
  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push("End date must be a valid date");
    } else {
      cleanData.endDate = endDate.toISOString();
      
      // Check if endDate is after startDate
      if (cleanData.startDate && endDate <= new Date(cleanData.startDate)) {
        errors.push("End date must be after start date");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: cleanData,
  };
};

const validateCarData = (data) => {
  const errors = [];
  const cleanData = {};

  // Validate plateNumber
  if (!data.plateNumber || typeof data.plateNumber !== "string" || data.plateNumber.trim() === "") {
    errors.push("Plate number is required and must be a valid string");
  } else {
    cleanData.plateNumber = data.plateNumber.trim().toUpperCase();
  }

  // Validate model
  if (!data.model || typeof data.model !== "string" || data.model.trim() === "") {
    errors.push("Model is required and must be a valid string");
  } else {
    cleanData.model = data.model.trim();
  }

  // Validate category
  const validCategories = ["Sedan", "SUV", "Electric", "Compact", "Standard"];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push(`Category is required and must be one of: ${validCategories.join(", ")}`);
  } else {
    cleanData.category = data.category;
  }

  // Validate ownerId
  if (!data.ownerId || typeof data.ownerId !== "string" || data.ownerId.trim() === "") {
    errors.push("Owner ID is required and must be a valid string");
  } else {
    cleanData.ownerId = data.ownerId.trim();
  }

  // Validate dailyRate
  if (!data.dailyRate || typeof data.dailyRate !== "number" || data.dailyRate <= 0) {
    errors.push("Daily rate is required and must be a positive number");
  } else {
    cleanData.dailyRate = data.dailyRate;
  }

  // Validate location
  if (!data.location || typeof data.location !== "object") {
    errors.push("Location is required and must be an object");
  } else {
    const { lat, lng } = data.location;
    
    if (typeof lat !== "number" || isNaN(lat) || lat < -90 || lat > 90) {
      errors.push("Location latitude must be a valid number between -90 and 90");
    }
    
    if (typeof lng !== "number" || isNaN(lng) || lng < -180 || lng > 180) {
      errors.push("Location longitude must be a valid number between -180 and 180");
    }
    
    if (errors.length === 0 || !errors.some(e => e.includes("latitude") || e.includes("longitude"))) {
      cleanData.location = {
        type: "Point",
        coordinates: [lng, lat]
      };
    }
  }

  // Validate availability
  if (!data.availability || typeof data.availability !== "object") {
    errors.push("Availability is required and must be an object");
  } else {
    const { start, end } = data.availability;
    
    if (!start) {
      errors.push("Availability start date is required");
    } else {
      const startDate = new Date(start);
      if (isNaN(startDate.getTime())) {
        errors.push("Availability start date must be a valid date");
      } else {
        cleanData.availability = cleanData.availability || {};
        cleanData.availability.start = startDate;
      }
    }
    
    if (!end) {
      errors.push("Availability end date is required");
    } else {
      const endDate = new Date(end);
      if (isNaN(endDate.getTime())) {
        errors.push("Availability end date must be a valid date");
      } else {
        cleanData.availability = cleanData.availability || {};
        cleanData.availability.end = endDate;
        
        // Check if end is after start
        if (cleanData.availability.start && endDate <= cleanData.availability.start) {
          errors.push("Availability end date must be after start date");
        }
      }
    }
  }

  // Validate insuranceTerms
  if (!data.insuranceTerms || typeof data.insuranceTerms !== "string" || data.insuranceTerms.trim() === "") {
    errors.push("Insurance terms are required and must be a valid string");
  } else {
    cleanData.insuranceTerms = data.insuranceTerms.trim();
  }

  // Optional fields with validation
  if (data.imageUrl && (typeof data.imageUrl !== "string" || data.imageUrl.trim() === "")) {
    errors.push("Image URL must be a valid string");
  } else if (data.imageUrl) {
    cleanData.imageUrl = data.imageUrl.trim();
  }

  if (data.isNegotiable !== undefined) {
    if (typeof data.isNegotiable !== "boolean") {
      errors.push("isNegotiable must be a boolean");
    } else {
      cleanData.isNegotiable = data.isNegotiable;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: cleanData,
  };
};

module.exports = {
  validateRentalData,
  validateReturnData,
  validateListData,
  validateCarData,
}; 