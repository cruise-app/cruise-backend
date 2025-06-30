require("dotenv").config();
const mongoose = require("mongoose");
const RentalCar = require("./models/rental_car_model");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected for seeding");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const sampleCars = [
  {
    plateNumber: "ABC-123",
    model: "Toyota Camry 2023",
    category: "Sedan",
    ownerId: "owner-001",
    location: {
      type: "Point",
      coordinates: [31.2357, 30.0444], // Cairo, Egypt
    },
    availability: {
      start: new Date("2024-01-01"),
      end: new Date("2024-12-31"),
    },
    dailyRate: 1500,
    isNegotiable: false,
    insuranceTerms: "Full coverage insurance included. Deductible: 500 EGP",
    imageUrl: "https://images.unsplash.com/photo-1517142089942-ba376ce32a0e?auto=format&fit=crop&w=800&q=80",
    features: ["GPS", "Bluetooth", "Air Conditioning", "Automatic"],
    fuelType: "Petrol",
    transmission: "Automatic",
    year: 2023,
    rating: 4.5,
  },
  {
    plateNumber: "XYZ-456",
    model: "Honda CR-V 2022",
    category: "SUV",
    ownerId: "owner-002",
    location: {
      type: "Point",
      coordinates: [31.3260, 30.0626], // New Cairo, Egypt
    },
    availability: {
      start: new Date("2024-01-01"),
      end: new Date("2024-12-31"),
    },
    dailyRate: 2000,
    isNegotiable: true,
    insuranceTerms: "Comprehensive insurance with 1000 EGP deductible",
    imageUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=800&q=80",
    features: ["4WD", "GPS", "Bluetooth", "Backup Camera", "Sunroof"],
    fuelType: "Petrol",
    transmission: "Automatic",
    year: 2022,
    rating: 4.7,
  },
  {
    plateNumber: "EV-789",
    model: "Tesla Model 3 2023",
    category: "Electric",
    ownerId: "owner-003",
    location: {
      type: "Point",
      coordinates: [31.2001, 29.9187], // Giza, Egypt
    },
    availability: {
      start: new Date("2024-01-01"),
      end: new Date("2024-12-31"),
    },
    dailyRate: 2500,
    isNegotiable: false,
    insuranceTerms: "Premium electric vehicle insurance included",
    imageUrl: "https://images.unsplash.com/photo-1585614307128-68c52f9a1006?auto=format&fit=crop&w=800&q=80",
    features: ["Autopilot", "Supercharging", "Premium Audio", "Glass Roof"],
    fuelType: "Electric",
    transmission: "Automatic",
    year: 2023,
    rating: 4.9,
  },
  {
    plateNumber: "COM-321",
    model: "Nissan Micra 2022",
    category: "Compact",
    ownerId: "owner-004",
    location: {
      type: "Point",
      coordinates: [31.2461, 30.0691], // Heliopolis, Egypt
    },
    availability: {
      start: new Date("2024-01-01"),
      end: new Date("2024-12-31"),
    },
    dailyRate: 1000,
    isNegotiable: true,
    insuranceTerms: "Basic insurance coverage with 300 EGP deductible",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    features: ["Air Conditioning", "Bluetooth", "USB Charging"],
    fuelType: "Petrol",
    transmission: "Manual",
    year: 2022,
    rating: 4.2,
  },
  {
    plateNumber: "STD-654",
    model: "Hyundai Elantra 2023",
    category: "Standard",
    ownerId: "owner-005",
    location: {
      type: "Point",
      coordinates: [31.2156, 30.0131], // Maadi, Egypt
    },
    availability: {
      start: new Date("2024-01-01"),
      end: new Date("2024-12-31"),
    },
    dailyRate: 1300,
    isNegotiable: false,
    insuranceTerms: "Standard insurance with 400 EGP deductible",
    imageUrl: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=800&q=80",
    features: ["GPS", "Bluetooth", "Air Conditioning", "Cruise Control"],
    fuelType: "Petrol",
    transmission: "Automatic",
    year: 2023,
    rating: 4.3,
  },
  {
    plateNumber: "LUX-999",
    model: "BMW X5 2023",
    category: "SUV",
    ownerId: "owner-006",
    location: {
      type: "Point",
      coordinates: [31.2394, 30.0131], // Zamalek, Egypt
    },
    availability: {
      start: new Date("2024-01-01"),
      end: new Date("2024-12-31"),
    },
    dailyRate: 3500,
    isNegotiable: true,
    insuranceTerms: "Premium luxury vehicle insurance with full coverage",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    features: ["Premium Sound", "Leather Seats", "Panoramic Sunroof", "4WD", "Navigation"],
    fuelType: "Petrol",
    transmission: "Automatic",
    year: 2023,
    rating: 4.8,
  },
];

const seedCars = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Clearing existing cars...");
    await RentalCar.deleteMany({});

    console.log("Seeding cars...");
    const createdCars = await RentalCar.insertMany(sampleCars);

    console.log(`Successfully seeded ${createdCars.length} cars:`);
    createdCars.forEach((car) => {
      console.log(`- ${car.plateNumber}: ${car.model} (${car.category}) - ${car.dailyRate} EGP/day`);
    });

    console.log("\nSeeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding cars:", error);
    process.exit(1);
  }
};

// Run the seeder
if (require.main === module) {
  seedCars();
}

module.exports = { seedCars, sampleCars }; 