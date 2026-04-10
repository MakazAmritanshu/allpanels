// controllers/tennisController.js
import dotenv from 'dotenv';
import { fetchMatchList, fetchMatchData } from '../services/matchApi/index.js';

dotenv.config();

export const fetchTennisData = async (req, res) => {
  try {
    const data = await fetchMatchList(2);

    const t1Data = data.data.t1 || [];
    const t2Data = data.data.t2 || [];

    const combinedData = [...t1Data, ...t2Data]
      .map((match) => ({
        id: match.gmid,
        title: match.cname,
        match: match.ename,
        date: match.stime,
        iplay: match.iplay,
        tv: match.tv,
        bm: match.bm,
        f: match.f,
        channels: match.f ? ['F'] : [],
        odds: match.section.reduce((acc, section, index) => {
          const homeOdds = section.odds[0]?.odds || '0';
          const awayOdds = section.odds[1]?.odds || '0';

          acc.push({ home: homeOdds, away: awayOdds });

          if (index < match.section.length - 1) {
            acc.push({ home: '0', away: '0' });
          }

          return acc;
        }, []),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({ success: true, data: combinedData });
  } catch (error) {
    console.error('Error fetching tennis data:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch tennis data' });
  }
};

export const fetchTannisBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const json = await fetchMatchData(gameid, 2);

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
    console.error('Error in fetchBettingData:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
