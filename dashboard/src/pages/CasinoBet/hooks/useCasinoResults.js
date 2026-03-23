import { useCallback, useEffect, useReducer, useRef } from 'react';

import { WINNER_POPUP_DURATION } from '../constants';

/**
 * Note: This is a dashboard version of useCasinoResults
 * The dashboard doesn't have a casinoSlice, so we use local state
 * Results are received via WebSocket and stored locally
 */

/**
 * State reducer - batches all state updates to avoid cascading renders
 */
const createInitialState = (gameid) => ({
  showWinner: false,
  lastResultMid: null,
  lastRoundId: null,
  hasInitializedResults: false,
  isGameSwitching: false,
  selectedItem: null,
  resultData: null,
  currentGameId: gameid,
});

function reducer(state, action) {
  switch (action.type) {
    case 'GAME_CHANGE':
      return {
        ...createInitialState(action.payload),
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
    case 'SET_RESULT_DATA':
      return {
        ...state,
        resultData: action.payload,
      };
    case 'UPDATE_RESULT_DATA':
      return {
        ...state,
        resultData: action.payload.data,
        ...(action.payload.initMid
          ? {
              lastResultMid: action.payload.initMid,
              hasInitializedResults: true,
            }
          : {}),
      };
    default:
      return state;
  }
}

/**
 * Custom hook for managing casino result display and winner popup
 * Uses useReducer to batch state updates and avoid cascading renders
 * Dashboard version: Uses local state instead of casinoSlice
 */
export const useCasinoResults = ({ gameid }) => {
  const [state, dispatch] = useReducer(reducer, gameid, createInitialState);

  // Refs
  const lastRoundIdRef = useRef(null);
  const isFetchingResultsRef = useRef(false);
  const prevGameidRef = useRef(gameid);

  // =====================================================
  // EFFECT 1: Handle game change
  // =====================================================
  useEffect(() => {
    if (prevGameidRef.current !== gameid && gameid) {
      prevGameidRef.current = gameid;
      lastRoundIdRef.current = null;

      // Batch all state reset via reducer (no separate setState calls)
      dispatch({ type: 'GAME_CHANGE', payload: gameid });
    }
  }, [gameid]);

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
  // EFFECT 3: Initialize results when game loads
  // =====================================================
  useEffect(() => {
    if (!gameid || state.isGameSwitching) return;

    // Results will be updated via setResultData from parent component
    // or via WebSocket updates
  }, [gameid, state.isGameSwitching]);

  // =====================================================
  // EFFECT 4: Show winner popup when new result arrives
  // =====================================================
  useEffect(() => {
    if (
      !state.resultData?.res ||
      state.resultData.res.length === 0 ||
      state.isGameSwitching
    )
      return;

    const currentResult = state.resultData.res[0];
    const currentResultMid = currentResult?.mid;

    if (
      state.currentGameId === gameid &&
      state.hasInitializedResults &&
      state.lastResultMid !== currentResultMid &&
      currentResult?.win
    ) {
      dispatch({ type: 'SHOW_WINNER', payload: currentResultMid });
    }
  }, [
    state.resultData?.res,
    state.lastResultMid,
    state.isGameSwitching,
    state.hasInitializedResults,
    gameid,
    state.currentGameId,
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

  // Update result data (called from WebSocket or parent)
  const updateResultData = useCallback(
    (data) => {
      // Initialize results if this is the first data
      const initMid =
        data?.res?.[0]?.mid && !state.hasInitializedResults
          ? data.res[0].mid
          : null;

      dispatch({
        type: 'UPDATE_RESULT_DATA',
        payload: { data, initMid },
      });
    },
    [state.hasInitializedResults]
  );

  // Set result data directly
  const setResultData = useCallback((data) => {
    dispatch({ type: 'SET_RESULT_DATA', payload: data });
  }, []);

  return {
    // State
    resultData: state.resultData,
    currentGameId: state.currentGameId,
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
    updateResultData,
    setResultData,
  };
};

export default useCasinoResults;
