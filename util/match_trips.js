const mongoose = require("mongoose");
const Trip = require("../models/trip_model");
const polyline = require("@googlemaps/polyline-codec");
const geolib = require("geolib");
const DirectionService = require("../services/google_maps_services/directions_service");

const MAX_DISTANCE = 100; // meters

function isCloseToRoute(routePoints, passengerPoint, maxDistance) {
  return routePoints.some((routePoint) => {
    const distance = geolib.getDistance(routePoint, passengerPoint);
    return distance <= maxDistance;
  });
}

function findClosestPoint(routePoints, targetPoint) {
  let closestPoint = null;
  let minDistance = Infinity;

  for (const routePoint of routePoints) {
    const distance = geolib.getDistance(routePoint, targetPoint);
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = routePoint;
    }
  }

  return closestPoint;
}

async function findSuitableTrips({
  userId,
  passengerPickUp,
  passengerDropOff,
  maxDistance = MAX_DISTANCE,
}) {
  try {
    console.log("Finding suitable trips for user:", userId);
    console.log("Passenger Pickup Coordinates:", passengerPickUp);
    console.log("Passenger Dropoff Coordinates:", passengerDropOff);
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
      //   continue; // Skip trips created by the user
      // }
      const startCoordinates = trip.startLocationPoint?.coordinates;
      const endCoordinates = trip.endLocationPoint?.coordinates;

      if (!startCoordinates || !endCoordinates) {
        continue;
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
        const closestPickupPoint = findClosestPoint(
          driverRoutePoints,
          passengerPickUp
        );
        const closestDropoffPoint = findClosestPoint(
          driverRoutePoints,
          passengerDropOff
        );

        // Fetch polylines for pickup and dropoff segments
        let pickupPolyline = null;
        let dropoffPolyline = null;

        if (closestPickupPoint && passengerPickUp) {
          try {
            pickupPolyline = await DirectionService.getDirections(
              passengerPickUp,
              closestPickupPoint
            );
          } catch (error) {
            console.error(
              `Error fetching pickup polyline for trip ${trip._id}:`,
              error.message
            );
          }
        }

        if (closestDropoffPoint && passengerDropOff) {
          try {
            dropoffPolyline = await DirectionService.getDirections(
              closestDropoffPoint,
              passengerDropOff
            );
          } catch (error) {
            console.error(
              `Error fetching dropoff polyline for trip ${trip._id}:`,
              error.message
            );
          }
        }

        console.log("pickupPolyline:", pickupPolyline);
        console.log("dropoffPolyline:", dropoffPolyline);

        suitableTrips.push({
          trip: trip.toObject(),
          closestPickupPoint: closestPickupPoint
            ? {
                latitude: closestPickupPoint.latitude,
                longitude: closestPickupPoint.longitude,
              }
            : null,
          closestDropoffPoint: closestDropoffPoint
            ? {
                latitude: closestDropoffPoint.latitude,
                longitude: closestDropoffPoint.longitude,
              }
            : null,
          pickupPolyline: pickupPolyline,
          dropoffPolyline: dropoffPolyline,
          passengerStartPoint: passengerPickUp,
          passengerEndPoint: passengerDropOff,
        });
      }
    }

    return {
      success: true,
      data: suitableTrips,
    };
  } catch (error) {
    console.error("Error in findSuitableTrips:", error);
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
