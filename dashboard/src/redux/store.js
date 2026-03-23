import { configureStore } from '@reduxjs/toolkit';

import authReducer from './reducer/authReducer';
import downlineReducer from './reducer/downlineReducer';
import marketAnalyzeReducer from './reducer/marketAnalyzeReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    downline: downlineReducer,
    market: marketAnalyzeReducer,
  },
});
