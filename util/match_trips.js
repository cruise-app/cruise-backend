const mongoose = require("mongoose");
const Trip = require("../models/trip_schema");
const polyline = require("@googlemaps/polyline-codec");
const geolib = require("geolib");

const MAX_DISTANCE = 1000; // meters
// const passengerPickup = {latitude: 30.05, longitude: 31.23};
// const passengerDropoff = {latitude: 30.07, longitude: 31.25};

function isCloseToRoute(routePoints, passengerPoint) {
  return routePoints.some((routePoint) => {
    const distance = geolib.getDistance(routePoint, passengerPoint); // in meters
    console.log(distance);
    return distance <= MAX_DISTANCE;
  });
}

async function findSuitableTrips(
  passengerPickUp,
  passengerDropOff,
  maxPickupDistance,
  maxDropoffDistance
) {
  try {
    const trips = await Trip.find({});
    console.log("Trips found:", trips.length);
    console.log("Passenger pickup:", passengerPickUp);
    console.log("Passenger dropoff:", passengerDropOff);
    const suitableTrips = [];

    for (const trip of trips) {
      const routeCoordinates = polyline.decode(trip.polyline);
      const driverRoutePoints = routeCoordinates.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
      console.log("Starting with pick up distance");
      const isPickupSuitable = isCloseToRoute(
        driverRoutePoints,
        passengerPickUp,
        maxPickupDistance
      );
      console.log("Starting with drop off distance");
      const isDropoffSuitable = isCloseToRoute(
        driverRoutePoints,
        passengerDropOff,
        maxDropoffDistance
      );

      if (isPickupSuitable.isClose && isDropoffSuitable.isClose) {
        suitableTrips.push({ trip, pickUpDistance, dropoffDistance });
      }
    }

    return suitableTrips;
  } catch (error) {
    console.error("Error finding suitable trips:", error);
    throw error;
  }
}

module.exports = findSuitableTrips;
