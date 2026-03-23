import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import api from '../api';

// Async thunk to place a bet
export const createBet = createAsyncThunk(
  'bet/create',
  async (formData, { rejectWithValue }) => {
    // Helper function to simulate a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // Simulate a 5-second loading delay
      // await delay(3000);

      // Make the API request
      const response = await api.post('/user/place-bet', formData, {
        withCredentials: true,
      });

      // Return the response data
      return response.data; // directly return { message, bet }
    } catch (error) {
      // Handle errors and reject with a value
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);
// Async thunk to place a bet
export const getPendingBet = createAsyncThunk(
  'bet/getPendingBet',
  async (gameId, { rejectWithValue }) => {
    // console.log("eventName", gameId);
    try {
      // console.log("srijangameId",gameId)
      const url =
        gameId && gameId !== 'undefined'
          ? `/user/pending-bet?gameId=${gameId}`
          : `/user/pending-bet`;
      const response = await api.get(url, {
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

export const getPendingBetAmo = createAsyncThunk(
  'bet/getPendingBetAmo',
  async (payload, { rejectWithValue }) => {
    const gameId = typeof payload === 'string' ? payload : payload?.gameId;
    const roundId =
      typeof payload === 'object' && payload?.roundId != null
        ? payload.roundId
        : undefined;

    try {
      let url = `/user/pending-bet/amounts?gameId=${gameId}`;
      if (roundId != null && roundId !== '') {
        url += `&roundId=${encodeURIComponent(String(roundId))}`;
      }
      const response = await api.get(url, {
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
export const getProLoss = createAsyncThunk(
  'bet/getProLoss',
  async (
    {
      startDate,
      endDate,
      limit,
      page,
      gameName,
      eventName,
      marketName,
      marketId,
    },
    { rejectWithValue }
  ) => {
    // console.log("eventName", gameId);
    try {
      let query = `?page=${page}&limit=${limit}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      if (gameName) {
        query += `&gameName=${gameName}`;
      }

      if (eventName) {
        query += `&eventName=${eventName}`;
      }

      if (marketName) {
        query += `&marketName=${marketName}`;
      }
      if (marketId) {
        query += `&marketId=${marketId}`;
      }
      const response = await api.get(`/user/profit-loss/history?${query}`, {
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

export const createfancyBet = createAsyncThunk(
  'bet/create-fancy-bet',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/place-fancy-bet', formData, {
        withCredentials: true,
      });
      return response.data; // directly return { message, bet }
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

export const executeCashout = createAsyncThunk(
  'bet/executeCashout',
  async (betId, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/user/cashout/execute',
        { betId },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);

export const getFancyMasterBook = createAsyncThunk(
  'bet/getFancyMasterBook',
  async (
    { gameId, teamName, gameType, minScore, maxScore },
    { rejectWithValue }
  ) => {
    try {
      let url = `/user/fancy-master-book?gameId=${gameId}&teamName=${encodeURIComponent(teamName)}&gameType=${gameType}`;
      if (minScore != null) url += `&minScore=${minScore}`;
      if (maxScore != null) url += `&maxScore=${maxScore}`;
      const response = await api.get(url, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);

export const getBetHistory = createAsyncThunk(
  'bet/getBetHistory',
  async (
    { page = 1, limit, startDate, endDate, selectedGame, selectedVoid },
    { rejectWithValue }
  ) => {
    try {
      let query = `?page=${page}&limit=${limit}`;

      // if (startDate && endDate) {
      //   query += `&startDate=${startDate}&endDate=${endDate}&selectedGame=${selectedGame}&selectedVoid=${selectedVoid}`;
      // }
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
        if (selectedGame != null && selectedGame !== '')
          query += `&selectedGame=${selectedGame}`;
        if (selectedVoid != null && selectedVoid !== '')
          query += `&selectedVoid=${selectedVoid}`;
      }


      const response = await api.get(`/user/bet/history${query}`, {
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
export const getTransactionHistory = createAsyncThunk(
  'bet/getTransHistory',
  async ({ startDate, endDate, page, limit }, { rejectWithValue }) => {
    try {
      // let query = `?&selectedVoid=${selectedVoid}`;

      if (startDate && endDate) {
        var query = `?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`;
      }

      const response = await api.get(`/user/transactions-hisrtory${query}`, {
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

// Initial state
const initialState = {
  loading: false,
  errorMessage: '',
  successMessage: '',
  eventName: [],
  pendingBet: [],
  betHistory: [],
  transHistory: [],
  proLossHistory: [],
  pendingBetAmounts: [],
  cashoutPL: {},
  pagination: {},
  cashoutValues: {},
  cashoutLoading: false,
  cashoutError: '',
  fancyMasterBook: [],
  fancyMasterBookLoading: false,
  fancyMasterBookMeta: null,
};

// Slice
const betSlice = createSlice({
  name: 'bet',
  initialState,
  reducers: {
    messageClear: (state) => {
      state.errorMessage = '';
      state.successMessage = '';
    },
    clearPendingBetAmounts: (state) => {
      state.pendingBetAmounts = [];
    },
    updateCashoutValues: (state, action) => {
      const bets = action.payload;
      if (Array.isArray(bets)) {
        for (const b of bets) {
          state.cashoutValues[b.betId] = b.cashoutValue;
        }
      }
    },
    clearCashoutValues: (state) => {
      state.cashoutValues = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBet.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(createBet.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.pendingBet = payload?.bet;
        state.successMessage = payload?.message;
      })
      .addCase(createBet.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || 'Something went wrong';
      })
      .addCase(getPendingBet.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(getPendingBet.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.eventName = payload?.data;
        state.pendingBet = payload?.data;
        state.successMessage = payload?.message;
      })
      .addCase(getPendingBet.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || 'Something went wrong';
      })
      .addCase(getPendingBetAmo.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(getPendingBetAmo.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.pendingBetAmounts = payload?.data;
        state.cashoutPL = payload?.cashoutPL || {};
        state.successMessage = payload?.message;
      })
      .addCase(getPendingBetAmo.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || 'Something went wrong';
      })
      .addCase(getBetHistory.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(getBetHistory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.betHistory = payload?.data;
        state.pagination = payload?.pagination;
        state.successMessage = payload?.message;
      })
      .addCase(getBetHistory.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || 'Something went wrong';
      })
      .addCase(getTransactionHistory.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(getTransactionHistory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.transHistory = payload?.data;
        state.successMessage = payload?.message;
      })
      .addCase(getTransactionHistory.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || 'Something went wrong';
      })
      .addCase(getProLoss.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(getProLoss.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.proLossHistory = payload.data.report;
        // console.log("payload", payload.data)
        state.successMessage = payload?.message;
      })
      .addCase(getProLoss.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.message || 'Something went wrong';
      })
      .addCase(createfancyBet.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(createfancyBet.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.pendingBet = payload?.bet;
        state.successMessage = payload?.message;
      })
      .addCase(createfancyBet.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload;
      })
      .addCase(executeCashout.pending, (state) => {
        state.cashoutLoading = true;
        state.cashoutError = '';
      })
      .addCase(executeCashout.fulfilled, (state, { payload }) => {
        state.cashoutLoading = false;
        state.successMessage = payload?.message;
      })
      .addCase(executeCashout.rejected, (state, { payload }) => {
        state.cashoutLoading = false;
        state.cashoutError = payload?.message || 'Cashout failed';
      })
      .addCase(getFancyMasterBook.pending, (state) => {
        state.fancyMasterBookLoading = true;
      })
      .addCase(getFancyMasterBook.fulfilled, (state, { payload }) => {
        state.fancyMasterBookLoading = false;
        state.fancyMasterBook = payload?.data || [];
        state.fancyMasterBookMeta = payload?.meta || null;
      })
      .addCase(getFancyMasterBook.rejected, (state, { payload }) => {
        state.fancyMasterBookLoading = false;
        state.fancyMasterBook = [];
        state.errorMessage = payload?.message || 'Something went wrong';
      });
  },
});

export const {
  messageClear,
  clearPendingBetAmounts,
  updateCashoutValues,
  clearCashoutValues,
} = betSlice.actions;
export default betSlice.reducer;
