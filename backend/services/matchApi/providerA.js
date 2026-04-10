import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export function createProviderA() {
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;
  const RESULT_API_URL = process.env.RESULT_API_URL;

  return {
    name: 'providerA',

    async fetchMatchList(sportId) {
      const response = await axios.get(
        `${API_URL}/esid?sid=${sportId}&key=${API_KEY}`
      );
      return response.data;
    },

    async fetchMatchData(gameId, sportId) {
      const response = await axios.get(
        `${API_URL}/getPriveteData?key=${API_KEY}&gmid=${gameId}&sid=${sportId}`
      );
      return response.data;
    },

    async getResult(payload) {
      const response = await axios.post(
        `${RESULT_API_URL}/get-result`,
        { ...payload, api_key: API_KEY },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },

    async sendBetIncoming(payload) {
      const response = await axios.post(
        `${RESULT_API_URL}/bet-incoming`,
        { ...payload, api_key: API_KEY },
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
      return { success: false, message: 'Not supported by Provider A' };
    },

    async fetchCricketFancyByEvent(eventId) {
      return { success: false, message: 'Not supported by Provider A' };
    },

    async fetchStFancyByEvent(eventId) {
      return { success: false, message: 'Not supported by Provider A' };
    },

    async fetchScore(gmid, sid) {
      return { success: false, message: 'Not supported by Provider A' };
    },

    async fetchAllIframes(gmid) {
      return { success: false, message: 'Not supported by Provider A' };
    },
  };
}
