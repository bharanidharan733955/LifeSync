import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-client-platform': Platform.OS,
  },
});

let memoryAccessToken = null;

// Secure storage helper
export const saveSecureItem = async (key, value) => {
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Fallback if SecureStore native module not linked in dev environment
  }
};

export const getSecureItem = async (key) => {
  try {
    const SecureStore = await import('expo-secure-store');
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

export const deleteSecureItem = async (key) => {
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Fallback
  }
};

export const setAuthToken = (token) => {
  memoryAccessToken = token;
};

// Request interceptor attaches bearer token
api.interceptors.request.use(async (config) => {
  if (memoryAccessToken) {
    config.headers.Authorization = `Bearer ${memoryAccessToken}`;
  } else {
    const token = await getSecureItem('accessToken');
    if (token) {
      memoryAccessToken = token;
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor handles refresh rotation for mobile via SecureStore
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const storedRefreshToken = await getSecureItem('refreshToken');
        if (storedRefreshToken) {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken: storedRefreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          setAuthToken(accessToken);
          await saveSecureItem('accessToken', accessToken);
          await saveSecureItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        setAuthToken(null);
        await deleteSecureItem('accessToken');
        await deleteSecureItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
