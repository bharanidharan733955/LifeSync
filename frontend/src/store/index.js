import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice.js';
import authReducer from './authSlice.js';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
  },
});

export default store;

