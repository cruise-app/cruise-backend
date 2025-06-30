const express = require("express");
const router = express.Router();

const CarRentalController = require("../controllers/rental/rental_controller");

router.post("/addCar", CarRentalController.addCar);
router.get("/getCars", CarRentalController.listAvailableCars);

// GET /api/rentals - List available cars
//router.get("/", listAvailableCars);

// GET /api/rentals/:plateNumber/reservations - Get reservations for a car
// router.get("/:plateNumber/reservations", getReservations);

// // POST /api/rentals - Reserve a car
// router.post("/", reserveCar);

// // POST /api/rentals/:rentId/return - Return a car
// router.post("/:rentId/return", returnCar);

module.exports = router;
