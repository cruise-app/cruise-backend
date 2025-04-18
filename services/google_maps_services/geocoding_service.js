const axios = require("axios");

class GeocodingService {
  constructor() {
    if (GeocodingService.instance) {
      return GeocodingService.instance; // If an instance already exists, return it
    }

    this.apiKey = "AIzaSyDgPP19CS1KNFWZ-0uBx31cOyChs703ku4";
    this.baseUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${this.apiKey}`;

    GeocodingService.instance = this; // Save the created instance as a static property
  }

  async getCoordinates(address) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          address: address,
          key: this.apiKey,
        },
      });
      if (response.data.status === "OK") {
        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        throw new Error(`Geocoding API error: ${response.data.status}`);
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      throw error;
    }
  }

  async getAddress(latitude, longitude) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.apiKey,
        },
      });
      if (response.data.status === "OK") {
        return response.data.results[0].formatted_address;
      } else {
        throw new Error(`Geocoding API error: ${response.data.status}`);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      throw error;
    }
  }
}

module.exports = new GeocodingService(); // Exporting the single instance
