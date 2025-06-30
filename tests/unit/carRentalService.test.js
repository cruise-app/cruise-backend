const carRentalService = require('../../services/carRentalService');
const rentalCarRepository = require('../../repositories/rentalCarRepository');
const rentRepository = require('../../repositories/rentRepository');
const publisher = require('../../events/publisher');
const axios = require('axios');

// Mock all dependencies
jest.mock('../../repositories/rentalCarRepository');
jest.mock('../../repositories/rentRepository');
jest.mock('../../events/publisher');
jest.mock('axios');

// Mock environment variables
process.env.USER_SERVICE_URL = 'http://localhost:3002';
process.env.CAR_CATALOG_URL = 'http://localhost:3003';
process.env.PAYMENT_SERVICE_URL = 'http://localhost:3004';

describe('CarRentalService', () => {
  beforeEach(() => {
    console.log('\n🧪 Setting up test environment...');
    jest.clearAllMocks();
    // Mock successful responses for external services
    axios.get.mockResolvedValue({ data: { verified: true } });
    axios.post.mockResolvedValue({ data: { paymentId: 'payment123' } });
  });

  describe('listAvailableCars', () => {
    it('should return available cars with filters', async () => {
      console.log('📋 Testing: List available cars with filters');
      const mockCars = [{ id: 1, model: 'Tesla' }];
      rentalCarRepository.findAvailable.mockResolvedValue(mockCars);

      const result = await carRentalService.listAvailableCars({ model: 'Tesla' });
      console.log('✅ Found cars:', result);
      
      expect(result).toEqual(mockCars);
      expect(rentalCarRepository.findAvailable).toHaveBeenCalledWith({ model: 'Tesla' });
    });
  });

  describe('reserveCar', () => {
    const mockRentalData = {
      carId: 'ABC123',
      renterId: 'user123',
      startDate: '2024-01-01',
      endDate: '2024-01-03',
      pickupLocation: { lat: 0, lng: 0 }
    };

    it('should successfully reserve a car', async () => {
      console.log('📋 Testing: Successful car reservation');
      // Mock an available car
      const mockCar = { 
        _id: 'car123', 
        plateNumber: 'ABC123',
        dailyRate: 100,
        isAvailable: true 
      };
      console.log('🚗 Mock car:', mockCar);
      
      rentalCarRepository.findByPlate.mockResolvedValue(mockCar);
      
      // Mock successful rental creation
      const mockRental = { 
        id: 'rent123',
        carId: mockCar._id,
        ...mockRentalData
      };
      rentRepository.create.mockResolvedValue(mockRental);

      const result = await carRentalService.reserveCar(mockRentalData);
      console.log('✅ Created rental:', result);
      
      expect(result).toBeDefined();
      expect(rentRepository.create).toHaveBeenCalled();
      expect(publisher.publishRentalCreated).toHaveBeenCalled();
      expect(rentalCarRepository.updateAvailability).toHaveBeenCalledWith('ABC123', false);
    });

    it('should throw error if car is not available', async () => {
      console.log('📋 Testing: Car not available error case');
      rentalCarRepository.findByPlate.mockResolvedValue(null);

      try {
        await carRentalService.reserveCar(mockRentalData);
      } catch (error) {
        console.log('✅ Caught expected error:', error.message);
        expect(error.message).toBe('Car is not available');
      }
    });
  });

  describe('returnCar', () => {
    it('should successfully process car return', async () => {
      console.log('📋 Testing: Successful car return');
      const mockRent = {
        _id: 'rent123',
        carId: { plateNumber: 'ABC123' },
        status: 'active'
      };
      console.log('📝 Mock rental:', mockRent);
      
      rentRepository.findById.mockResolvedValue(mockRent);

      const result = await carRentalService.returnCar('rent123');
      console.log('✅ Return processed:', result);
      
      expect(result).toBeDefined();
      expect(rentRepository.updateStatus).toHaveBeenCalledWith('rent123', 'completed');
      expect(publisher.publishRentalCompleted).toHaveBeenCalled();
    });

    it('should throw error if rental is not found', async () => {
      console.log('📋 Testing: Rental not found error case');
      rentRepository.findById.mockResolvedValue(null);

      try {
        await carRentalService.returnCar('rent123');
      } catch (error) {
        console.log('✅ Caught expected error:', error.message);
        expect(error.message).toBe('Rental not found');
      }
    });
  });
}); 