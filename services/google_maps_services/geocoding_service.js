const axios = require("axios");

class GeocodingService {
  constructor() {
    if (GeocodingService.instance) {
      return GeocodingService.instance;
    }

    this.apiKey = "AIzaSyDgPP19CS1KNFWZ-0uBx31cOyChs703ku4";
    this.baseUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${this.apiKey}`;

    GeocodingService.instance = this;
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
          success: true,
          data: {
            latitude: location.lat,
            longitude: location.lng,
          },
        };
      } else {
        throw new Error(`Geocoding API error: ${response.data.status}`);
      }
    } catch (error) {
      throw new Error(
        `Error fetching coordinates for ${address}: ${error.message}`
      );
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
        return {
          success: true,
          data: response.data.results[0].formatted_address,
        };
      } else {
        return {
          success: false,
          error: `Geocoding API error: ${response.data.status}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Error fetching address: ${error.message}`,
      };
    }
  }
}

module.exports = new GeocodingService(); // Exporting the single instance
