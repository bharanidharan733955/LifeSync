import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../services/api.js';

// ─── Async Thunk: Initialize persistent authentication ───────────────────────
export const initAuth = createAsyncThunk('auth/initAuth', async (_, { rejectWithValue }) => {
  try {
    // If access token is present, fetch user; otherwise attempt cookie-based refresh
    let token = localStorage.getItem('accessToken');
    if (!token) {
      try {
        const refreshRes = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        token = refreshRes.data?.data?.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
        }
      } catch {
        // No valid session cookie found; user is simply not logged in
        return rejectWithValue('No active session');
      }
    }

    if (!token) {
      return rejectWithValue('No access token');
    }

    const res = await api.get('/auth/me');
    return {
      user: res.data?.data?.user,
      accessToken: token,
    };
  } catch (err) {
    localStorage.removeItem('accessToken');
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

// ─── Async Thunk: Logout ─────────────────────────────────────────────────────
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  try {
    await api.post('/auth/logout', {});
  } catch {
    // Ignore errors on logout
  } finally {
    dispatch(logout());
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: true, // starts loading until session is checked
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('accessToken');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(initAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { setCredentials, updateUser, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
