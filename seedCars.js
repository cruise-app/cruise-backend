const mongoose = require('mongoose');
require('dotenv').config();

if (!process.env.MONGO_URI) {
  console.error('❌  MONGO_URI not set in .env – aborting seed');
  process.exit(1);
}

const RentalCar = require('./models/RentalCar');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await RentalCar.deleteMany({});

    const cars = [
      {
        plateNumber: 'CAR001',
        model: 'Audi A4',
        category: 'Sedan',
        ownerId: 'owner1',
        location: { lat: 30.0444, lng: 31.2357 }, // Cairo coordinates
        availability: {
          start: new Date(),
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
        },
        dailyRate: 2200,
        isNegotiable: false,
        insuranceTerms: 'Full coverage insurance included',
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'
      },
      {
        plateNumber: 'CAR002',
        model: 'Nissan Leaf',
        category: 'Electric',
        ownerId: 'owner2',
        location: { lat: 30.0444, lng: 31.2357 },
        availability: {
          start: new Date(),
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        dailyRate: 1800,
        isNegotiable: false,
        insuranceTerms: 'Full coverage insurance included',
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=800&q=80'
      },
      {
        plateNumber: 'CAR003',
        model: 'Honda Civic',
        category: 'Compact',
        ownerId: 'owner3',
        location: { lat: 30.0444, lng: 31.2357 },
        availability: {
          start: new Date(),
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        dailyRate: 1500,
        isNegotiable: true,
        insuranceTerms: 'Full coverage insurance included',
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&w=800&q=80'
      },
      {
        plateNumber: 'CAR004',
        model: 'Toyota RAV4',
        category: 'SUV',
        ownerId: 'owner4',
        location: { lat: 30.0444, lng: 31.2357 },
        availability: {
          start: new Date(),
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        dailyRate: 2800,
        isNegotiable: false,
        insuranceTerms: 'Full coverage insurance included',
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1625231334168-35067f8853ed?auto=format&fit=crop&w=800&q=80'
      },
      {
        plateNumber: 'CAR005',
        model: 'Tesla Model 3',
        category: 'Electric',
        ownerId: 'owner5',
        location: { lat: 30.0444, lng: 31.2357 },
        availability: {
          start: new Date(),
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        dailyRate: 3500,
        isNegotiable: false,
        insuranceTerms: 'Full coverage insurance included',
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80'
      },
      {
        plateNumber: 'CAR006',
        model: 'BMW 3 Series',
        category: 'Sedan',
        ownerId: 'owner6',
        location: { lat: 30.0444, lng: 31.2357 },
        availability: {
          start: new Date(),
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        dailyRate: 3000,
        isNegotiable: true,
        insuranceTerms: 'Full coverage insurance included',
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
      }
    ];

    await RentalCar.insertMany(cars);
    console.log(`✅  Inserted ${cars.length} cars`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})(); 