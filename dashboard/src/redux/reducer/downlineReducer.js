import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import api from '../api';

export const getMyRepostsDataByEvents = createAsyncThunk(
  'agent/getMyRepostsDataByEvents',
  async ({ page, limit, startDate, endDate }, { rejectWithValue }) => {
    //   console.log(gameName, "gameName");

    try {
      let query = `page=${page}&limit=${limit}`;

      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await api.get(`/get/my-reports/by-events?${query}`, {
        withCredentials: true,
      });
      console.log('res', res);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Fetch failed' }
      );
    }
  }
);

export const getGraphData = createAsyncThunk(
  'agent/getGraphData',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    //   console.log(gameName, "gameName");

    try {
      let query = `page=${startDate}&limit=${endDate}`;

      const res = await api.get(`/get/graph-backup?${query}`, {
        withCredentials: true,
      });
      console.log('res', res);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Fetch failed' }
      );
    }
  }
);
export const getGraphTodayData = createAsyncThunk(
  'agent/getGraphtodayData',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    //   console.log(gameName, "gameName");

    try {
      let query = `page=${startDate}&limit=${endDate}`;

      const res = await api.get(`/get/graph-live?${query}`, {
        withCredentials: true,
      });
      console.log('res', res);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Fetch failed' }
      );
    }
  }
);
export const getPLfilterData = createAsyncThunk(
  'agent/getPLfilterData',
  async (
    {
      gameName,
      startDate,
      endDate,
      page,
      limit,
      eventName,
      marketName,
      userName,
    },
    { rejectWithValue }
  ) => {
    //   console.log(gameName, "gameName");

    try {
      let query = `?page=${page}&limit=${limit}&gameName=${gameName}&eventName=${eventName}&marketName=${marketName}&userName=${userName}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await api.get(`/get/my-reports/by-events?${query}`, {
        withCredentials: true,
      });
      console.log('res', res);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Fetch failed' }
      );
    }
  }
);

export const getDownLinefilterData = createAsyncThunk(
  'agent/getdownlinefilterData',
  async (
    {
      gameName,
      startDate,
      endDate,
      page,
      limit,
      eventName,
      marketName,
      userName,
      targetUserId,
    },
    { rejectWithValue }
  ) => {
    //   console.log(gameName, "gameName");

    try {
      let query = `?page=${page}&limit=${limit}&gameName=${gameName || ''}&eventName=${eventName || ''}&marketName=${marketName || ''}&userName=${userName || ''}&targetUserId=${targetUserId || ''}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }

      console.log('🔍 STEP 4 - API Query string:', query);
      console.log(
        '🔍 STEP 4 - Full API URL:',
        `/get/my-reports/by-downline${query}`
      );

      const res = await api.get(`/get/my-reports/by-downline${query}`, {
        withCredentials: true,
      });
      console.log('res', res);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Fetch failed' }
      );
    }
  }
);

export const updateGameLock = createAsyncThunk(
  'gameLock/updateGameLock',
  async ({ userId, game, lock }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/gamelock/${userId}`, {
        game,
        lock,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getBetHistory = createAsyncThunk(
  'bet/getBetHistory',
  async (
    { id, page = 1, limit, startDate, endDate, selectedGame, selectedVoid },
    { rejectWithValue }
  ) => {
    // console.log("idddd", id);

    try {
      let query = `?page=${page}&limit=${limit}`;

      if (startDate && endDate) {
        query += `&id=${id}&startDate=${startDate}&endDate=${endDate}&selectedGame=${selectedGame}&selectedVoid=${selectedVoid}`;
      }

      const response = await api.get(`/get/user/bet-history${query}`, {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);

const initialState = {
  message: null,
  errorMessage: null,
  successMessage: null,
  myReportseventData: [],
  graphbackup: [],
  graphtoday: [],
  plfilter: [],
  dlfilter: null,
  betHistory: [],
  gamelock: null,
};

const downlineSlice = createSlice({
  name: 'downline',
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
      .addCase(getMyRepostsDataByEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyRepostsDataByEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.myReportseventData = action.payload.data;
      })
      .addCase(getMyRepostsDataByEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(getGraphData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGraphData.fulfilled, (state, action) => {
        state.loading = false;
        state.graphbackup = action.payload.data;
      })
      .addCase(getGraphData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(getGraphTodayData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGraphTodayData.fulfilled, (state, action) => {
        state.loading = false;
        state.graphtoday = action.payload.data;
      })
      .addCase(getGraphTodayData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(getPLfilterData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPLfilterData.fulfilled, (state, action) => {
        state.loading = false;
        state.plfilter = action.payload.data;
      })
      .addCase(getPLfilterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(getDownLinefilterData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDownLinefilterData.fulfilled, (state, action) => {
        state.loading = false;
        state.dlfilter = action.payload.data || null;
      })
      .addCase(getDownLinefilterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(updateGameLock.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateGameLock.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.gamelock = action.payload.gamelock;
      })
      .addCase(updateGameLock.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload?.message || 'Something went wrong';
      })
      .addCase(getBetHistory.pending, (state) => {
        state.loader = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(getBetHistory.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.betHistory = payload?.data;
        state.successMessage = payload?.message;
      })
      .addCase(getBetHistory.rejected, (state, { payload }) => {
        state.loader = false;
        state.error = payload?.message || 'Something went wrong';
      });
  },
});

export const { clearError, user_reset, setCurrentPage } = downlineSlice.actions;

export default downlineSlice.reducer;
