const Joi = require('joi');

const locationSchema = Joi.object({
  lat: Joi.number().required(),
  lng: Joi.number().required()
});

const reserveCarSchema = Joi.object({
  carId: Joi.string().required(),
  renterId: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  pickupLocation: locationSchema.required()
});

const returnCarSchema = Joi.object({
  rentId: Joi.string().required()
});

const listCarsSchema = Joi.object({
  model: Joi.string(),
  category: Joi.string(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  location: locationSchema,
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

module.exports = {
  reserveCarSchema,
  returnCarSchema,
  listCarsSchema
}; 