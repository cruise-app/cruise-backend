const mongoose = require('mongoose');

/**
 * @typedef {Object} RentalCar
 * @property {string} plateNumber - Unique identifier for the car
 * @property {string} model - Car model
 * @property {string} ownerId - ID of the car owner
 * @property {Object} location - Car's current location
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {Object} availability - Car's availability window
 * @property {Date} availability.start - Start date of availability
 * @property {Date} availability.end - End date of availability
 * @property {number} dailyRate - Daily rental rate
 * @property {boolean} isNegotiable - Whether the rate is negotiable
 * @property {string} insuranceTerms - Insurance terms and conditions
 * @property {boolean} isAvailable - Current availability status
 */

const rentalCarSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    unique: true
  },
  model: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Sedan', 'SUV', 'Electric', 'Compact', 'Standard'],
    default: 'Standard',
  },
  ownerId: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  availability: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  isNegotiable: {
    type: Boolean,
    default: false
  },
  insuranceTerms: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=800&q=80'
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RentalCar', rentalCarSchema); 