# 🚗 Cruise Rental Backend

A Node.js/Express.js backend service for the Cruise Rental car sharing application.

## 🚀 **Features**

- **Car Rental Management**: Complete CRUD operations for car listings and reservations
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **RESTful API**: Clean, documented API endpoints
- **Event Publishing**: Kafka integration for event-driven architecture (optional)
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling and logging
- **Testing Suite**: Unit and integration tests included

## 📋 **Prerequisites**

- **Node.js** >= 16.0.0
- **MongoDB** >= 4.4.0 (running locally or connection string)
- **npm** or **yarn** package manager
- **Kafka** (optional, for event publishing)

## ⚡ **Quick Start**

### 1. **Clone & Install**
```bash
cd cruise-backend
npm install
```

### 2. **Environment Setup**
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your configuration
MONGODB_URI=mongodb://localhost:27017/rental-cars
PORT=3000
NODE_ENV=development
ENABLE_KAFKA=false
```

### 3. **Database Setup**
```bash
# Make sure MongoDB is running, then seed with sample data
npm run seed
```

### 4. **Start Development Server**
```bash
npm run dev
# or
npm start
```

The server will start on `http://localhost:3000`

## 🛠 **Available Scripts**

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run seed` - Seed database with sample car data
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## 🔧 **Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/rental-cars` | MongoDB connection string |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `ENABLE_KAFKA` | `false` | Enable/disable Kafka event publishing |
| `LOG_LEVEL` | `info` | Logging level |

## 📚 **API Endpoints**

### **Cars**
- `GET /api/rentals` - List available cars
- `GET /api/rentals/:id` - Get car details

### **Reservations**
- `POST /api/rentals` - Create new reservation
- `GET /api/rentals/:carId/reservations` - Get car reservations
- `POST /api/rentals/:rentId/return` - Process car return

### **Health Check**
- `GET /health` - Service health status

## 🏗 **Architecture**

```
├── controllers/     # Request handlers
├── models/         # MongoDB schemas
├── repositories/   # Data access layer
├── services/       # Business logic
├── validation/     # Input validation
├── middleware/     # Express middlewares
├── events/         # Event publishing
└── tests/          # Test suites
```

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "CarRentalService"
```

## 🔌 **Database Schema**

### **Car Model**
```javascript
{
  plateNumber: String,
  model: String,
  category: String, // 'Electric', 'Sedan', 'SUV', 'Compact'
  dailyRate: Number,
  location: { lat: Number, lng: Number },
  isAvailable: Boolean,
  imageUrl: String
}
```

### **Rental Model**
```javascript
{
  carId: ObjectId,
  renterId: String,
  startDate: Date,
  endDate: Date,
  totalCost: Number,
  status: String,
  pickupLocation: { lat: Number, lng: Number }
}
```

## 🚨 **Troubleshooting**

### **MongoDB Connection Issues**
- Ensure MongoDB service is running
- Check connection string in `.env`
- Verify network connectivity

### **Port Already in Use**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>
```

### **Kafka Warnings**
If you see Kafka connection warnings, set `ENABLE_KAFKA=false` in your `.env` file.

## 🤝 **Contributing**

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License. 