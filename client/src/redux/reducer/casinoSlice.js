import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import api from '../api';

//For Aborting the Api calls when we make a switch
let resultAbortController = null;
let bettingAbortController = null;

// Async thunk to fetch casino games list
export const fetchCasinoData = createAsyncThunk(
  'casino/fetchCasinoData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/casino-data');
      console.log('response casino', response?.data?.data?.t1);
      return response?.data?.data?.t1;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch casino games'
      );
    }
  }
);

// Async thunk to fetch casino betting data
export const fetchCasinoBatingData = createAsyncThunk(
  'casino/fetchCasinoBatingData',
  async (gameId, { rejectWithValue }) => {
    try {
      // Cancel previous request if it exists
      if (bettingAbortController) {
        console.log(' [ABORT] Cancelling previous betting request');
        bettingAbortController.abort();
      }

      // Create new AbortController for this request
      bettingAbortController = new AbortController();

      console.log('[FETCH] Starting betting fetch for gameId:', gameId);
      const response = await api.get(`/casino-betting-data?gameId=${gameId}`, {
        signal: bettingAbortController.signal,
      });

      console.log(' [SUCCESS] Betting fetch completed for gameId:', gameId);
      return response.data.data;
    } catch (error) {
      // Ignore aborted requests
      if (
        error.name === 'AbortError' ||
        error.name === 'CanceledError' ||
        error.code === 'ERR_CANCELED'
      ) {
        console.log(
          ' [ABORT] Betting request was cancelled for gameId:',
          gameId
        );
        return rejectWithValue('Request cancelled');
      }
      console.error(' [ERROR] Error fetching betting data:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch betting data'
      );
    }
  }
);

// Async thunk to fetch casino result

// Async thunk to fetch casino result
export const fetchCasinoResultData = createAsyncThunk(
  'casino/fetchCasinoResultData',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/casino-betting-result?gameId=${gameId}`);
      return { data: response.data.data, gameId };
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return rejectWithValue('Request cancelled');
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch result data'
      );
    }
  }
);

// Async thunk to fetch casino result detail
export const fetchCasinoResultDetailData = createAsyncThunk(
  'casino/fetchCasinoResultDetailData',
  async ({ gameId, mid }, { rejectWithValue }) => {
    try {
      console.log(' Fetching Result Detail:', { gameId, mid });
      //Cancel previous request if it exists
      if (resultAbortController) {
        console.log('[BETTING ABORT] Cancelling previous Betting ');
      }

      const response = await api.get(
        `/casino-betting-result-detail?gameId=${gameId}&mid=${mid}`
      );
      console.log('Casino Result Detail Data:', response?.data?.data);
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response || 'Failed to fetch Result Detail data'
      );
    }
  }
);

// Casino slice
const casinoSlice = createSlice({
  name: 'casino',
  initialState: {
    data: [],
    battingData: null,
    resultData: [],
    resultDetailData: null,
    //The fix
    currentGameId: null,

    // Separate loaders
    loader: {
      games: false,
      betting: false,
      result: false,
      resultDetail: false,
      video: false,
    },

    // Separate errors
    error: {
      games: null,
      betting: null,
      result: null,
      resultDetail: null,
    },
  },
  reducers: {
    clearCasinoError: (state) => {
      state.error = {
        games: null,
        betting: null,
        result: null,
        resultDetail: null,
      };
    },
    setCasinoBattingData: (state, action) => {
      state.battingData = action.payload;
    },
    setCasinoResultData: (state, action) => {
      state.resultData = action.payload;
    },
    //  Clear result data when switching games
    clearCasinoResultData: (state) => {
      state.resultData = [];
      state.resultDetailData = null;
      state.currentGameId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Casino Games
      .addCase(fetchCasinoData.pending, (state) => {
        state.loader.games = true;
        state.error.games = null;
      })
      .addCase(fetchCasinoData.fulfilled, (state, action) => {
        state.loader.games = false;
        state.data = action.payload;
      })
      .addCase(fetchCasinoData.rejected, (state, action) => {
        state.loader.games = false;
        state.error.games = action.payload;
      })

      // Betting Data
      .addCase(fetchCasinoBatingData.pending, (state) => {
        state.loader.betting = true;
        state.error.betting = null;
      })
      .addCase(fetchCasinoBatingData.fulfilled, (state, action) => {
        state.loader.betting = false;
        state.battingData = action.payload;
      })
      .addCase(fetchCasinoBatingData.rejected, (state, action) => {
        state.loader.betting = false;
        state.error.betting = action.payload;
      })

      // Result Data
      .addCase(fetchCasinoResultData.pending, (state) => {
        state.loader.result = true;
        state.error.result = null;
      })
      .addCase(fetchCasinoResultData.fulfilled, (state, action) => {
        state.loader.result = false;
        state.resultData = action.payload.data;
        state.currentGameId = action.payload?.gameId;
      })
      .addCase(fetchCasinoResultData.rejected, (state, action) => {
        state.loader.result = false;
        state.error.result = action.payload;
      })

      // Result Detail Data
      .addCase(fetchCasinoResultDetailData.pending, (state) => {
        state.loader.resultDetail = true;
        state.error.resultDetail = null;
      })
      .addCase(fetchCasinoResultDetailData.fulfilled, (state, action) => {
        state.loader.resultDetail = false;
        state.resultDetailData = action.payload;
      })
      .addCase(fetchCasinoResultDetailData.rejected, (state, action) => {
        state.loader.resultDetail = false;
        state.error.resultDetail = action.payload;
      });
  },
});

export const {
  clearCasinoError,
  setCasinoBattingData,
  setCasinoResultData,
  clearCasinoResultData,
} = casinoSlice.actions;
export default casinoSlice.reducer;
