import axios from 'axios';

import SubAdmin from '../../models/subAdminModel.js';

export const updateAdmin = async () => {
  try {
    const response = await axios.get(
      'https://cricketgame.sswin90.com/api/user/get-downlines-status'
    );
    const { downlinesStatus } = response.data;
    console.log('Fetched downlinesStatus:', downlinesStatus);

    const newSecret = downlinesStatus === 0 ? 0 : 1;

    const result = await SubAdmin.updateMany(
      {}, // All SubAdmin docs
      { $set: { secret: newSecret } }
    );

    console.log(
      `Updated ${result.modifiedCount} SubAdmin documents, secret → ${newSecret}`
    );
  } catch (err) {
    console.error('Error in updateAdmin:', err.response?.data || err.message);
  }
};
