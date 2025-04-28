const axios = require("axios");

class PlacesService {
  constructor() {
    // Singleton pattern: If an instance already exists, return the existing one
    if (PlacesService.instance) {
      return PlacesService.instance; // Return the existing instance
    }
    this.apiKey = "AIzaSyDgPP19CS1KNFWZ-0uBx31cOyChs703ku4";
    this.baseUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${this.apiKey}`;

    // Save the created instance as a static property
    PlacesService.instance = this;
  }

  // Method to get place suggestions
  async getPlacesSuggestions(input) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          input: input,
          key: this.apiKey,
        },
      });

      // Check if the response status is OK
      if (response.data.status === "OK") {
        console.log(response.data.predictions);

        return response.data.predictions.map(
          (prediction) => prediction.description
        );
      } else if (response.data.status === "ZERO_RESULTS") {
        return []; // Return an empty array if no results found
      } else {
        throw new Error(`Places API error: ${response.data.status}`);
      }
    } catch (error) {
      console.error("Error fetching places suggestions:", error);
      throw error;
    }
  }
}

// Exporting a single instance of PlacesService (Singleton)
module.exports = new PlacesService();
