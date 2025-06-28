const Rent = require('../models/Rent');

class RentRepository {
  async create(rentData) {
    const rent = new Rent(rentData);
    return rent.save();
  }

  async findById(id) {
    return Rent.findById(id).populate('carId');
  }

  async updateStatus(id, status) {
    return Rent.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
  }

  async findActiveByCarId(carId) {
    return Rent.findOne({
      carId,
      status: 'active'
    });
  }

  async findActiveByRenterId(renterId) {
    return Rent.find({
      renterId,
      status: 'active'
    });
  }

  async findByCarId(carId) {
    return Rent.find({
      carId,
      status: { $in: ['active', 'pending'] }
    });
  }

  /**
   * Returns rentals that overlap the given range [startDate, endDate] (inclusive).
   */
  async findOverlapping(carId, startDate, endDate) {
    return Rent.find({
      carId,
      status: { $in: ['active', 'pending'] },
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    });
  }
}

module.exports = new RentRepository(); 