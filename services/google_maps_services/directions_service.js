const axios = require("axios");

class DirectionService {
  constructor() {
    if (DirectionService.instance) {
      return DirectionService.instance; // Return existing instance
    }
    this.apiKey = "AIzaSyDgPP19CS1KNFWZ-0uBx31cOyChs703ku4";
    this.baseUrl = "https://maps.googleapis.com/maps/api/directions/json";

    DirectionService.instance = this; // Save the created instance as a static property
  }

  async getDirections(origin, destination, mode = "driving") {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          origin: origin.latitude + "," + origin.longitude,
          destination: destination.latitude + "," + destination.longitude,
          mode: mode,
          key: this.apiKey,
        },
      });

      if (response.data.status === "OK") {
        return response.data.routes[0].overview_polyline.points; // Return the first leg of the first route
      } else {
        throw new Error(`Directions API error: ${response.data.status}`);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      throw error;
    }
  }
}

module.exports = new DirectionService(); // Exporting the single instance
