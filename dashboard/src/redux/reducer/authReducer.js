import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

import api from '../api';

export const loginAdmin = createAsyncThunk(
  'user/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sub-admin/login', userData, {
        withCredentials: true, // ✅ Allows sending and receiving cookies
      });

      const data = response.data;
      // console.log(data, "user");

      // ✅ Store token in localStorage (Not recommended for auth security)
      if (data.token) {
        localStorage.setItem('auth', data.token);
      }

      return data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
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
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const getAdmin = createAsyncThunk(
  'user/get-admin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/sub-admin/getuserbyid', {
        withCredentials: true,
      });
      const data = response.data;
      return data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const userLogout = createAsyncThunk(
  'auth/user-logout',

  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const response = await api.post(
        '/user-logout',
        {},
        {
          withCredentials: true,
        }
      );
      return fulfillWithValue(response.data);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// const logout = async () => {
//   try {
//     const response = await axios.post('/user-logout', {}, {
//       withCredentials: true,
//     });
//     localStorage.removeItem('auth');
//     toast.success(response.data.message);
//     setTimeout(() => {
//       navigate('/', { replace: true });
//     }, 500);
//   } catch (error) {
//     toast.error(error.response?.data?.message || error.message);
//   }
// };

export const getAllUserAndDownline = createAsyncThunk(
  'user/get-allUser_and_downline',
  async ({ page, limit, searchQuery }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/get/all-user?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);

export const getAllUsersWithCompleteInfo = createAsyncThunk(
  'user/getAllUsersWithCompleteInfo',
  async ({ page, limit, searchQuery }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/getAllUsersWithCompleteInfo?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);

export const getAlldeleteUser = createAsyncThunk(
  'user/get-all_delete_user',
  async ({ page, limit, searchQuery }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/get/delete-user?page=${page}&limit=${limit}$searchQuery=${searchQuery}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);
export const getAllOnlyUserAndDownline = createAsyncThunk(
  'user/get-allOnlyUser_and_downline',
  async ({ page, limit, searchQuery }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/get/all-only-user?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// ✅ Update sub-admin details
export const updateCreditReference = createAsyncThunk(
  'subAdmin/updateCreditReference',
  async (info, { rejectWithValue }) => {
    try {
      const response = await api.put(`/update/user-details`, info, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
export const updateExploserLimit = createAsyncThunk(
  'subAdmin/updateExploserLimit',
  async (info, { rejectWithValue }) => {
    try {
      const response = await api.put(`/update/user-explosore-limit`, info, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Update partnership for a downline
export const updatePartnership = createAsyncThunk(
  'subAdmin/updatePartnership',
  async (info, { rejectWithValue }) => {
    try {
      const response = await api.put('/update/partnership', info, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Get credit ref history by userId
export const getCreditRefHistory = createAsyncThunk(
  'creditRef/getHistory',
  async ({ userId, page, limit, searchQuery }, { rejectWithValue }) => {
    // console.log("object", userId, page, limit, searchQuery);
    try {
      const res = await api.get(
        `/credit-ref-history/${userId}?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// ✅ withdreowal and deposite
export const withdrawalAndDeposite = createAsyncThunk(
  'subAdmin/update',
  async (info, { rejectWithValue }) => {
    // console.log("info", info);
    try {
      const response = await api.put(`/withdrowal-deposite`, info, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
// ✅user setting
export const userSetting = createAsyncThunk(
  'subAdmin/user-setting',
  async (info, { rejectWithValue }) => {
    // console.log("info", info)
    try {
      const response = await api.put(`/user-setting`, info, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log('error111', error.response.data.message);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// ✅ Delete a sub-admin
export const deleteSubAdmin = createAsyncThunk(
  'auth/user_delete',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/sub-admin/delete/${userId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
// ✅ Delete a sub-admin
export const restoreUser = createAsyncThunk(
  'auth/restore_User',
  async ({ userId, masterPassword }, { rejectWithValue }) => {
    // console.log("object", userId, masterPassword);
    try {
      const response = await api.delete(
        `/restore/user/${userId}/${masterPassword}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const fetchSubAdminByLevel = createAsyncThunk(
  'subAdmin/fetchByLevel',
  async ({ code }, { rejectWithValue }) => {
    // console.log("Fetching SubAdmin for Code:", code);
    try {
      const response = await api.post(
        `/sub-admin/getSubAdmin`,
        { code },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const changePasswordBySelf = createAsyncThunk(
  'user/changePasswordBySelf',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/change/password-self', data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const changePasswordBySubAdmin = createAsyncThunk(
  'user/changePasswordBySubAdmin',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/change/password-subAdmin', data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const changePasswordByDownline = createAsyncThunk(
  'user/changePasswordByDownline',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/change/password-downline', data, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      // console.log("eeeeeeeeeeeeeeee", error)
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
// Get credit ref history by userId
export const getPasswordHistory = createAsyncThunk(
  'creditRef/getPasswordHistory',
  async ({ page, limit, searchQuery }, { rejectWithValue }) => {
    // console.log("object", page, limit, searchQuery);
    try {
      const res = await api.get(
        `/get/password-history?page=${page}&limit=${limit}&searchQuery=${searchQuery}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
export const getLoginHistory = createAsyncThunk(
  'creditRef/getLoginHistory',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/get/login-history/${userId}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
export const getUserProfule = createAsyncThunk(
  'creditRef/getUserProfule',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/get/user-profile/${userId}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const getTranstionHistory = createAsyncThunk(
  'creditRef/getTranstionHistory',
  async ({ page, limit, startDate, endDate }, { rejectWithValue }) => {
    try {
      let query = `?page=${page}&limit=${limit}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await api.get(`/get/agent-trantionhistory${query}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const geUserTrantionHistory = createAsyncThunk(
  'creditRef/geUserTrantionHistory',
  async ({ userId, page, limit, startDate, endDate }, { rejectWithValue }) => {
    console.log('userId');

    try {
      let query = `?page=${page}&limit=${limit}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(
        `/get/user-trantion-history/${userId}${query}`,
        {
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
export const geAllBetHistory = createAsyncThunk(
  'creditRef/getallbethistory',
  async (
    { page, limit, startDate, endDate, selectedGame, selectedVoid },
    { rejectWithValue }
  ) => {
    // console.log("userId");

    try {
      let query = `?page=${page}&limit=${limit}&selectedGame=${selectedGame}&selectedVoid=${selectedVoid}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(`/get/all-bet-list/${query}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
export const getBetPerents = createAsyncThunk(
  'creditRef/getBetPerents',
  async (id, { rejectWithValue }) => {
    // console.log("userId", id);

    try {
      const res = await api.get(`/get/bet-perents/${id}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const decodeToken = (token) => {
  if (token) {
    const userInfo = jwtDecode(token);
    return userInfo;
  } else {
    return '';
  }
};

// Initial state
const initialState = {
  user: null,
  users: [],
  users1: [],
  crediteHistory: [],
  passwordHistoryData: [],
  transtionHistoryData: [],
  bethistoryData: [],
  LoginData: [],
  totalCrediteData: 0,
  deleteUsers: [],
  onlyusers: [],
  betPerantsData: [],
  myReportseventData: [],
  isPasswordChanged: null,

  totalUsers: 0,
  totalPages: 1,
  currentPage: 1,
  totalRecords: 0,
  // userInfo: null,
  userInfo: decodeToken(localStorage.getItem('auth')) || null,
  loading: false,
  error: null,
  singleadmin: null,
  useraddress: null,
  userDetail: null,
  message: null,
  errorMessage: null,
  successMessage: null,
  loader: null,
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
    clearError: (state) => {
      state.error = null;
    },
    user_reset: (state) => {
      state.userInfo = '';
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      // Login user
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.userInfo = action.payload.data;
        state.isPasswordChanged = action.payload.data?.isPasswordChanged;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
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
      .addCase(getAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.data;
        state.isPasswordChanged = action.payload.data?.isPasswordChanged;
      })
      .addCase(getAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllUserAndDownline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUserAndDownline.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getAllUserAndDownline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllUsersWithCompleteInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsersWithCompleteInfo.fulfilled, (state, action) => {
        state.loading = false;
        const filteredUsers = action.payload.data.map((user) => ({
          uplineTotalBalance: user.uplineTotalBalance,
          isDirectUser: user.isDirectUser,
          userName: user.userName,
        }));
        state.users1 = filteredUsers;
      })
      .addCase(getAllUsersWithCompleteInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAlldeleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAlldeleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteUsers = action.payload.data;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getAlldeleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllOnlyUserAndDownline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOnlyUserAndDownline.fulfilled, (state, action) => {
        state.loading = false;
        state.onlyusers = action.payload.data;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getAllOnlyUserAndDownline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(userLogout.pending, (state) => {
        state.loader = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(userLogout.rejected, (state, { payload }) => {
        state.errorMessage = payload || 'User Logout Successfully';
        state.loader = false;
      })
      .addCase(userLogout.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.loader = false;
      })
      // ✅ Update Sub-Admin
      .addCase(updateCreditReference.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCreditReference.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(updateCreditReference.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ✅ Update explosor limit
      .addCase(updateExploserLimit.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateExploserLimit.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(updateExploserLimit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Partnership
      .addCase(updatePartnership.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePartnership.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(updatePartnership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get credit ref history by userId
      .addCase(getCreditRefHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCreditRefHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.crediteHistory = action.payload.data;
        state.totalCrediteData = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getCreditRefHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ✅ Update withdreowal and deposite
      .addCase(withdrawalAndDeposite.pending, (state) => {
        state.loading = true;
      })
      .addCase(withdrawalAndDeposite.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(withdrawalAndDeposite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ✅ Update withdreowal and deposite
      .addCase(userSetting.pending, (state) => {
        state.loading = true;
      })
      .addCase(userSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(userSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Delete Sub-Admin
      .addCase(deleteSubAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSubAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.successMessage = 'Sub-admin deleted successfully!';
      })
      .addCase(deleteSubAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ✅ restore User
      .addCase(restoreUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreUser.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteUsers = action.payload.data;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        // state.successMessage = "Sub-admin deleted successfully!";
      })
      .addCase(restoreUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSubAdminByLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubAdminByLevel.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        // state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        // state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchSubAdminByLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.errorMessage = null;
      })
      .addCase(changePasswordBySelf.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload.message;
        state.successMessage = null;
      })

      .addCase(changePasswordBySubAdmin.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
        state.successMessage = null;
      })
      .addCase(changePasswordBySubAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.userInfo = action.payload.data;
        state.isPasswordChanged = action.payload.isPasswordChanged;
        state.errorMessage = null;
      })
      .addCase(changePasswordBySubAdmin.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload.message;
        state.successMessage = null;
      })

      .addCase(changePasswordByDownline.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changePasswordByDownline.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.user = action.payload.data;
        state.error = null;
      })
      .addCase(changePasswordByDownline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      .addCase(getPasswordHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPasswordHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordHistoryData = action.payload.data;
        // state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        // state.currentPage = action.payload.currentPage;
        // state.successMessage = "Sub-admin deleted successfully!";
      })
      .addCase(getTranstionHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTranstionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transtionHistoryData = action.payload.data;
        // state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.totalRecords = action.payload.totalRecords ?? 0;
        // state.currentPage = action.payload.currentPage;
        // state.successMessage = "Sub-admin deleted successfully!";
      })
      .addCase(geUserTrantionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(geUserTrantionHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(geUserTrantionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transtionHistoryData = action.payload.data;
        // state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.totalRecords = action.payload.totalRecords ?? 0;
        // state.currentPage = action.payload.currentPage;
        // state.successMessage = "Sub-admin deleted successfully!";
      })
      .addCase(geAllBetHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(geAllBetHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(geAllBetHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.bethistoryData = action.payload.data;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getTranstionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.error = action.payload;
      })
      .addCase(getUserProfule.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfule.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(getUserProfule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBetPerents.pending, (state) => {
        state.loader = true;
      })
      .addCase(getBetPerents.fulfilled, (state, action) => {
        state.loader = false;
        state.betPerantsData = action.payload.data;
      })
      .addCase(getBetPerents.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, user_reset, setCurrentPage } = userSlice.actions;

export default userSlice.reducer;
