// controllers/horseRacingController.js
import dotenv from 'dotenv';
import { fetchMatchList, fetchMatchData } from '../services/matchApi/index.js';

dotenv.config();

export const fetchHorseRacingData = async (req, res) => {
  try {
    const data = await fetchMatchList(10);

    const t1Data = data.data.t1 || [];
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
    const json = await fetchMatchData(gameid, 10);

    if (json.success) {
      res.status(200).json({
        success: true,
        data: json,
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
