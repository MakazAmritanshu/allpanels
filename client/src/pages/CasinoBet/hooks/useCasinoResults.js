import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearCasinoResultData,
  fetchCasinoResultData,
} from '../../../redux/reducer/casinoSlice';
import { WINNER_POPUP_DURATION } from '../constants';

/**
 * State reducer - batches all state updates to avoid cascading renders
 */
const initialState = {
  showWinner: false,
  lastResultMid: null,
  lastRoundId: null,
  hasInitializedResults: false,
  isGameSwitching: false,
  selectedItem: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'GAME_CHANGE':
      return {
        ...initialState,
        isGameSwitching: true,
      };
    case 'SWITCHING_COMPLETE':
      return {
        ...state,
        isGameSwitching: false,
      };
    case 'RESULTS_INITIALIZED':
      return {
        ...state,
        lastResultMid: action.payload,
        hasInitializedResults: true,
      };
    case 'SHOW_WINNER':
      return {
        ...state,
        lastResultMid: action.payload,
        showWinner: true,
      };
    case 'HIDE_WINNER':
      return {
        ...state,
        showWinner: false,
      };
    case 'SET_SELECTED_ITEM':
      return {
        ...state,
        selectedItem: action.payload,
      };
    case 'UPDATE_ROUND_ID':
      return {
        ...state,
        lastRoundId: action.payload,
      };
    default:
      return state;
  }
}

/**
 * Custom hook for managing casino result display and winner popup
 * Uses useReducer to batch state updates and avoid cascading renders
 */
export const useCasinoResults = ({ gameid }) => {
  const reduxDispatch = useDispatch();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Redux selectors
  const { resultData, currentGameId } = useSelector((s) => s.casino);

  // Refs
  const lastRoundIdRef = useRef(null);
  const isFetchingResultsRef = useRef(false);
  const prevGameidRef = useRef(null);

  // =====================================================
  // EFFECT 1: Handle game change
  // =====================================================
  useEffect(() => {
    if (prevGameidRef.current !== gameid && gameid) {
      prevGameidRef.current = gameid;
      lastRoundIdRef.current = null;

      // Batch state reset via reducer
      dispatch({ type: 'GAME_CHANGE' });
      reduxDispatch(clearCasinoResultData());
    }
  }, [gameid, reduxDispatch]);

  // =====================================================
  // EFFECT 2: End switching mode after delay
  // =====================================================
  useEffect(() => {
    if (!state.isGameSwitching) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'SWITCHING_COMPLETE' });
    }, 800);

    return () => clearTimeout(timer);
  }, [state.isGameSwitching]);

  // =====================================================
  // EFFECT 3: Fetch initial results after switching ends
  // =====================================================
  // EFFECT 3: Fetch initial results ONLY ONCE after switching ends
  useEffect(() => {
    if (!gameid || state.isGameSwitching || state.hasInitializedResults) return;

    reduxDispatch(fetchCasinoResultData(gameid)).then((result) => {
      const firstResultMid = result?.payload?.data?.res?.[0]?.mid;
      if (firstResultMid) {
        dispatch({ type: 'RESULTS_INITIALIZED', payload: firstResultMid });
      }
    });
  }, [
    gameid,
    reduxDispatch,
    state.isGameSwitching,
    state.hasInitializedResults,
  ]);

  // =====================================================
  // EFFECT 4: Show winner popup when new result arrives
  // =====================================================
  useEffect(() => {
    if (
      !resultData?.res ||
      resultData.res.length === 0 ||
      state.isGameSwitching
    )
      return;

    const currentResult = resultData.res[0];
    const currentResultMid = currentResult.mid;

    if (
      currentGameId === gameid &&
      state.hasInitializedResults &&
      state.lastResultMid !== currentResultMid &&
      currentResult.win
    ) {
      dispatch({ type: 'SHOW_WINNER', payload: currentResultMid });
    }
  }, [
    resultData?.res,
    state.lastResultMid,
    state.isGameSwitching,
    state.hasInitializedResults,
    gameid,
    currentGameId,
  ]);

  // =====================================================
  // EFFECT 5: Auto-hide winner popup after duration
  // =====================================================
  useEffect(() => {
    if (!state.showWinner) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'HIDE_WINNER' });
    }, WINNER_POPUP_DURATION);

    return () => clearTimeout(timer);
  }, [state.showWinner]);

  // =====================================================
  // CALLBACKS
  // =====================================================

  const updateLastRoundId = useCallback((roundId) => {
    if (roundId && roundId !== lastRoundIdRef.current) {
      lastRoundIdRef.current = roundId;
      dispatch({ type: 'UPDATE_ROUND_ID', payload: roundId });
      return true;
    }
    return false;
  }, []);

  const setIsFetchingResults = useCallback((value) => {
    isFetchingResultsRef.current = value;
  }, []);

  const setSelectedItem = useCallback((item) => {
    dispatch({ type: 'SET_SELECTED_ITEM', payload: item });
  }, []);

  const setShowWinner = useCallback(
    (value) => {
      dispatch({
        type: value ? 'SHOW_WINNER' : 'HIDE_WINNER',
        payload: state.lastResultMid,
      });
    },
    [state.lastResultMid]
  );

  return {
    // State
    resultData,
    currentGameId,
    showWinner: state.showWinner,
    selectedItem: state.selectedItem,
    setSelectedItem,
    isGameSwitching: state.isGameSwitching,
    lastRoundId: state.lastRoundId,

    // Refs
    lastRoundIdRef,
    isFetchingResultsRef,

    // Actions
    updateLastRoundId,
    setIsFetchingResults,
    setShowWinner,
  };
};

export default useCasinoResults;
