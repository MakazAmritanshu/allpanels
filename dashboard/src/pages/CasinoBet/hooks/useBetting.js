import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { getPendingBetAmo } from '../../../redux/reducer/marketAnalyzeReducer';
import { DEFAULT_BET_ODDS, DEFAULT_MAX_AMOUNT } from '../constants';

/**
 * Custom hook for managing betting state and actions
 * Note: This is a dashboard version - betting functionality is limited
 * as this is primarily for viewing/monitoring, not placing bets
 */
export const useBetting = ({ gameid, bettingData }) => {
  const dispatch = useDispatch();

  // Local state
  const [betOdds, setBetOdds] = useState(DEFAULT_BET_ODDS);
  const [betAmount, setBetAmount] = useState(0);
  const [selectedBet, setSelectedBet] = useState(null);
  const [betControl, setBetControl] = useState(null);
  const [loader, setLoader] = useState(false);
  const [selectedTeamSubtype, setSelectedTeamSubtype] = useState(
    () => localStorage.getItem('selectedTeamSubtype') || null
  );

  // Form data for bet placement
  const [formData, setFormData] = useState({
    gameId: gameid || '',
    price: null,
    xValue: '',
    teamName: '',
    otype: '',
    gname: '',
    betType: 'casino',
    roundId: '',
  });

  // Redux selectors - using market reducer
  const { loading, pendingBet } = useSelector((state) => state.market);

  // Memoize pendingBetAmounts to prevent unnecessary re-renders
  const pendingBetAmounts = useMemo(() => pendingBet || [], [pendingBet]);

  const { userInfo } = useSelector((state) => state.auth);

  // Local state for messages (dashboard doesn't have bet reducer messages)
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset betting state (for cancel button - doesn't reset selectedTeamSubtype)
  const resetBettingState = useCallback(() => {
    setBetControl(null);
    setSelectedBet(null);
    setBetAmount(0);
    setBetOdds(DEFAULT_BET_ODDS);
  }, []);

  // Full reset including selectedTeamSubtype (for round changes)
  const resetAllBettingState = useCallback(() => {
    setBetControl(null);
    setSelectedBet(null);
    setBetAmount(0);
    setBetOdds(DEFAULT_BET_ODDS);
    setSelectedTeamSubtype(null);
  }, []);

  // Update bet amount
  const updateAmount = useCallback((val, toggle = false) => {
    setBetAmount((prev) => {
      if (toggle) {
        return prev === val ? null : val;
      }
      return val;
    });
  }, []);

  // Set bet values when user clicks on a betting option
  const setValue = useCallback(
    (xValue, teamName, otype, nat, sid) => {
      if (nat !== betControl?.nat || sid !== betControl?.sid) {
        setBetAmount(0);
      }
      setBetOdds(xValue);

      setFormData((prev) => ({
        ...prev,
        gameId: gameid || prev.gameid,
        xValue: xValue,
        teamName: teamName,
        otype: otype,
        gname: bettingData?.gtype,
        roundId: bettingData?.mid,
      }));

      setSelectedBet({
        type: otype,
        teamName: teamName,
        odds: xValue,
      });
    },
    [betControl, gameid, bettingData]
  );

  // Place a bet
  const placeBet = useCallback(
    async (otype, teamName, maxAmo = DEFAULT_MAX_AMOUNT, xVal) => {
      // Validate required fields
      if (!gameid) {
        toast.error('Game ID is missing. Please refresh the page.');
        return;
      }

      if (!betAmount || betAmount <= 0) {
        toast.error('Please enter a valid bet amount');
        return;
      }

      if (betAmount > maxAmo) {
        toast.error(`Bet amount cannot exceed ${maxAmo}`);
        return;
      }

      if (!userInfo) {
        toast.error('User data not found. Please refresh the page.');
        return;
      }

      if (userInfo.balance === undefined || userInfo.balance === null) {
        toast.error(
          'Balance information not available. Please refresh the page.'
        );
        return;
      }

      const numericBalance = parseFloat(userInfo.avbalance) || 0;
      const numericBetAmount = parseFloat(betAmount) || 0;

      // Only block if no pending bets exist (no potential offset benefit)
      if (numericBalance < numericBetAmount && !pendingBetAmounts?.length) {
        toast.error(
          `Insufficient balance. Available: ${numericBalance}, Required: ${numericBetAmount}`
        );
        return;
      }

      if (!teamName || !otype) {
        toast.error('Please select a valid betting option');
        return;
      }

      const updatedFormData = {
        ...formData,
        gameId: gameid,
        price: betAmount,
        xValue: xVal,
        teamName: teamName,
        otype: otype,
        gname: formData.gname || 'Casino Game',
        betType: 'casino',
        roundId: bettingData?.mid,
      };

      try {
        setLoader(true);
        setFormData(updatedFormData);

        // Dashboard note: Bet placement is handled by the client app
        // This hook is for viewing/monitoring bets in the dashboard
        // If you need to place bets from dashboard, implement createBet action

        toast.info('Bet placement is not available in dashboard');

        // Refresh pending bet amounts
        await dispatch(getPendingBetAmo(gameid));
        setBetAmount(0);
        setBetControl(null);
        setSelectedBet(null);
      } catch {
        setErrorMessage('Failed to process bet');
      } finally {
        setLoader(false);
      }
    },
    [
      gameid,
      betAmount,
      userInfo,
      pendingBetAmounts,
      formData,
      bettingData,
      dispatch,
      setErrorMessage,
    ]
  );

  // Handle success/error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setSuccessMessage('');
    }

    if (errorMessage) {
      toast.error(errorMessage);
      setErrorMessage('');
    }
  }, [successMessage, errorMessage]);

  // Persist selectedTeamSubtype to localStorage
  useEffect(() => {
    if (selectedTeamSubtype !== null) {
      localStorage.setItem('selectedTeamSubtype', selectedTeamSubtype);
    } else {
      localStorage.removeItem('selectedTeamSubtype');
    }
  }, [selectedTeamSubtype]);

  // Check if there's a pending bet for the current control
  const hasPendingBetForControl =
    Array.isArray(pendingBet) &&
    pendingBet.some(
      (bet) => bet.gameid === gameid && bet.teamName === betControl?.nat
    );

  return {
    // State
    betOdds,
    setBetOdds,
    betAmount,
    setBetAmount,
    selectedBet,
    setSelectedBet,
    betControl,
    setBetControl,
    loader,
    loading,
    formData,
    selectedTeamSubtype,
    setSelectedTeamSubtype,
    pendingBet,
    pendingBetAmounts,
    userInfo,
    hasPendingBetForControl,

    // Actions
    resetBettingState,
    resetAllBettingState,
    updateAmount,
    setValue,
    placeBet,
  };
};

export default useBetting;
