import { authApi } from './api';

export const authService = {
  login: async (email, password) => {
    const response = await authApi.login({ email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await authApi.register(userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await authApi.getProfile();
    return response.data;
  },
};