import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// import axios from "axios";
import api from '../api'; // Adjust the import based on your project structure

export const fetchSoccerData = createAsyncThunk(
  'soccer/fetchSoccerData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/soccer'); // Your backend API

      console.log('response', response);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch matches'
      );
    }
  }
);
export const fetchSoccerBatingData = createAsyncThunk(
  'cricket/fetchSoccerBatingData',
  async (gameid, { rejectWithValue }) => {
    try {
      const response = await api.get(`/soccer/betting?gameid=${gameid}`); // Your backend API
      console.log('response', response.data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch matches'
      );
    }
  }
);

// Create the slice
const soccerSlice = createSlice({
  name: 'soccer',
  initialState: {
    matches: [],
    soccerLoading: null,
    soccerError: null,
    soccerData: [],
    battingData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSoccerData.pending, (state) => {
        state.soccerLoading = true;
        state.soccerError = null;
      })
      .addCase(fetchSoccerData.fulfilled, (state, action) => {
        state.soccerLoading = false;
        state.soccerData = action.payload;
        state.matches = action.payload.map((match) => {
          // Format date: "1/23/2026 11:00:00 AM" -> "23/01/2026 11:00"
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
          };

          // Helper to convert "0" to "-" or return the value
          const formatOdds = (value) => {
            if (
              value === '0' ||
              value === 0 ||
              value === null ||
              value === undefined
            ) {
              return '-';
            }
            return value;
          };

          return {
            id: match.id,
            title: match.title,
            game: match.match || '',
            time: formatDate(match.date),
            inplay: match.inplay,
            tv: match.tv,
            bm: match.bm,
            f: match.f,
            one: {
              back: formatOdds(match.odds?.[0]?.home),
              lay: formatOdds(match.odds?.[0]?.away),
            },
            x: {
              back: formatOdds(match.odds?.[1]?.home),
              lay: formatOdds(match.odds?.[1]?.away),
            },
            two: {
              back: formatOdds(match.odds?.[2]?.home),
              lay: formatOdds(match.odds?.[2]?.away),
            },
          };
        });
        state.error = null;
      })
      .addCase(fetchSoccerData.rejected, (state, action) => {
        state.soccerLoading = false;
        state.soccerError = action.error.message;
      })
      .addCase(fetchSoccerBatingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSoccerBatingData.fulfilled, (state, action) => {
        state.loading = false;
        state.battingData = action.payload.data;
        state.error = null;
      })
      .addCase(fetchSoccerBatingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default soccerSlice.reducer;
