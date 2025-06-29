const RentalCar = require("../models/rental_car_model");
const Rental = require("../models/rental_model");
const axios = require("axios");

class RentalService {
  constructor() {
    this.userServiceUrl = process.env.USER_SERVICE_URL;
    this.carCatalogUrl = process.env.CAR_CATALOG_URL;
    this.paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;
  }

  async listAvailableCars(filters = {}) {
    try {
      const query = { isAvailable: true };
      
      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.model) {
        query.model = { $regex: filters.model, $options: 'i' };
      }
      
      if (filters.minPrice || filters.maxPrice) {
        query.dailyRate = {};
        if (filters.minPrice) query.dailyRate.$gte = filters.minPrice;
        if (filters.maxPrice) query.dailyRate.$lte = filters.maxPrice;
      }
      
      // Location-based filtering (if provided)
      if (filters.location && filters.location.lat && filters.location.lng) {
        // Add geospatial query for nearby cars
        query.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [filters.location.lng, filters.location.lat]
            },
            $maxDistance: 10000 // 10km radius
          }
        };
      }
      
      const cars = await RentalCar.find(query).sort({ dailyRate: 1 });
      
      // If date range is provided, filter out cars with overlapping reservations
      if (filters.startDate && filters.endDate) {
        const availableCars = [];
        
        for (const car of cars) {
          const overlappingRentals = await Rental.find({
            carId: car._id,
            status: { $in: ['active', 'pending'] },
            $or: [
              {
                startDate: { $lt: new Date(filters.endDate) },
                endDate: { $gt: new Date(filters.startDate) }
              }
            ]
          });
          
          if (overlappingRentals.length === 0) {
            availableCars.push(car);
          }
        }
        
        return availableCars;
      }
      
      return cars;
    } catch (error) {
      console.error("Error in listAvailableCars service:", error);
      throw new Error("Failed to retrieve available cars");
    }
  }

  async reserveCar(rentalData) {
    try {
      const { carId, renterId, startDate, endDate, pickupLocation } = rentalData;

      // 1. Authenticate user (if user service is configured)
      await this.authenticateUser(renterId);

      // 2. Get car details and check availability
      const car = await RentalCar.findOne({ plateNumber: carId });
      if (!car || !car.isAvailable) {
        throw new Error("Car is not available");
      }

      // 3. Check for overlapping reservations
      const overlappingRentals = await Rental.find({
        carId: car._id,
        status: { $in: ['active', 'pending'] },
        $or: [
          {
            startDate: { $lt: new Date(endDate) },
            endDate: { $gt: new Date(startDate) }
          }
        ]
      });

      if (overlappingRentals.length > 0) {
        throw new Error("Car already reserved for the selected dates");
      }

      // 4. Lock car in catalog (if configured)
      await this.lockCarInCatalog(carId);

      try {
        // 5. Calculate total cost
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalCost = days * car.dailyRate;

        // 6. Process payment
        const paymentId = await this.processPayment(renterId, totalCost);

        // 7. Create rental record
        const rental = new Rental({
          carId: car._id,
          renterId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalCost,
          pickupLocation,
          paymentId,
          status: 'active'
        });

        await rental.save();

        // 8. Populate car details for response
        await rental.populate('carId');

        // 9. Emit socket event for real-time updates
        if (global.io) {
          global.io.emit('rentalCreated', {
            rentalId: rental._id,
            carId: car._id,
            renterId,
            message: 'New car rental created'
          });
        }

        return rental;
      } catch (error) {
        // Rollback: Unlock car in catalog
        await this.unlockCarInCatalog(carId);
        throw error;
      }
    } catch (error) {
      console.error("Error in reserveCar service:", error);
      throw error;
    }
  }

  async returnCar(rentId) {
    try {
      const rental = await Rental.findById(rentId).populate('carId');
      
      if (!rental) {
        throw new Error("Rental not found");
      }

      if (rental.status !== 'active') {
        throw new Error("Rental is not active");
      }

      // 1. Update rental status
      rental.status = 'completed';
      rental.returnDate = new Date();
      await rental.save();

      // 2. Unlock car in catalog
      await this.unlockCarInCatalog(rental.carId.plateNumber);

      // 3. Emit socket event for real-time updates
      if (global.io) {
        global.io.emit('rentalCompleted', {
          rentalId: rental._id,
          carId: rental.carId._id,
          renterId: rental.renterId,
          message: 'Car rental completed'
        });
      }

      return rental;
    } catch (error) {
      console.error("Error in returnCar service:", error);
      throw error;
    }
  }

  async getReservations(plateNumber) {
    try {
      const car = await RentalCar.findOne({ plateNumber });
      
      if (!car) {
        throw new Error("Car not found");
      }

      const reservations = await Rental.find({ carId: car._id })
        .populate('carId')
        .sort({ startDate: -1 });

      return reservations;
    } catch (error) {
      console.error("Error in getReservations service:", error);
      throw error;
    }
  }

  // Private helper methods
  async authenticateUser(userId) {
    if (!this.userServiceUrl) return;
    
    try {
      await axios.get(`${this.userServiceUrl}/users/${userId}/verify`);
    } catch (error) {
      throw new Error("User authentication failed");
    }
  }

  async lockCarInCatalog(carId) {
    if (!this.carCatalogUrl) return;
    
    try {
      await axios.post(`${this.carCatalogUrl}/cars/${carId}/lock`);
    } catch (error) {
      console.warn("Failed to lock car in catalog:", error.message);
    }
  }

  async unlockCarInCatalog(carId) {
    if (!this.carCatalogUrl) return;
    
    try {
      await axios.post(`${this.carCatalogUrl}/cars/${carId}/unlock`);
    } catch (error) {
      console.warn("Failed to unlock car in catalog:", error.message);
    }
  }

  async processPayment(userId, amount) {
    if (!this.paymentServiceUrl) {
      return `DEMO_PAY_${Date.now()}`;
    }
    
    try {
      const response = await axios.post(`${this.paymentServiceUrl}/payments`, {
        userId,
        amount,
        type: 'rental'
      });
      return response.data.paymentId;
    } catch (error) {
      throw new Error("Payment processing failed");
    }
  }
}

module.exports = new RentalService(); 