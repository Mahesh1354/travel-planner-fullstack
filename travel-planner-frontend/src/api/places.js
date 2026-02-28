import apiClient from "./client";

export const placesAPI = {
  // 8.1 Get place categories
  getCategories: async () => {
    try {
      const response = await apiClient.get("/places/categories");
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch categories:", error);
      return { data: [] };
    }
  },

  // 8.2 Search nearby places
  searchNearby: async (lat, lon, radius = 2000, category = "") => {
    try {
      let url = `/places/nearby?lat=${lat}&lon=${lon}&radius=${radius}`;
      if (category) url += `&category=${category}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.warn("Failed to search nearby places:", error);
      return { data: [] };
    }
  },

  // 8.3 Search by text
  searchByText: async (query, lat, lon, limit = 5) => {
    try {
      let url = `/places/search/text?query=${encodeURIComponent(query)}&limit=${limit}`;
      if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.warn("Failed to search places by text:", error);
      return { data: [] };
    }
  },

  // 8.4 Autocomplete
  autocomplete: async (query, lat, lon) => {
    try {
      let url = `/places/autocomplete?query=${encodeURIComponent(query)}`;
      if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.warn("Autocomplete failed:", error);
      // Re-throw to let the component handle it with mock data
      throw error;
    }
  },

  // 8.5 Get place details
  getPlaceDetails: async (placeId) => {
    try {
      const response = await apiClient.get(`/places/details/${placeId}`);
      return response.data;
    } catch (error) {
      console.warn("Failed to get place details:", error);
      return { data: null };
    }
  },
};

export default placesAPI;
