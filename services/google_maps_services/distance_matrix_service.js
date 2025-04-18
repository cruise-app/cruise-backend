const axios = require("axios");

class DistanceMatrixService {
  // Singleton instance
  constructor() {
    if (DistanceMatrixService.instance) {
      return DistanceMatrixService.instance; // Return existing instance
    }

    this.apiKey = "AIzaSyDgPP19CS1KNFWZ-0uBx31cOyChs703ku4";
    this.baseUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?key=${this.apiKey}`;
  }

  async getTripDistanceAndDuration(origin, destination, mode = "driving") {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          origins: origin.latitude + "," + origin.longitude,
          destinations: destination.latitude + "," + destination.longitude,
          mode: mode,
          key: this.apiKey,
        },
      });

      if (response.data.status === "OK") {
        const element = response.data.rows[0].elements[0];
        if (element.status === "OK") {
          return {
            distance: element.distance.text,
            duration: element.duration.text,
          };
        } else {
          throw new Error(`Distance Matrix API error: ${element.status}`);
        }
      } else {
        throw new Error(`Distance Matrix API error: ${response.data.status}`);
      }
    } catch (error) {
      console.error("Error fetching distance and duration:", error);
      throw error;
    }
  }
}

module.exports = new DistanceMatrixService(); // Exporting the single instance
