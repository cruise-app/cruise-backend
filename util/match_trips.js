const mongoose = require("mongoose");
const Trip = require("../models/trip_model");
const polyline = require("@googlemaps/polyline-codec");
const geolib = require("geolib");

const MAX_DISTANCE = 100; // meters

function isCloseToRoute(routePoints, passengerPoint, maxDistance) {
  return routePoints.some((routePoint) => {
    const distance = geolib.getDistance(routePoint, passengerPoint);
    return distance <= maxDistance;
  });
}

async function findSuitableTrips(
  userId,
  passengerPickUp,
  passengerDropOff,
  maxDistance = 100
) {
  try {
    const trips = await Trip.find({});
    if (!trips || trips.length === 0) {
      return {
        success: false,
        error: "No trips found in the database",
      };
    }

    const suitableTrips = [];

    for (const trip of trips) {
      // if (trip.driverId.toString() === userId.toString()) {
      //   continue; // Skip trips that belong to the same driver
      // }
      const startCoordinates = trip.startLocationPoint?.coordinates;
      const endCoordinates = trip.endLocationPoint?.coordinates || [];

      if (!startCoordinates || !endCoordinates) {
        continue; // Skip trips with invalid coordinates
      }

      const routeCoordinates = polyline.decode(trip.polyline);
      const driverRoutePoints = routeCoordinates.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));

      const isPickupSuitable = isCloseToRoute(
        driverRoutePoints,
        passengerPickUp,
        maxDistance
      );
      const isDropoffSuitable = isCloseToRoute(
        driverRoutePoints,
        passengerDropOff,
        maxDistance
      );

      if (isPickupSuitable && isDropoffSuitable) {
        suitableTrips.push(trip);
      }
    }

    return {
      success: true,
      data: suitableTrips,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error finding suitable trips: ${error.message}`,
    };
  }
}

module.exports = {
  findSuitableTrips,
  isCloseToRoute,
};
