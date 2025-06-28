const carRentalService = require('../services/carRentalService');
const { reserveCarSchema, returnCarSchema, listCarsSchema } = require('../validation/rentalValidation');

class RentalController {
  async listAvailableCars(req, res, next) {
    try {
      const { error, value } = listCarsSchema.validate(req.query);
      if (error) {
        throw error;
      }

      const cars = await carRentalService.listAvailableCars(value);
      res.json(cars);
    } catch (error) {
      next(error);
    }
  }

  async reserveCar(req, res, next) {
    try {
      const { error, value } = reserveCarSchema.validate(req.body);
      if (error) {
        throw error;
      }

      const rental = await carRentalService.reserveCar(value);
      res.status(201).json(rental);
    } catch (error) {
      next(error);
    }
  }

  async returnCar(req, res, next) {
    try {
      const { error, value } = returnCarSchema.validate(req.params);
      if (error) {
        throw error;
      }

      const rental = await carRentalService.returnCar(value.rentId);
      res.json(rental);
    } catch (error) {
      next(error);
    }
  }

  async getReservations(req, res, next) {
    try {
      const { plateNumber } = req.params;
      const reservations = await carRentalService.listReservations(plateNumber);
      res.json(reservations);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RentalController(); 