import { useCallback, useEffect, useReducer, useRef } from 'react';

import { host } from '../../../redux/api';

/**
 * Dashboard version of useCasinoWebSocket
 * Note: Result fetching is handled locally, not via Redux casinoSlice
 */

/**
 * State reducer - batches all state updates to avoid cascading renders
 */
const initialState = {
  isConnected: false,
  isFetchingResults: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'CONNECTED':
      return { ...state, isConnected: true };
    case 'DISCONNECTED':
      return { ...state, isConnected: false };
    case 'FETCH_START':
      return { ...state, isFetchingResults: true };
    case 'FETCH_END':
      return { ...state, isFetchingResults: false };
    case 'GAME_RESET':
      return { ...state, isFetchingResults: false };
    case 'RESET_ALL':
      return { ...initialState };
    default:
      return state;
  }
}

/**
 * Custom hook for managing casino WebSocket connection
 * Uses useReducer to batch state updates and avoid cascading renders
 */
export const useCasinoWebSocket = ({
  gameid,
  userId,
  bettingDataMid,
  onBettingDataUpdate,
  onResultUpdate,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Refs
  const globalSocketRef = useRef(null);
  const lastRoundIdRef = useRef(null);
  const gameidRef = useRef(gameid);
  const isFetchingResultsRef = useRef(false);
  const prevGameidRef = useRef(null);

  // =====================================================
  // EFFECT 1: Keep gameidRef updated
  // =====================================================
  useEffect(() => {
    gameidRef.current = gameid;
  }, [gameid]);

  // =====================================================
  // EFFECT 2: Keep isFetchingResultsRef in sync
  // =====================================================
  useEffect(() => {
    isFetchingResultsRef.current = state.isFetchingResults;
  }, [state.isFetchingResults]);

  // =====================================================
  // EFFECT 3: Reset on game change
  // =====================================================
  useEffect(() => {
    if (prevGameidRef.current !== gameid && gameid) {
      prevGameidRef.current = gameid;
      lastRoundIdRef.current = null;
      isFetchingResultsRef.current = false;
      dispatch({ type: 'GAME_RESET' });
    }
  }, [gameid]);

  // =====================================================
  // CALLBACKS
  // =====================================================

  const subscribe = useCallback(() => {
    const currentGameId = gameidRef.current;
    if (
      globalSocketRef.current &&
      globalSocketRef.current.readyState === WebSocket.OPEN
    ) {
      globalSocketRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          gameid: currentGameId,
          apitype: 'casino',
          userId,
        })
      );

      if (bettingDataMid) {
        globalSocketRef.current.send(
          JSON.stringify({
            type: 'subscribe',
            gameid: currentGameId,
            apitype: 'casino',
            roundId: bettingDataMid,
            userId,
          })
        );
      }
    }
  }, [userId, bettingDataMid]);

  const unsubscribe = useCallback((gameIdToUnsubscribe) => {
    if (
      globalSocketRef.current &&
      globalSocketRef.current.readyState === WebSocket.OPEN
    ) {
      globalSocketRef.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          gameid: gameIdToUnsubscribe,
          apitype: 'casino',
        })
      );
    }
  }, []);

  const closeSocketOnly = useCallback(() => {
    if (globalSocketRef.current) {
      globalSocketRef.current.onopen = null;
      globalSocketRef.current.onmessage = null;
      globalSocketRef.current.onerror = null;
      globalSocketRef.current.onclose = null;

      if (globalSocketRef.current.readyState === WebSocket.OPEN) {
        globalSocketRef.current.close();
      }
      globalSocketRef.current = null;
    }
  }, []);

  // =====================================================
  // EFFECT 4: Create WebSocket connection
  // =====================================================
  useEffect(() => {
    if (!gameid) return;

    // Close existing socket
    closeSocketOnly();

    // Create new WebSocket
    globalSocketRef.current = new WebSocket(host);

    globalSocketRef.current.onopen = () => {
      dispatch({ type: 'CONNECTED' });
      subscribe();
    };

    globalSocketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const currentGameId = gameidRef.current;

        if (data.gameid && data.gameid !== currentGameId) {
          return;
        }

        if (data.type === 'casino_update') {
          onBettingDataUpdate?.(data.data);

          const newRoundId = data.data?.mid;
          const currentLastRoundId = lastRoundIdRef.current;

          if (
            newRoundId &&
            newRoundId !== currentLastRoundId &&
            !isFetchingResultsRef.current
          ) {
            lastRoundIdRef.current = newRoundId;
            isFetchingResultsRef.current = true;
            dispatch({ type: 'FETCH_START' });

            // Notify parent about result update (dashboard handles results locally)
            onResultUpdate?.(data.data);

            // Reset fetching state after a short delay
            setTimeout(() => {
              isFetchingResultsRef.current = false;
              dispatch({ type: 'FETCH_END' });
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    globalSocketRef.current.onerror = () => {
      dispatch({ type: 'DISCONNECTED' });
    };

    globalSocketRef.current.onclose = () => {
      dispatch({ type: 'DISCONNECTED' });
    };

    return () => {
      unsubscribe(gameid);
      closeSocketOnly();
      dispatch({ type: 'DISCONNECTED' });
    };
  }, [
    gameid,
    closeSocketOnly,
    subscribe,
    unsubscribe,
    onBettingDataUpdate,
    onResultUpdate,
  ]);

  // =====================================================
  // EFFECT 5: Re-subscribe when bettingDataMid changes
  // =====================================================
  useEffect(() => {
    if (state.isConnected && bettingDataMid) {
      subscribe();
    }
  }, [bettingDataMid, state.isConnected, subscribe]);

  // =====================================================
  // Exported setter for external use
  // =====================================================
  const setIsFetchingResults = useCallback((value) => {
    isFetchingResultsRef.current = value;
    dispatch({ type: value ? 'FETCH_START' : 'FETCH_END' });
  }, []);

  return {
    isConnected: state.isConnected,
    isFetchingResults: state.isFetchingResults,
    lastRoundIdRef,
    setIsFetchingResults,
  };
};

export default useCasinoWebSocket;
