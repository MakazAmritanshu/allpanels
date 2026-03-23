import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

export const fetchSoccerData = async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/esid?key=${API_KEY}&sid=1`);

    const t1Data = response.data.data.t1 || [];
    const t2Data = response.data.data.t2 || [];

    const combinedData = [...t1Data, ...t2Data].map((match) => ({
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
    }));

    res.status(200).json({ success: true, data: combinedData });
  } catch (error) {
    console.error('Error fetching soccer data:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch soccer data' });
  }
};

export const fetchsoccerBettingData = async (req, res) => {
  const { gameid } = req.query;

  if (!gameid) {
    return res.status(400).json({ success: false, message: 'Missing gameid' });
  }

  try {
    const response = await axios.get(
      `${API_URL}/getPriveteData?key=${API_KEY}&gmid=${gameid}&sid=1`
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
    console.error('Error in fetchBettingData:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
