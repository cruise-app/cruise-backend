require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const publisher = require('./events/publisher');
const rentalController = require('./controllers/rentalController');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

// Allow CORS for local dev (Flutter web on another port)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Provide demo data when external services are not configured
const demoCars = [
  {
    plateNumber: 'DEV-123',
    model: 'Demo Sedan',
    category: 'Sedan',
    dailyRate: 2000,
    imageUrl:
      'https://images.unsplash.com/photo-1517142089942-ba376ce32a0e?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    plateNumber: 'ELEC-456',
    model: 'Electric Hatch',
    category: 'Electric',
    dailyRate: 2500,
    imageUrl:
      'https://images.unsplash.com/photo-1585614307128-68c52f9a1006?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  }
];

const hasDb = Boolean(process.env.MONGO_URI);

// Routes
if (hasDb) {
  app.get('/api/rentals', rentalController.listAvailableCars);
  app.get('/api/rentals/:plateNumber/reservations', rentalController.getReservations);
  app.post('/api/rentals', rentalController.reserveCar);
  app.post('/api/rentals/:rentId/return', rentalController.returnCar);
} else {
  console.warn('MONGO_URI is not set. Running in DEMO mode with in-memory data.');
  app.get('/api/rentals', (req, res) => {
    // naive filtering by category via ?category=Sedan etc.
    const { category } = req.query;
    const filtered = category ? demoCars.filter(c => c.category === category) : demoCars;
    res.json(filtered);
  });
}

// Error handling
app.use(errorHandler);

// Connect to MongoDB only if URI supplied
if (hasDb) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('Skipping MongoDB connection.');
}

// Connect to Kafka if broker provided
if (process.env.KAFKA_BROKER) {
  publisher
    .connect()
    .then(() => console.log('Connected to Kafka'))
    .catch(err => console.error('Kafka connection error:', err));
} else {
  console.log('Skipping Kafka connection.');
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (process.env.KAFKA_BROKER) {
    await publisher.disconnect();
  }
  if (hasDb) {
    await mongoose.connection.close();
  }
  process.exit(0);
}); 