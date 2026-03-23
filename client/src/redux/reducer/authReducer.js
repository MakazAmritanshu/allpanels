import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

import api from '../api';

export const loginUser = createAsyncThunk(
  'user/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/login', userData, {
        withCredentials: true, // ✅ Allows sending and receiving cookies
      });

      const data = response.data;
      console.log(data, 'user');

      // ✅ Store token in localStorage (Not recommended for auth security)
      if (data.token) {
        localStorage.setItem('auth', data.token);
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong in login' }
      );
    }
  }
);
export const addAdmin = createAsyncThunk(
  'user/create-admin',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sub-admin/create', formData, {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);

export const getUser = createAsyncThunk(
  'user/get-user',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/get/user-details', {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong in login' }
      );
    }
  }
);

export const changePasswordBySelf = createAsyncThunk(
  'user/changePasswordBySelf',
  async (data, { rejectWithValue }) => {
    console.log('Access denied, admin only', data);
    try {
      const response = await api.post('/change/password-self/user', data, {
        withCredentials: true,
      });
      console.log('=== API Response Success ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response headers:', response.headers);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const changePasswordByFirstLogin = createAsyncThunk(
  'user/changePasswordByFirstLogin',
  async (data, { rejectWithValue }) => {
    console.log('Access denied, admin only', data);
    try {
      const response = await api.post('/change/password/first-login', data, {
        withCredentials: true,
      });
      console.log('=== API Response Success ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response headers:', response.headers);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const passwordHistory = createAsyncThunk(
  'user/passwordHistory',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    // console.log("Access denied, admin only", data);
    try {
      const response = await api.get(
        `/password/history?page=${page}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getLoginHistory = createAsyncThunk(
  'creditRef/getUserLoginHistory',
  async (userId, { rejectWithValue }) => {
    console.log('object', userId);
    try {
      const res = await api.get(`/get/user-login-history/${userId}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Fetch failed' }
      );
    }
  }
);

export const updateQuickStakes = createAsyncThunk(
  'user/updateQuickStakes',
  async (quickStakes, { rejectWithValue }) => {
    try {
      const response = await api.put(
        '/update/quick-stakes',
        { quickStakes },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update stakes' }
      );
    }
  }
);
export const updateUserTheme = createAsyncThunk(
  'user/updateTheme',
  async (theme, { rejectWithValue }) => {
    try {
      const response = await api.put(
        '/update/theme',
        { theme },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update theme' }
      );
    }
  }
);

const decodeToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);

    // Check if token has expiration and if it's expired
    if (decoded.exp) {
      const currentTime = Date.now() / 1000; // Convert to seconds
      if (decoded.exp < currentTime) {
        // Token is expired - clear it from localStorage
        console.log('Token expired, clearing localStorage');
        localStorage.removeItem('auth');
        return null;
      }
    }

    return decoded;
  } catch {
    // Invalid token format - clear it from localStorage
    console.log('Invalid token format, clearing localStorage');
    localStorage.removeItem('auth');
    return null;
  }
};

// Initial state
const initialState = {
  user: null,
  userInfo: decodeToken(localStorage.getItem('auth')) || null,
  loading: false,
  error: null,
  LoginData: [],
  singleadmin: null,
  useraddress: null,
  userDetail: null,
  passwordData: null,
  message: null,
  isPasswordChanged: null,
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    messageClear: (state) => {
      state.errorMessage = '';
      state.successMessage = '';
    },
    user_reset: (state) => {
      state.userInfo = '';
    },
    //New Websocket Updates
    updateAvbalance: (state, action) => {
      if (state.userInfo) {
        state.userInfo.avbalance = action.payload;
      }
    },
    updateExposure: (state, action) => {
      if (state.userInfo) {
        state.userInfo.exposure = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder

      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.userInfo = action.payload.data;
        state.isPasswordChanged = action.payload.data?.isPasswordChanged;
        console.log('User Info:', state.userInfo);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // add user
      .addCase(addAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(addAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get user by ID
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.data;
        state.isPasswordChanged = action.payload.data?.isPasswordChanged;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Clear userInfo when backend rejects the token (invalid/expired)
        state.userInfo = null;
        localStorage.removeItem('auth');
      })
      .addCase(changePasswordBySelf.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
        state.successMessage = null;
      })
      .addCase(changePasswordBySelf.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.userInfo = action.payload.data;
        // state.errorMessage = null;
      })
      .addCase(changePasswordBySelf.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload.message;
      })

      .addCase(changePasswordByFirstLogin.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
        state.successMessage = null;
      })
      .addCase(changePasswordByFirstLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.userInfo = action.payload.data;
        state.isPasswordChanged = action.payload.isPasswordChanged;

        // state.errorMessage = null;
      })
      .addCase(changePasswordByFirstLogin.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload.message;
      })

      .addCase(passwordHistory.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
        state.successMessage = null;
      })
      .addCase(passwordHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.passwordData = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          pages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
        };
        // state.errorMessage = null;
      })
      .addCase(passwordHistory.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload.message;
      })
      .addCase(getLoginHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLoginHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.LoginData = action.payload.data;
      })
      .addCase(getLoginHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Update Quick Stakes
      .addCase(updateQuickStakes.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
        state.successMessage = null;
      })
      .addCase(updateQuickStakes.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(updateQuickStakes.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message;
      })
      // Update Theme
      .addCase(updateUserTheme.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
        state.successMessage = null;
      })
      .addCase(updateUserTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.data;
        state.successMessage = action.payload.message;
        if (action.payload.data?.theme) {
          localStorage.setItem('userTheme', action.payload.data.theme);
        }
      })
      .addCase(updateUserTheme.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload?.message;
      });
  },
});

export const {
  clearError,
  messageClear,
  user_reset,
  updateAvbalance,
  updateExposure,
} = userSlice.actions;

export default userSlice.reducer;
