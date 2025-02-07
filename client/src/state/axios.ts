import axios from 'axios';
import { signOut } from 'next-auth/react';

const axiosInstance = axios.create({
  baseURL: 'https://localhost:8080/api',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const response = await axios.post('/api/auth/refresh', {
          refreshToken: localStorage.getItem('refreshToken'),
        });
        if (response.data.accessToken) {
          error.config.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
          localStorage.setItem('accessToken', response.data.accessToken);
          return axiosInstance(error.config);
        }
      } catch (refreshError) {
        await signOut({ redirect: true, callbackUrl: '/login' });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;