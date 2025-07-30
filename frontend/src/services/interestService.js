import api from './api';

export const interestService = {
  // Express interest in an offer
  async expressInterest(offerId) {
    try {
      const response = await api.post(`/interest/${offerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get artists who expressed interest in an offer
  async getInterests(offerId) {
    try {
      const response = await api.get(`/interest/${offerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove interest
  async removeInterest(offerId) {
    try {
      const response = await api.delete(`/interest/${offerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default interestService;