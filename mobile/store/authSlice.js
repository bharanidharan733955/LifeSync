import { createSlice } from '@reduxjs/toolkit';
import { setAuthToken, saveSecureItem, deleteSecureItem } from '../services/api.js';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      setAuthToken(token);
      if (token) saveSecureItem('accessToken', token);
      if (refreshToken) saveSecureItem('refreshToken', refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setAuthToken(null);
      deleteSecureItem('accessToken');
      deleteSecureItem('refreshToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
