import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

// Redux actions
import {
  fetchCasinoBatingData,
  clearCasinoResultData,
} from '../../redux/reducer/casinoSlice';
import {
  getPendingBet,
  getPendingBetAmo,
  clearPendingBetAmounts,
} from '../../redux/reducer/betReducer';
import { getUser } from '../../redux/reducer/authReducer';

// Components
import VideoStream from './components/VideoStream';
import RecentResults from './components/RecentResults';
import ResultPopup from '../../components/CasinoResult1';
import Spinner2 from '../../components/Spinner2';

// Hooks
import useBetting from './hooks/useBetting';
import useCasinoResults from './hooks/useCasinoResults';
import useCasinoWebSocket from './hooks/useCasinoWebSocket';

// Utils & Constants
import { renderGameUI } from './utils/gameRendererFactory';
import {
  groupBettingData,
  filterPlayersForTwoPlayerGames,
} from './utils/bettingUtils';
import { TWO_PLAYER_GAMES, getWinnerMap } from './constants';

export default function CasinoBet({ item = null }) {
  const dispatch = useDispatch();
  const { gameid } = useParams() || {};

  // Local state
  const [bettingData, setBettingData] = useState(null);
  const [videoPageLoader, setVideoPageLoader] = useState(true);

  // Refs
  const previousMidRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Redux selectors
  const { battingData } = useSelector((state) => state.casino);
  const { userInfo } = useSelector((state) => state.auth);

  // Custom hooks
  const betting = useBetting({ gameid, bettingData });
  const results = useCasinoResults({ gameid });

  // WebSocket connection
  const { isConnected } = useCasinoWebSocket({
    gameid,
    userId: userInfo?._id,
    bettingDataMid: bettingData?.mid,
    onBettingDataUpdate: setBettingData,
  });

  // Winner map for result display
  const winnerMap = getWinnerMap(gameid);

  // ============== EFFECTS ==============

  // Fetch betting data when game changes
  useEffect(() => {
    if (gameid) {
      dispatch(clearCasinoResultData());
      dispatch(fetchCasinoBatingData(gameid));
      dispatch(getPendingBet());
      dispatch(getPendingBetAmo(gameid));
    }
  }, [gameid, dispatch]);

  // Sync betting data from Redux
  useEffect(() => {
    setBettingData(battingData?.data);
  }, [battingData]);

  // Reset betting state when game becomes suspended
  useEffect(() => {
    const gstatus = bettingData?.sub?.[0]?.gstatus;
    if (gstatus === 'SUSPENDED') {
      betting.resetBettingState();
    }
  }, [bettingData?.sub, betting.resetBettingState]);

  // Handle round changes - clear bets and refresh data when new round starts
  useEffect(() => {
    if (!bettingData?.mid) return;

    const currentMid = bettingData.mid;
    const previousMid = previousMidRef.current;

    if (hasInitializedRef.current && previousMid !== currentMid) {
      console.log('🔄 Round changed, clearing pending bets');
      betting.resetAllBettingState(); // Full reset including selectedTeamSubtype
      dispatch(clearPendingBetAmounts());

      // Refetch user data and pending bets after clearing
      setTimeout(() => {
        dispatch(getUser()); // Refresh balance after result
        dispatch(getPendingBetAmo(gameid));
      }, 100);
    }

    previousMidRef.current = currentMid;
    hasInitializedRef.current = true;
  }, [bettingData?.mid, gameid, dispatch, betting.resetAllBettingState]);

  // Fetch user data when game changes
  useEffect(() => {
    if (gameid) {
      dispatch(getUser());
    }
  }, [gameid, dispatch]);

  // Fallback polling when WebSocket disconnected
  useEffect(() => {
    if (!gameid || isConnected) return;

    const pollInterval = setInterval(() => {
      dispatch(fetchCasinoBatingData(gameid));
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [gameid, dispatch, isConnected]);

  // ============== DATA PROCESSING ==============

  // Group and filter betting data
  const groupedData = groupBettingData(bettingData?.sub, gameid);
  const displayData = filterPlayersForTwoPlayerGames(
    groupedData,
    gameid,
    bettingData?.sub,
    TWO_PLAYER_GAMES
  );

  // ============== RENDER ==============

  return (
    <>
      {/* Page Loader */}
      {videoPageLoader && (
        <div className='fixed inset-0 z-50 w-full bg-black'>
          <img
            src='/loader.gif'
            alt='Loading'
            onLoad={() => setVideoPageLoader(false)}
            className='fixed inset-0 z-50 w-full bg-black'
            style={{ display: videoPageLoader ? 'none' : 'block' }}
          />
        </div>
      )}

      {/* Bet Placement Loader */}
      {betting.loader && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <Spinner2 />
        </div>
      )}

      {/* Video Stream with Cards and Timer */}
      <VideoStream
        gameid={gameid}
        bettingData={bettingData}
        showWinner={results.showWinner}
        winnerLabel={winnerMap[results.resultData?.res?.[0]?.win]}
      />

      {/* Game-Specific Betting UI */}
      <div>
        {bettingData?.sub &&
          renderGameUI({
            gameid,
            displayData,
            bettingData,
            resultData: results.resultData,
            betControl: betting.betControl,
            setBetControl: betting.setBetControl,
            setValue: betting.setValue,
            setSelectedTeamSubtype: betting.setSelectedTeamSubtype,
            betAmount: betting.betAmount,
            betOdds: betting.betOdds,
            setBetOdds: betting.setBetOdds,
            updateAmount: betting.updateAmount,
            placeBet: betting.placeBet,
            loading: betting.loading,
            pendingBetAmounts: betting.pendingBetAmounts,
            selectedTeamSubtype: betting.selectedTeamSubtype,
            resetBettingState: betting.resetBettingState,
            hasPendingBetForControl: betting.hasPendingBetForControl,
          })}
      </div>

      {/* Recent Results */}
      <RecentResults
        gameid={gameid}
        currentGameId={results.currentGameId}
        results={results.resultData?.res}
        onItemClick={results.setSelectedItem}
      />

      {/* Result Detail Popup */}
      {results.selectedItem && (
        <ResultPopup
          mid={bettingData?.mid}
          gameId={gameid}
          item={results.selectedItem}
          onClose={() => results.setSelectedItem(null)}
          showSideBets={true}
        />
      )}
    </>
  );
}
