import { configureStore } from '@reduxjs/toolkit';

import authReducer from './reducer/authReducer';
import betReducer from './reducer/betReducer';
import casinoReducer from './reducer/casinoSlice';
import cricketReducer from './reducer/cricketSlice';
import soccerReducer from './reducer/soccerSlice';
import tennisReducer from './reducer/tennisSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cricket: cricketReducer,
    tennis: tennisReducer,
    soccer: soccerReducer,
    bet: betReducer,
    casino: casinoReducer,
  },
});
