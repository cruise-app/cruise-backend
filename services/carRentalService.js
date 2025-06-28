const axios = require('axios');
const rentalCarRepository = require('../repositories/rentalCarRepository');
const rentRepository = require('../repositories/rentRepository');
const publisher = require('../events/publisher');

class CarRentalService {
  constructor() {
    this.userServiceUrl = process.env.USER_SERVICE_URL;
    this.carCatalogUrl = process.env.CAR_CATALOG_URL;
    this.paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;
  }

  async listAvailableCars(filters) {
    return rentalCarRepository.findAvailable(filters);
  }

  async reserveCar(rentalData) {
    const {
      carId,
      renterId,
      startDate,
      endDate,
      pickupLocation
    } = rentalData;

    // 1. Authenticate renter
    await this.authenticateUser(renterId);

    // 2. Get car details and check availability
    const car = await rentalCarRepository.findByPlate(carId);
    if (!car || !car.isAvailable) {
      throw new Error('Car is not available');
    }

    // 2b. Reject if date-range overlaps existing reservations
    const overlapping = await rentRepository.findOverlapping(
      car._id,
      new Date(startDate),
      new Date(endDate)
    );
    if (overlapping.length) {
      throw new Error('Car already reserved for the selected dates');
    }

    // 3. Check & lock car in catalog (if catalog integration configured)
    await this.lockCarInCatalog(carId);

    try {
      // 4. Calculate total cost
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      const totalCost = days * car.dailyRate;

      // 5. Process payment
      const paymentId = await this.processPayment(renterId, totalCost);

      // 6. Create rental record
      const rent = await rentRepository.create({
        carId: car._id,
        renterId,
        startDate,
        endDate,
        totalCost,
        pickupLocation,
        paymentId,
        status: 'active'
      });

      // 7. Don't change car availability - cars can have future reservations
      // Car availability is handled by date overlap checks

      // 8. Publish event
      await publisher.publishRentalCreated(rent);

      return rent;
    } catch (error) {
      // Rollback: Unlock car in catalog
      await this.unlockCarInCatalog(carId);
      throw error;
    }
  }

  async returnCar(rentId) {
    const rent = await rentRepository.findById(rentId);
    if (!rent) {
      throw new Error('Rental not found');
    }

    if (rent.status !== 'active') {
      throw new Error('Rental is not active');
    }

    // 1. Update rental status
    await rentRepository.updateStatus(rentId, 'completed');

    // 2. Car availability is handled by date overlap checks
    // No need to manually update availability

    // 3. Unlock car in catalog
    await this.unlockCarInCatalog(rent.carId.plateNumber);

    // 4. Publish event
    await publisher.publishRentalCompleted(rent);

    return rent;
  }

  // Private helper methods
  async authenticateUser(userId) {
    // Skip auth in dev if no USER_SERVICE_URL set
    if (!this.userServiceUrl) return;
    try {
      await axios.get(`${this.userServiceUrl}/users/${userId}/verify`);
    } catch (error) {
      throw new Error('User authentication failed');
    }
  }

  async lockCarInCatalog(carId) {
    if (!this.carCatalogUrl) return;
    try {
      await axios.post(`${this.carCatalogUrl}/cars/${carId}/lock`);
    } catch (error) {
      throw new Error('Failed to lock car in catalog');
    }
  }

  async unlockCarInCatalog(carId) {
    if (!this.carCatalogUrl) return;
    try {
      await axios.post(`${this.carCatalogUrl}/cars/${carId}/unlock`);
    } catch (error) {
      console.error('Failed to unlock car in catalog:', error.message || error);
    }
  }

  async processPayment(userId, amount) {
    // If no payment service configured just return a fake id in dev
    if (!this.paymentServiceUrl) {
      return `FAKE_PAY_${Date.now()}`;
    }
    try {
      const response = await axios.post(`${this.paymentServiceUrl}/payments`, {
        userId,
        amount,
        type: 'rental'
      });
      return response.data.paymentId;
    } catch (error) {
      throw new Error('Payment processing failed');
    }
  }

  async listReservations(plateNumber) {
    const car = await rentalCarRepository.findByPlate(plateNumber);
    if (!car) throw new Error('Car not found');
    return rentRepository.findByCarId(car._id);
  }
}

module.exports = new CarRentalService(); 