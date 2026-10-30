import axios from 'axios';
import { Platform } from 'react-native';

// In Android emulator, 10.0.2.2 refers to host localhost; in iOS or physical device use local network IP
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentAccessToken = null;

export const setAuthToken = (token) => {
  currentAccessToken = token;
};

api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

export default api;

