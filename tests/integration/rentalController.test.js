const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const rentalController = require('../../controllers/rentalController');
const errorHandler = require('../../middleware/errorHandler');

// Create test app
const app = express();
app.use(express.json());
app.get('/api/rentals', rentalController.listAvailableCars);
app.post('/api/rentals', rentalController.reserveCar);
app.post('/api/rentals/:rentId/return', rentalController.returnCar);
app.use(errorHandler);

// Mock services
jest.mock('../../services/carRentalService');
const carRentalService = require('../../services/carRentalService');

describe('Rental Controller Integration Tests', () => {
  let server;

  beforeAll(async () => {
    console.log('\n🚀 Starting integration test server...');
    // Start server
    server = app.listen(3001);
  });

  afterAll(async () => {
    console.log('\n🛑 Shutting down test server...');
    // Close server
    await new Promise(resolve => server.close(resolve));
  });

  beforeEach(() => {
    console.log('\n🧪 Setting up test case...');
    jest.clearAllMocks();
  });

  describe('GET /api/rentals', () => {
    it('should return available cars', async () => {
      console.log('📋 Testing: GET /api/rentals - List available cars');
      const mockCars = [{ id: 1, model: 'Tesla' }];
      carRentalService.listAvailableCars.mockResolvedValue(mockCars);

      const response = await request(app)
        .get('/api/rentals')
        .query({ model: 'Tesla' });

      console.log('✅ Response:', {
        status: response.status,
        body: response.body
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCars);
    });

    it('should handle validation errors', async () => {
      console.log('📋 Testing: GET /api/rentals - Validation error');
      const response = await request(app)
        .get('/api/rentals')
        .query({ minPrice: 'invalid' });

      console.log('✅ Response:', {
        status: response.status,
        body: response.body
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('POST /api/rentals', () => {
    const validRentalData = {
      carId: 'ABC123',
      renterId: 'user123',
      startDate: '2024-01-01',
      endDate: '2024-01-03',
      pickupLocation: { lat: 0, lng: 0 }
    };

    it('should create a new rental', async () => {
      console.log('📋 Testing: POST /api/rentals - Create rental');
      console.log('📝 Request data:', validRentalData);
      
      const mockRental = { id: 'rent123', ...validRentalData };
      carRentalService.reserveCar.mockResolvedValue(mockRental);

      const response = await request(app)
        .post('/api/rentals')
        .send(validRentalData);

      console.log('✅ Response:', {
        status: response.status,
        body: response.body
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockRental);
    });

    it('should handle validation errors', async () => {
      console.log('📋 Testing: POST /api/rentals - Validation error');
      const invalidData = { ...validRentalData, startDate: 'invalid' };
      console.log('📝 Invalid request data:', invalidData);

      const response = await request(app)
        .post('/api/rentals')
        .send(invalidData);

      console.log('✅ Response:', {
        status: response.status,
        body: response.body
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('POST /api/rentals/:rentId/return', () => {
    it('should process car return', async () => {
      console.log('📋 Testing: POST /api/rentals/:rentId/return - Process return');
      const mockRental = { id: 'rent123', status: 'completed' };
      carRentalService.returnCar.mockResolvedValue(mockRental);

      const response = await request(app)
        .post('/api/rentals/rent123/return');

      console.log('✅ Response:', {
        status: response.status,
        body: response.body
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRental);
    });

    it('should handle non-existent rental', async () => {
      console.log('📋 Testing: POST /api/rentals/:rentId/return - Non-existent rental');
      carRentalService.returnCar.mockRejectedValue(new Error('Rental not found'));

      const response = await request(app)
        .post('/api/rentals/nonexistent/return');

      console.log('✅ Response:', {
        status: response.status,
        body: response.body
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });
}); 