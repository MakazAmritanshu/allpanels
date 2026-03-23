// controllers/horseRacingController.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

export const fetchHorseRacingData = async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/esid?key=${API_KEY}&sid=10`);

    const t1Data = response.data.data.t1 || [];
    const venues = [];
    for (const country of t1Data) {
      if (!country.children) continue;
      for (const venue of country.children) {
        const races = (venue.children || []).map((race) => ({
          gmid: race.gmid,
          iplay: race.iplay,
          stime: race.stime,
          gtype: race.gtype,
        }));
        venues.push({
          cid: country.cid,
          cname: country.cname,
          ename: venue.ename,
          races,
        });
      }
    }

    res.status(200).json({ success: true, data: venues });
  } catch (error) {
    console.error('Error fetching horse racing data:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch horse racing data' });
  }
};

export const fetchHorseRacingBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const response = await axios.get(
      `${API_URL}/getPriveteData?key=${API_KEY}&gmid=${gameid}&sid=10`
    );

    const json = response.data;

    if (json.success) {
      res.status(200).json({
        success: true,
        data: response.data,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: 'Invalid response from API' });
    }
  } catch (error) {
    console.error('Error in fetchHorseRacingBettingData:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
