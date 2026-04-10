import dotenv from 'dotenv';

import adminModel from '../models/adminModel.js';
import {
  fetchCasinoTables,
  fetchCasinoData as fetchCasinoDataApi,
  fetchCasinoResult as fetchCasinoResultApi,
  fetchCasinoDetailResult as fetchCasinoDetailResultApi,
} from '../services/matchApi/index.js';

dotenv.config();

export const isCasinoGame = (gameId, cid, gid, tabno) => {
  try {
    if (cid != null && Number(cid) === 4) return true;
    if (gid != null && Number(gid) === 35) return true;
    if (tabno != null && Number(tabno) === 6) return true;
    if (typeof gameId === 'string' && !/^\d+$/.test(gameId)) return true;
    return false;
  } catch (e) {
    return false;
  }
};

export const getCasinoData = async (req, res) => {
  try {
    const data = await fetchCasinoTables();

    if (data?.success) {
      return res.status(200).json({ success: true, data: data.data || [] });
    } else {
      return res.status(502).json({
        success: false,
        message: 'Failed to fetch casino data from provider',
        provider: data,
      });
    }
  } catch (error) {
    console.error('getCasinoData error:', error?.message || error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error?.message });
  }
};

export const getCasinoBettingData = async (req, res) => {
  const { gameId } = req.query;
  if (!gameId) {
    return res
      .status(400)
      .json({ success: false, message: 'Game Id is required' });
  }
  try {
    const data = await fetchCasinoDataApi(gameId);
    return res.status(200).json({
      message: 'Casino Betting data fetched Successfully',
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};

//Fetch CasinoResult data
// In-memory cache for casino results
const resultCache = new Map();
const RESULT_CACHE_TTL = 3000; // 3 seconds

export const getCasinoResultData = async (req, res) => {
  const { gameId } = req.query;
  if (!gameId) {
    return res
      .status(400)
      .json({ success: false, message: 'Game Id is required' });
  }

  try {
    // Check cache first
    const cached = resultCache.get(gameId);
    if (cached && Date.now() - cached.timestamp < RESULT_CACHE_TTL) {
      return res.status(200).json({ success: true, data: cached.data });
    }

    const json = await fetchCasinoResultApi(gameId);
    if (json.success) {
      // Cache the successful result
      resultCache.set(gameId, { data: json.data, timestamp: Date.now() });
      return res.status(200).json({ success: true, data: json.data });
    } else {
      // Return cached data if provider returns bad response
      if (cached) {
        return res.status(200).json({ success: true, data: cached.data });
      }
      return res
        .status(502)
        .json({ success: false, message: 'Invalid Response from API' });
    }
  } catch (error) {
    console.error('Error in getCasinoResultData:', error?.message);
    const cached = resultCache.get(gameId);
    if (cached) {
      return res.status(200).json({ success: true, data: cached.data });
    }
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error?.message,
    });
  }
};
export const getCasinoResultDetailData = async (req, res) => {
  try {
    const { gameId, mid } = req.query;
    if (!gameId || !mid) {
      return res.status(400).json({ message: 'GameId or mid is missing' });
    }
    const json = await fetchCasinoDetailResultApi(gameId, mid);
    return res.status(200).json({ message: 'Success', data: json?.data?.t1 });
  } catch (error) {
    console.error('Error in fetchingCasinoResultBettingData', error?.message);
    res.status(500).json({
      success: false,
      message: 'Internal server Error,error?.message ',
    });
  }
};
