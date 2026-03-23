import axios from 'axios';
import dotenv from 'dotenv';

import adminModel from '../models/adminModel.js';

dotenv.config();

const CRIC_BASE = process.env.API_URL;
const CRIC_API_KEY = process.env.API_KEY;

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
    const url = `${CRIC_BASE}/casino/tableid?key=${CRIC_API_KEY}`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response?.data?.success) {
      return res
        .status(200)
        .json({ success: true, data: response.data.data || [] });
    } else {
      return res.status(502).json({
        success: false,
        message: 'Failed to fetch casino data from provider',
        provider: response?.data,
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
    const response = await axios.get(
      `${CRIC_BASE}/casino/data?key=${CRIC_API_KEY}&type=${gameId}`
    );
    return res.status(200).json({
      message: 'Casino Betting data fetched Successfully',
      data: response.data,
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

    const response = await axios.get(
      `${CRIC_BASE}/casino/result?key=${CRIC_API_KEY}&type=${gameId}`,
      { timeout: 10000 } // Add timeout!
    );

    const json = response.data;
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
    const response = await axios.get(
      `${CRIC_BASE}/casino/detail_result?key=${CRIC_API_KEY}&type=${gameId}&mid=${mid}`
    );

    const json = response.data;
    return res.status(200).json({ message: 'Success', data: json?.data?.t1 });
  } catch (error) {
    console.error('Error in fetchingCasinoResultBettingData', error?.message);
    res.status(500).json({
      success: false,
      message: 'Internal server Error,error?.message ',
    });
  }
};
