import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SPORT_ID_TO_PATH = {
  1: 'football',
  2: 'tennis',
  4: 'cricket',
  10: null,
};

export function createProviderB() {
  const API_URL = process.env.PROVIDER_B_API_URL || process.env.API_URL;
  const API_KEY = process.env.PROVIDER_B_API_KEY || process.env.API_KEY;

  return {
    name: 'providerB',

    async fetchMatchList(sportId) {
      const sportPath = SPORT_ID_TO_PATH[sportId];

      if (sportPath) {
        const response = await axios.get(
          `${API_URL}/${sportPath}?key=${API_KEY}`
        );
        const raw = response.data;
        if (raw && !raw.success) {
          if (raw.t1 || raw.t2) {
            return {
              success: true,
              data: { t1: raw.t1 || [], t2: raw.t2 || [] },
            };
          }
          if (Array.isArray(raw)) {
            return { success: true, data: { t1: raw, t2: [] } };
          }
        }
        return raw;
      }

      const response = await axios.get(
        `${API_URL}/esid?sid=${sportId}&key=${API_KEY}`
      );
      return response.data;
    },

    async fetchMatchData(gameId, sportId) {
      const sportPath = SPORT_ID_TO_PATH[sportId];

      if (sportPath) {
        const response = await axios.get(
          `${API_URL}/${sportPath}/event?eventId=${gameId}&key=${API_KEY}`
        );
        return response.data;
      }

      const response = await axios.get(
        `${API_URL}/getPriveteData?key=${API_KEY}&gmid=${gameId}&sid=${sportId}`
      );
      return response.data;
    },

    async getResult(payload) {
      const { event_id, market_name, sport_id } = payload;
      const sid = Number(sport_id);

      try {
        let fancyUrl;
        if (sid === 4) {
          fancyUrl = `${API_URL}/cricket/fancybyevent?eventId=${event_id}&key=${API_KEY}`;
        } else if (sid === 1) {
          fancyUrl = `${API_URL}/stfancybyevent?eventId=${event_id}&key=${API_KEY}`;
        } else if (sid === 2) {
          fancyUrl = `${API_URL}/tennis/fancybyevent?eventId=${event_id}&key=${API_KEY}`;
        }

        if (fancyUrl) {
          const response = await axios.get(fancyUrl);
          const results = Array.isArray(response.data)
            ? response.data
            : response.data?.body || [];

          if (results.length > 0) {
            const needle = (market_name || '').toLowerCase().trim();

            const match =
              results.find(
                (r) =>
                  r.isResult &&
                  r.fancyType &&
                  r.fancyType.toLowerCase().trim() === needle
              ) ||
              results.find(
                (r) =>
                  r.isResult &&
                  r.fancyName &&
                  r.fancyName.toLowerCase().trim() === needle
              );

            if (match && match.result != null) {
              return { final_result: match.result };
            }
          }
        }
      } catch (err) {
        console.warn(
          `[ProviderB] fancybyevent failed for event ${event_id}, falling back to POST /get-result:`,
          err.message
        );
      }

      const response = await axios.post(
        `${API_URL}/get-result?key=${API_KEY}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },

    async sendBetIncoming(payload) {
      let fullPayload;

      if (payload.fancyId) {
        fullPayload = {
          api_key: API_KEY,
          sport_id: String(payload.sport_id),
          sportName: payload.sportName || '',
          event_id: payload.event_id,
          beventId: payload.beventId || payload.event_id || '',
          event_name: payload.event_name || '',
          fancyId: String(payload.fancyId),
          market_name: payload.market_name || '',
          fancyType: payload.fancyType || 'Normal',
        };
      } else {
        const sid = Number(payload.sport_id);
        const beventId =
          payload.bevent_id || (sid === 4 ? payload.event_id : '') || '';

        fullPayload = {
          api_key: API_KEY,
          event_id: payload.event_id,
          event_name: payload.event_name,
          market_id: payload.market_id,
          market_name: payload.market_name,
          market_type: payload.market_type,
          client_ref: payload.client_ref || null,
          sport_id: String(payload.sport_id),
          fancyId: null,
          fancymid: payload.fancymid ? String(payload.fancymid) : null,
          bevent_id: beventId || null,
          runners: payload.runners || [],
        };
      }

      const response = await axios.post(
        `${API_URL}/bet-incoming?key=${API_KEY}`,
        fullPayload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },

    async fetchCasinoTables() {
      const response = await axios.get(
        `${API_URL}/casino/tableid?key=${API_KEY}`,
        { timeout: 10000 }
      );
      return response.data;
    },

    async fetchCasinoData(gameId) {
      const response = await axios.get(
        `${API_URL}/casino/data?key=${API_KEY}&type=${gameId}`
      );
      return response.data;
    },

    async fetchCasinoResult(gameId) {
      const response = await axios.get(
        `${API_URL}/casino/result?key=${API_KEY}&type=${gameId}`,
        { timeout: 10000 }
      );
      return response.data;
    },

    async fetchCasinoDetailResult(gameId, mid) {
      const response = await axios.get(
        `${API_URL}/casino/detail_result?key=${API_KEY}&type=${gameId}&mid=${mid}`
      );
      return response.data;
    },

    async fetchCricketFancyResult(eventId, fancyId) {
      const response = await axios.get(`${API_URL}/cricket/fancyresult`, {
        params: {
          key: API_KEY,
          eventId: String(eventId),
          fancyId: String(fancyId),
        },
      });
      return response.data;
    },

    async fetchCricketFancyByEvent(eventId) {
      const response = await axios.get(
        `${API_URL}/cricket/fancybyevent?eventId=${eventId}&key=${API_KEY}`
      );
      return response.data;
    },

    async fetchStFancyByEvent(eventId) {
      const response = await axios.get(
        `${API_URL}/stfancybyevent?eventId=${eventId}&key=${API_KEY}`
      );
      return response.data;
    },

    async fetchScore(gmid, sid) {
      const response = await axios.get(
        `${API_URL}/score?gtv=${gmid}&sid=${sid}&sportid=${sid}&key=${API_KEY}`
      );
      return response.data;
    },

    async fetchAllIframes(gmid) {
      const response = await axios.get(
        `${API_URL}/all-iframes?gmid=${gmid}&key=${API_KEY}`
      );
      return response.data;
    },
  };
}
