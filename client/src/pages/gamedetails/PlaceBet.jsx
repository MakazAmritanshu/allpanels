// import React, { useState, useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { createBet, createfancyBet, getPendingBetAmo, messageClear } from '../../redux/reducer/betReducer'
// import { getUser } from '../../redux/reducer/authReducer'
// import { toast } from 'react-toastify'

// function PlaceBet({
//   selectedBet,
//   onBetChange,
//   onClose,
//   isMobile = false,
//   team1,
//   team2,
//   gameId,
//   eventName,
//   marketName,
//   gameType,
//   gameName = 'Cricket Game',
//   maxAmount,
//   minAmount,
//   fancyScore
// }) {
//   console.log("selectedBet",selectedBet);
//   const dispatch = useDispatch()
//   const { loading, errorMessage, successMessage } = useSelector((state) => state.bet)

//   const [stake, setStake] = useState('')
//   const [odds, setOdds] = useState(selectedBet?.odds || '')
//   const [betFor, setBetFor] = useState(selectedBet?.team || '')
//   const [betType, setBetType] = useState(selectedBet?.type || '') // 'back' or 'lay'
//   const prevBetKeyRef = React.useRef('')

//   useEffect(() => {
//     if (selectedBet) {
//       // Create a unique key for the bet selection (excluding stake)
//       const currentBetKey = `${selectedBet.team}-${selectedBet.odds}-${selectedBet.sid}-${selectedBet.type}`

//       // Only reset stake if the bet selection actually changed (different team/odds/sid)
//       if (currentBetKey !== prevBetKeyRef.current) {
//       setBetFor(selectedBet.team || '')
//       setOdds(selectedBet.odds || '')
//       setBetType(selectedBet.type || '')
//         setStake('') // Reset stake when bet selection changes
//         prevBetKeyRef.current = currentBetKey
//       }
//       // Don't update stake from selectedBet when user is typing - let local state handle it
//     }
//   }, [selectedBet])

//   // Toast messages are now handled in the parent component (CricketBet/FootballBet/TennisBet)
//   // to prevent duplicate toasts from multiple PlaceBet component instances

//   useEffect(() => {
//     dispatch(getUser())
//   }, [dispatch])

//   // Calculate profit based on stake and odds
//   const calculateProfit = () => {
//     if (!stake || !odds) return '0'
//     const stakeNum = parseFloat(stake)
//     const oddsNum = parseFloat(odds)
//     if (isNaN(stakeNum) || isNaN(oddsNum)) return '0'

//     // For back: profit = stake * (odds - 1)
//     // For lay: profit = stake * (1 - odds) but typically calculated differently
//     // Based on the image showing positive profit, assuming back bet calculation
//     const profitValue = stakeNum * (oddsNum - 1)
//     return profitValue.toFixed(2)
//   }

//   const profit = calculateProfit()

//   // Get all teams from selectedBet, fallback to team1/team2 if not available
//   const allTeams = selectedBet?.teams && selectedBet.teams.length > 0
//     ? selectedBet.teams
//     : (team1 && team2 ? [team1, team2] : []);

//   // Get the other team name (for backward compatibility)
//   const getOtherTeam = () => {
//     if (!team1 || !team2) return ''
//     return betFor === team1 ? team2 : team1
//   }

//   const otherTeam = getOtherTeam()

//   // Format number with commas
//   const formatNumber = (num) => {
//     if (!num || num === '0') return '0'
//     const numValue = parseFloat(num)
//     if (isNaN(numValue)) return '0'
//     return numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
//   }

//   const handleStakeChange = (value) => {
//     setStake(value)
//     // Update selectedBet with stake for suggestion calculations
//     if (onBetChange && selectedBet) {
//       onBetChange({ ...selectedBet, stake: value })
//     }
//   }

//   const handleQuickStake = (amount) => {
//     const currentStake = parseFloat(stake) || 0
//     const newStake = (currentStake + amount).toString()
//     setStake(newStake)
//     // Update selectedBet with stake for suggestion calculations
//     if (onBetChange && selectedBet) {
//       onBetChange({ ...selectedBet, stake: newStake })
//     }
//   }

//   const handleClearStake = () => {
//     setStake('')
//   }

//   const handleOddsChange = (value) => {
//     setOdds(value)
//     if (onBetChange && selectedBet) {
//       onBetChange({ ...selectedBet, odds: value })
//     }
//   }

//   const handleOddsIncrement = () => {
//     const currentOdds = parseFloat(odds) || 0
//     handleOddsChange((currentOdds + 0.01).toFixed(2))
//   }

//   const handleOddsDecrement = () => {
//     const currentOdds = parseFloat(odds) || 0
//     if (currentOdds > 0.01) {
//       handleOddsChange((currentOdds - 0.01).toFixed(2))
//     }
//   }

//   const handleReset = () => {
//     setStake('')
//     setOdds(selectedBet?.odds || '')
//     setBetFor(selectedBet?.team || '')
//   }

//   const handleSubmit = async () => {
//     if (!stake || !odds || !betFor) {
//       toast.error('Please fill in all required fields')
//       return
//     }

//     const stakeNum = parseFloat(stake)
//     const oddsNum = parseFloat(odds)

//     if (isNaN(stakeNum) || isNaN(oddsNum)) {
//       toast.error('Please enter valid stake and odds')
//       return
//     }

//     // Validate min/max amounts
//     if (minAmount && stakeNum < minAmount) {
//       toast.error(`Minimum bet amount is ${minAmount}`)
//       return
//     }

//     if (maxAmount && stakeNum > maxAmount) {
//       toast.error(`Maximum bet amount is ${maxAmount}`)
//       return
//     }

//     // Determine if this is a fancy bet (Normal, meter, line, ball, khado, oddeven, fancy1)
//     const fancyBetTypes = ['Normal', 'meter', 'line', 'ball', 'khado', 'oddeven', 'fancy1']
//     const isFancyBet = fancyBetTypes.includes(gameType)

//     const formData = {
//       gameId: gameId,
//       sid: selectedBet?.sid || 4,
//       otype: betType,
//       price: stakeNum,
//       xValue: oddsNum.toString(),
//       gameType: gameType,
//       marketName: marketName || gameType,
//       eventName: eventName,
//       gameName: gameName,
//       teamName: betFor,
//       fancyScore: fancyScore || null,
//     }

//     try {
//       if (isFancyBet) {
//         await dispatch(createfancyBet(formData))
//       } else {
//         await dispatch(createBet(formData))
//       }

//       // Refresh user data and pending bets
//       await dispatch(getUser())
//       if (gameId) {
//         dispatch(getPendingBetAmo(gameId))
//       }

//       // Reset form and close modal
//       setStake('')
//       if (onClose) {
//         onClose()
//       }
//     } catch (error) {
//       console.error('Error placing bet:', error)
//     }
//   }

//   const handleEdit = () => {
//     // Handle edit logic here
//     console.log('Editing bet')
//   }

//   if (!selectedBet) {
//     return (
//       null
//     )
//   }

//   return (
//     <div className='bg-white'>
//       {/* Header */}
//       <div className={`${isMobile?"bg-primary":"bg-secondary"} text-white font-bold p-1 text-[15px] flex justify-between items-center`}>
//         <span>Place Bet</span>
//         {isMobile && onClose && (
//           <div className='flex items-center gap-2'>
//             <span className='text-[12px]'>Profit: {profit}</span>
//             <button
//               onClick={onClose}
//               className='text-white hover:text-gray-200 text-[20px] font-normal'
//               style={{ lineHeight: '1' }}
//             >
//               ×
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Betting Details Table */}

//         {/* Table Headers */}
//         <div className='grid grid-cols-4 bg-[#cccccc] text-black text-[12px] font-bold'>
//           <div className='p-2 '>(Bet for)</div>
//           <div className='p-2 '>Odds</div>
//           <div className='p-2 '>Stake</div>
//           <div className='p-2'>Profit</div>
//         </div>

//         <div className={`${betType === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}>
//           {/* Table Data Row */}
//         <div className={`grid grid-cols-4  text-black text-[12px]`}>
//           <div className='p-2  text-[#000000] text-[12px] '>{betFor}</div>
//           <div className='p-2 flex  gap-1'>
//             <input
//               type='number'
//               value={odds}
//               onChange={(e) => handleOddsChange(e.target.value)}
//               step='0.01'
//               min='0.01'
//               className='w-full h-[25px] bg-white  px-1 py-0.5 text-[12px]'
//             />
//             <div className='flex flex-col'>
//               <button
//                 onClick={handleOddsIncrement}
//                 className='text-[10px] leading-none  bg-white hover:bg-gray-100'
//                 style={{ width: '16px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
//               >
//                 ▲
//               </button>
//               <button
//                 onClick={handleOddsDecrement}
//                 className='text-[10px] leading-none  bg-white hover:bg-gray-100'
//                 style={{ width: '16px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
//               >
//                 ▼
//               </button>
//             </div>
//           </div>
//           <div className='p-2 '>
//             <input
//               type='number'
//               value={stake}
//               onChange={(e) => handleStakeChange(e.target.value)}
//               placeholder=''
//               className='w-full h-[25px] bg-white px-1 py-0.5 text-[12px]'
//             />
//           </div>
//           <div className='p-2'>{profit}</div>
//         </div>

//       {/* Quick Stake Buttons */}
//       <div className=' p-2'>
//         <div className='flex  gap-1 mb-1'>
//           <button
//             onClick={() => handleQuickStake(1000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +1k
//           </button>
//           <button
//             onClick={() => handleQuickStake(2000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +2k
//           </button>
//           <button
//             onClick={() => handleQuickStake(5000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +5k
//           </button>
//           <button
//             onClick={() => handleQuickStake(10000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +10k
//           </button>
//           <button
//             onClick={() => handleQuickStake(20000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +20k
//           </button>
//         </div>
//         <div className='flex gap-1'>
//           <button
//             onClick={() => handleQuickStake(25000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +25k
//           </button>
//           <button
//             onClick={() => handleQuickStake(50000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +50k
//           </button>
//           <button
//             onClick={() => handleQuickStake(75000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +75k
//           </button>
//           <button
//             onClick={() => handleQuickStake(100000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +1L
//           </button>
//           <button
//             onClick={() => handleQuickStake(200000)}
//             className='bg-[#cccccc] hover:bg-gray-500 text-[#000000] px-4 py-1 text-[14px] font-bold w-[calc(20%-2px)]'
//           >
//             +2L
//           </button>
//         </div>
//         <div className='flex justify-end mt-1'>
//           <button
//             onClick={handleClearStake}
//             className='text-[#212529] underline text-[12px] cursor-pointer'
//           >
//             clear
//           </button>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className='flex gap-1 p-2'>
//         <button
//           onClick={handleEdit}
//           className='flex-1 bg-[#097c93] border border-[#097c93] hover:bg-[#086a82] text-white font-bold py-2 text-[12px]'
//         >
//           Edit
//         </button>
//         <button
//           onClick={handleReset}
//           className='flex-1 bg-[#bd1828] border border-[#bd1828] hover:bg-[#c82333] text-white font-bold py-2 text-[12px]'
//         >
//           Reset
//         </button>
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className={`flex-1 bg-[#198754] border border-[#198754] hover:bg-[#157347] text-white font-bold py-2 text-[12px] ${
//             loading ? 'cursor-not-allowed opacity-70' : ''
//           }`}
//         >
//           {loading ? 'Placing...' : (isMobile ? 'Place Bet' : 'Submit')}
//         </button>
//       </div>

//       {/* Bet Summary Footer - Mobile Only */}
//       {isMobile && allTeams.length > 0 && (
//         <div className={`${betType === 'back' ? 'bg-[#ffffff45]' : 'bg-[#ffffff45]'} p-2`}>
//           {allTeams.map((team, index) => (
//             <div key={index} className='flex justify-between items-center mb-1'>
//               <span className='text-black text-[12px]'>{team}</span>
//             {stake && (
//                 <span className={`text-[12px] font-semibold ${
//                   team === betFor
//                     ? 'text-[#28a745]' // Green for selected team/item (profit)
//                     : 'text-[#dc3545]' // Red for other teams/items (loss)
//                 }`}>
//                   {team === betFor ? formatNumber(profit) : `-${formatNumber(stake)}`}
//                 </span>
//             )}
//           </div>
//           ))}
//         </div>
//       )}
//         </div>
//     </div>
//   )
// }

// export default PlaceBet

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createBet,
  createfancyBet,
  getPendingBetAmo,
  getBetHistory,
  messageClear,
} from '../../redux/reducer/betReducer';
import { getUser } from '../../redux/reducer/authReducer';
import { toast } from 'react-toastify';

function PlaceBet({
  selectedBet,
  onBetChange,
  onClose,
  isMobile = false,
  team1,
  team2,
  gameId,
  eventName,
  marketName,
  gameType,
  gameName = 'Cricket Game',
  sid,
  maxAmount,
  minAmount,
  fancyScore,
}) {
  console.log('selectedBet', selectedBet);
  const dispatch = useDispatch();
  const { loading, errorMessage, successMessage, pendingBetAmounts } =
    useSelector((state) => state.bet);

  const [stake, setStake] = useState('');
  const [odds, setOdds] = useState(selectedBet?.odds || '');
  const [betFor, setBetFor] = useState(selectedBet?.team || '');
  const [betType, setBetType] = useState(selectedBet?.type || ''); // 'back' or 'lay'
  const prevBetKeyRef = React.useRef('');
  const autoCloseTimerRef = React.useRef(null);
  const onCloseRef = React.useRef(onClose);
  const loadingRef = React.useRef(loading);

  // Update ref when onClose changes
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Keep loading ref in sync so timeout callback can check if bet is still placing
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (selectedBet) {
      // Create a unique key for the bet selection (excluding stake)
      const currentBetKey = `${selectedBet.team}-${selectedBet.odds}-${selectedBet.sid}-${selectedBet.type}`;

      // Only reset stake if the bet selection actually changed (different team/odds/sid)
      if (currentBetKey !== prevBetKeyRef.current) {
        setBetFor(selectedBet.team || '');
        setOdds(selectedBet.odds || '');
        setBetType(selectedBet.type || '');
        setStake(''); // Reset stake when bet selection changes
        prevBetKeyRef.current = currentBetKey;
      }
      // Don't update stake from selectedBet when user is typing - let local state handle it
    }
  }, [selectedBet]);

  // Toast messages are now handled in the parent component (CricketBet/FootballBet/TennisBet)
  // to prevent duplicate toasts from multiple PlaceBet component instances

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  // Auto-close after 5 seconds of inactivity
  useEffect(() => {
    // Only set up auto-close if selectedBet exists
    if (selectedBet) {
      // Clear any existing timer first
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }

      // Set new timer to close after 5 seconds (only close if not still placing bet)
      autoCloseTimerRef.current = setTimeout(() => {
        if (!loadingRef.current && onCloseRef.current) {
          onCloseRef.current();
        }
        autoCloseTimerRef.current = null;
      }, 5000);

      // Cleanup timer on unmount or when selectedBet changes
      return () => {
        if (autoCloseTimerRef.current) {
          clearTimeout(autoCloseTimerRef.current);
          autoCloseTimerRef.current = null;
        }
      };
    } else {
      // Clear timer if selectedBet is null
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    }
  }, [selectedBet]); // Removed onClose from dependencies

  // Reset auto-close timer on any user interaction
  const resetAutoCloseTimer = React.useCallback(() => {
    if (selectedBet) {
      // Clear existing timer
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      // Set new timer only if onClose is available
      if (onCloseRef.current) {
        autoCloseTimerRef.current = setTimeout(() => {
          if (!loadingRef.current && onCloseRef.current) {
            onCloseRef.current();
          }
          autoCloseTimerRef.current = null;
        }, 5000);
      }
    }
  }, [selectedBet]); // Removed onClose from dependencies

  // Get bet details from pending bets (same logic as components)
  const getBetDetails = (team) => {
    const gameTypeToMatch = gameType || marketName || '';
    const marketNameToMatch = marketName || gameType || '';

    // For Match Odds, also check for 'Match Odds' or 'Winner' or 'MATCH_ODDS' or 'TOURNAMENT_WINNER'
    const isMatchOdds =
      gameType === 'Match Odds' ||
      gameType === 'Winner' ||
      marketName === 'MATCH_ODDS' ||
      marketName === 'TOURNAMENT_WINNER';

    const matchedTeamBet = pendingBetAmounts?.find((item) => {
      const matchesGameType =
        item.gameType === gameTypeToMatch ||
        item.gameType === marketNameToMatch ||
        (isMatchOdds &&
          (item.gameType === 'Match Odds' ||
            item.gameType === 'Winner' ||
            item.gameType === 'MATCH_ODDS' ||
            item.gameType === 'TOURNAMENT_WINNER'));
      return (
        matchesGameType && item.teamName?.toLowerCase() === team?.toLowerCase()
      );
    });

    const otherTeamBet = pendingBetAmounts?.find((item) => {
      const matchesGameType =
        item.gameType === gameTypeToMatch ||
        item.gameType === marketNameToMatch ||
        (isMatchOdds &&
          (item.gameType === 'Match Odds' ||
            item.gameType === 'Winner' ||
            item.gameType === 'MATCH_ODDS' ||
            item.gameType === 'TOURNAMENT_WINNER'));
      return matchesGameType;
    });

    const otype = matchedTeamBet?.otype || otherTeamBet?.otype || '';
    const totalBetAmount =
      matchedTeamBet?.totalBetAmount || otherTeamBet?.totalBetAmount || '';
    const totalPrice =
      matchedTeamBet?.totalPrice || otherTeamBet?.totalPrice || '';
    const teamName = matchedTeamBet?.teamName || otherTeamBet?.teamName || '';

    return {
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
    };
  };

  // Calculate suggestion based on game type (same logic as components)
  // Don't show suggestions for these bet types - only show values after placing bet from API
  const calculateSuggestion = (
    team,
    selectedTeam,
    selectedType,
    stake,
    odds
  ) => {
    // Don't show suggestions for these bet types
    const noSuggestionMarkets = [
      'fancy1',
      'khado',
      'Normal',
      'meter',
      'oddeven',
    ];
    if (noSuggestionMarkets.includes(gameType)) {
      return null;
    }

    if (!stake || !odds || !selectedBet) return null;

    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);
    if (isNaN(stakeNum) || isNaN(oddsNum) || stakeNum === 0) return null;

    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(team);
    const isMatchedTeam = teamName?.toLowerCase() === team?.toLowerCase();
    const existingBet =
      (otype && totalBetAmount) || (totalPrice && teamName && isMatchedTeam);

    // Determine calculation method based on game type
    // Games using (odds / 100): Bookmaker, Normal, Meter, Khado
    // Games using (odds - 1): Match Odds, OverUnder, TiedMatch, Fancy1, OddEven
    const usesFancyCalculation = [
      'Bookmaker',
      'Normal',
      'meter',
      'khado',
    ].includes(gameType);
    const isBookmaker = gameType === 'Bookmaker';
    const isKhado = gameType === 'khado';

    if (!existingBet) {
      // No existing bet - calculate based on game type
      let profit;
      if (usesFancyCalculation) {
        // Bookmaker, Normal, Meter, Khado: profit = stake * (odds / 100)
        if (isKhado) {
          profit = stakeNum * (oddsNum / 100); // Khado only has back
        } else if (isBookmaker) {
          // Bookmaker: b = otype === 'lay' ? p : p * (x / 100), p = otype === 'lay' ? p * (x / 100) : p
          const p = stakeNum;
          const x = oddsNum;
          const b = selectedType === 'lay' ? p : p * (x / 100);
          const pCalc = selectedType === 'lay' ? p * (x / 100) : p;

          if (selectedType === 'back') {
            profit = b; // For BACK: profit = stake * (odds / 100)
            return {
              value: Math.abs(profit),
              color: profit >= 0 ? 'green' : 'red',
            };
          } else {
            // For LAY: if selected team wins, you lose pCalc (stake * odds / 100)
            // The value should be negative to show loss
            profit = -pCalc; // Negative because it's a loss if selected team wins
            return { value: Math.abs(profit), color: 'red' }; // Always red for LAY loss on selected team
          }
        } else {
          // Normal, Meter
          profit =
            selectedType === 'back'
              ? stakeNum * (oddsNum / 100)
              : stakeNum * (1 - oddsNum / 100);
        }
      } else {
        // Match Odds, OverUnder, TiedMatch, Fancy1, OddEven: profit = stake * (odds - 1)
        profit =
          selectedType === 'back'
            ? stakeNum * (oddsNum - 1)
            : stakeNum * (1 - oddsNum);
      }
      return { value: Math.abs(profit), color: profit >= 0 ? 'green' : 'red' };
    }

    // Complex calculation with existing bet
    const totalBetAmt = parseFloat(totalBetAmount || 0);
    const totalPrc = parseFloat(totalPrice || 0);

    // Calculate new bet values based on game type
    let p, x, b;
    if (usesFancyCalculation) {
      if (isKhado) {
        // Khado only has back
        p = stakeNum;
        x = oddsNum;
        b = p * (x / 100);
        p = p;
      } else if (isBookmaker) {
        // Bookmaker calculation: b = otype === 'lay' ? p : p * (x / 100)
        // p = otype === 'lay' ? p * (x / 100) : p
        p = stakeNum;
        x = oddsNum;
        b = selectedType === 'lay' ? p : p * (x / 100);
        p = selectedType === 'lay' ? p * (x / 100) : p;
      } else {
        // Normal, Meter
        p = stakeNum;
        x = oddsNum;
        b = selectedType === 'back' ? p * (x / 100) : p * (1 - x / 100);
        p = selectedType === 'lay' ? p * (1 - x / 100) : p;
      }
    } else {
      // Match Odds, OverUnder, TiedMatch, Fancy1, OddEven
      p = stakeNum;
      x = oddsNum;
      b = selectedType === 'lay' ? p : p * (x - 1);
      p = selectedType === 'lay' ? p * (x - 1) : p;
    }

    // For Bookmaker, use the specific logic from the provided component
    if (isBookmaker && existingBet) {
      if (selectedTeam?.toLowerCase() === teamName?.toLowerCase()) {
        if (selectedType === otype) {
          // Same team, same type - merge
          b = b + totalBetAmt;
          p = p + totalPrc;
          const calValue = selectedType === 'back' ? b : p;
          return {
            value: Math.abs(calValue),
            color: selectedType === 'back' && calValue >= 0 ? 'green' : 'red',
          };
        } else {
          // Same team, opposite type - offset
          if (selectedType === 'back') {
            if (totalBetAmt > p) {
              p = totalPrc - b;
              return { value: Math.abs(p), color: 'red' };
            } else {
              b = b - totalPrc;
              return { value: Math.abs(b), color: b < 0 ? 'red' : 'green' };
            }
          } else if (selectedType === 'lay') {
            if (totalPrc >= b) {
              b = totalBetAmt - p;
              return { value: Math.abs(b), color: b < 0 ? 'red' : 'green' };
            } else {
              p = p - totalBetAmt;
              return { value: Math.abs(p), color: 'red' };
            }
          }
        }
      } else {
        // Different team
        if (selectedType === otype) {
          if (selectedType === 'back') {
            if (totalPrc >= b) {
              p = totalPrc - b;
              return { value: Math.abs(p), color: 'red' };
            } else {
              b = b - totalPrc;
              return { value: Math.abs(b), color: b < 0 ? 'red' : 'green' };
            }
          } else if (selectedType === 'lay') {
            if (totalPrc >= b) {
              b = totalBetAmt - p;
              return { value: Math.abs(b), color: b < 0 ? 'red' : 'green' };
            } else {
              p = p - totalBetAmt;
              return { value: Math.abs(p), color: 'red' };
            }
          }
        } else {
          // Different team, different type - add
          b = b + totalBetAmt;
          p = p + totalPrc;
          const calValue = selectedType === 'back' ? b : p;
          return {
            value: Math.abs(calValue),
            color: selectedType === 'back' && calValue >= 0 ? 'green' : 'red',
          };
        }
      }
    }

    // For other game types, use the original logic
    if (selectedTeam?.toLowerCase() === teamName?.toLowerCase()) {
      if (selectedType === otype) {
        // Same team, same type - merge
        b = b + totalBetAmt;
        p = p + totalPrc;
        const calValue = selectedType === 'back' ? b : p;
        return {
          value: Math.abs(calValue),
          color: calValue >= 0 ? 'green' : 'red',
        };
      } else {
        // Same team, opposite type - offset
        if (selectedType === 'back') {
          if (totalBetAmt > p) {
            p = totalPrc - b;
            return { value: Math.abs(p), color: 'red' };
          } else {
            b = b - totalPrc;
            return { value: Math.abs(b), color: b >= 0 ? 'green' : 'red' };
          }
        } else {
          if (totalPrc >= b) {
            b = totalBetAmt - p;
            return { value: Math.abs(b), color: b >= 0 ? 'green' : 'red' };
          } else {
            p = p - totalBetAmt;
            return { value: Math.abs(p), color: 'red' };
          }
        }
      }
    } else {
      // Different team
      if (selectedType === otype) {
        if (selectedType === 'back') {
          if (totalPrc >= b) {
            p = totalPrc - b;
            return { value: Math.abs(p), color: 'red' };
          } else {
            b = b - totalPrc;
            return { value: Math.abs(b), color: b >= 0 ? 'green' : 'red' };
          }
        } else {
          if (totalPrc >= b) {
            b = totalBetAmt - p;
            return { value: Math.abs(b), color: b >= 0 ? 'green' : 'red' };
          } else {
            p = p - totalBetAmt;
            return { value: Math.abs(p), color: 'red' };
          }
        }
      } else {
        // Different team, different type - add
        b = b + totalBetAmt;
        p = p + totalPrc;
        const calValue = selectedType === 'back' ? b : p;
        return {
          value: Math.abs(calValue),
          color: calValue >= 0 ? 'green' : 'red',
        };
      }
    }
  };

  // Calculate profit for display (always show green/profit value)
  const calculateProfit = () => {
    if (!stake || !odds) return '0';

    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);
    if (isNaN(stakeNum) || isNaN(oddsNum)) return '0';

    // Always show the green/profit value
    // For BACK: profit if selected team wins
    // For LAY: profit if selected team loses (stake)
    if (betType === 'back') {
      // BACK: get green value from selected team suggestion
      const suggestion = calculateSuggestion(
        betFor,
        betFor,
        betType,
        stake,
        odds
      );
      if (suggestion && suggestion.color === 'green') {
        return suggestion.value.toFixed(2);
      }
      // Fallback: calculate profit if selected team wins
      const usesFancyCalculation = [
        'Bookmaker',
        'Normal',
        'meter',
        'khado',
      ].includes(gameType);
      const isKhado = gameType === 'khado';

      let profitValue;
      if (usesFancyCalculation) {
        if (isKhado) {
          profitValue = stakeNum * (oddsNum / 100);
        } else {
          // Bookmaker, Normal, Meter
          profitValue = stakeNum * (oddsNum / 100);
        }
      } else {
        // Match Odds, OverUnder, etc.
        profitValue = stakeNum * (oddsNum - 1);
      }
      return profitValue.toFixed(2);
    } else {
      // LAY: green value is the stake (profit if selected team loses)
      return stakeNum.toFixed(2);
    }
  };

  const profit = calculateProfit();

  // Get all teams from selectedBet, fallback to team1/team2 if not available
  const allTeams =
    selectedBet?.teams && selectedBet.teams.length > 0
      ? selectedBet.teams
      : team1 && team2
        ? [team1, team2]
        : [];

  // Get the other team name (for backward compatibility)
  const getOtherTeam = () => {
    if (!team1 || !team2) return '';
    return betFor === team1 ? team2 : team1;
  };

  const otherTeam = getOtherTeam();

  // Format number with commas
  const formatNumber = (num) => {
    if (!num || num === '0') return '0';
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const handleStakeChange = (value) => {
    setStake(value);
    resetAutoCloseTimer(); // Reset timer on interaction
    // Update selectedBet with stake for suggestion calculations
    if (onBetChange && selectedBet) {
      onBetChange({ ...selectedBet, stake: value });
    }
  };

  const handleQuickStake = (amount) => {
    const currentStake = parseFloat(stake) || 0;
    const newStake = (currentStake + amount).toString();
    setStake(newStake);
    resetAutoCloseTimer(); // Reset timer on interaction
    // Update selectedBet with stake for suggestion calculations
    if (onBetChange && selectedBet) {
      onBetChange({ ...selectedBet, stake: newStake });
    }
  };

  const handleClearStake = () => {
    setStake('');
    resetAutoCloseTimer(); // Reset timer on interaction
  };

  const handleOddsChange = (value) => {
    setOdds(value);
    resetAutoCloseTimer(); // Reset timer on interaction
    if (onBetChange && selectedBet) {
      onBetChange({ ...selectedBet, odds: value });
    }
  };

  const handleOddsIncrement = () => {
    const currentOdds = parseFloat(odds) || 0;
    handleOddsChange((currentOdds + 0.01).toFixed(2));
    // Timer reset is handled in handleOddsChange
  };

  const handleOddsDecrement = () => {
    const currentOdds = parseFloat(odds) || 0;
    if (currentOdds > 0.01) {
      handleOddsChange((currentOdds - 0.01).toFixed(2));
      // Timer reset is handled in handleOddsChange
    }
  };

  const handleReset = () => {
    setStake('');
    setOdds(selectedBet?.odds || '');
    setBetFor(selectedBet?.team || '');
    resetAutoCloseTimer(); // Reset timer on interaction
  };

  const handleSubmit = async () => {
    if (!stake || !odds || !betFor) {
      toast.error('Please fill in all required fields');
      return;
    }

    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);

    if (isNaN(stakeNum) || isNaN(oddsNum)) {
      toast.error('Please enter valid stake and odds');
      return;
    }

    // Validate min/max amounts
    if (minAmount && stakeNum < minAmount) {
      toast.error(`Minimum bet amount is ${minAmount}`);
      return;
    }

    if (maxAmount && stakeNum > maxAmount) {
      toast.error(`Maximum bet amount is ${maxAmount}`);
      return;
    }

    // Determine if this is a fancy bet (Normal, meter, line, ball, khado, oddeven, fancy1)
    const fancyBetTypes = [
      'Normal',
      'meter',
      'line',
      'ball',
      'khado',
      'oddeven',
      'fancy1',
    ];
    const isFancyBet = fancyBetTypes.includes(gameType);

    // For all fancy bets (Normal, Meter, Khado, Fancy1):
    // fancyScore = original odds value (rate), xValue = size value, price = stake
    // For other fancy bets: use existing logic
    let finalFancyScore = fancyScore || null;
    let finalXValue = oddsNum.toString();

    const fancyBetTypesWithSize = ['Normal', 'meter', 'khado', 'fancy1'];
    if (
      fancyBetTypesWithSize.includes(gameType) &&
      selectedBet?.size !== undefined &&
      selectedBet?.size !== null
    ) {
      // For fancy bets: fancyScore is the original odds value (rate) from selectedBet, xValue is the size value
      finalFancyScore = parseFloat(selectedBet.odds || oddsNum); // The original odds value (e.g., 15)
      finalXValue = selectedBet.size.toString(); // The size value (e.g., 120)
    }

    const formData = {
      gameId: gameId,
      sid: sid,
      otype: betType,
      price: stakeNum,
      xValue: finalXValue,
      gameType: gameType,
      marketName: marketName || gameType,
      eventName: eventName,
      gameName: gameName,
      teamName: betFor,
      fancyScore: finalFancyScore,
    };

    try {
      if (isFancyBet) {
        await dispatch(createfancyBet(formData));
      } else {
        await dispatch(createBet(formData));
      }

      // Refresh user data and pending bets
      await dispatch(getUser());
      if (gameId) {
        dispatch(getPendingBetAmo(gameId));
        dispatch(getBetHistory({
          gameid: gameId,
          page: 1,
          limit: 10,
          selectedVoid: 'unsettel',
        }));
      }

      // Reset form and close modal
      setStake('');
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  const handleEdit = () => {
    // Handle edit logic here
    console.log('Editing bet');
    resetAutoCloseTimer(); // Reset timer on interaction
  };

  if (!selectedBet) {
    return null;
  }

  return (
    <div className='bg-white'>
      {/* Header */}
      <div
        className={`${isMobile ? 'bg-primary' : 'bg-secondary'} flex items-center justify-between p-1 text-[15px] font-bold text-white`}
      >
        <span>Place Bet</span>
        {isMobile && onClose && (
          <div className='flex items-center gap-2'>
            {(() => {
              // Don't show profit for these bet types - only show after placing bet from API
              const noSuggestionMarkets = [
                'fancy1',
                'khado',
                'Normal',
                'meter',
                'oddeven',
              ];
              const hideProfit = noSuggestionMarkets.includes(gameType);
              return (
                !hideProfit && (
                  <span className='text-[12px]'>Profit: {profit}</span>
                )
              );
            })()}
            <button
              onClick={onClose}
              className='text-[20px] font-normal text-white hover:text-gray-200'
              style={{ lineHeight: '1' }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Betting Details Table */}

      {/* Table Headers */}
      <div className='grid grid-cols-4 bg-[#cccccc] text-[12px] font-bold text-black'>
        <div className='p-2'>(Bet for)</div>
        <div className='p-2'>Odds</div>
        <div className='p-2'>Stake</div>
        <div className='p-2'>Profit</div>
      </div>

      <div
        className={`${betType === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}
      >
        {/* Table Data Row */}
        <div className={`grid grid-cols-4 text-[12px] text-black`}>
          <div className='p-2 text-[12px] text-[#000000]'>{betFor}</div>
          <div className='flex gap-1 p-2'>
            <input
              type='number'
              value={odds}
              onChange={(e) => handleOddsChange(e.target.value)}
              step='0.01'
              min='0.01'
              className='h-[25px] w-full bg-white px-1 py-0.5 text-[12px]'
            />
            <div className='flex flex-col'>
              <button
                onClick={handleOddsIncrement}
                className='bg-white text-[10px] leading-none hover:bg-gray-100'
                style={{
                  width: '16px',
                  height: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                ▲
              </button>
              <button
                onClick={handleOddsDecrement}
                className='bg-white text-[10px] leading-none hover:bg-gray-100'
                style={{
                  width: '16px',
                  height: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                ▼
              </button>
            </div>
          </div>
          <div className='p-2'>
            <input
              type='number'
              value={stake}
              onChange={(e) => handleStakeChange(e.target.value)}
              placeholder=''
              className='h-[25px] w-full bg-white px-1 py-0.5 text-[12px]'
            />
          </div>
          <div className='p-2'>
            {(() => {
              // Don't show profit for these bet types - only show after placing bet from API
              const noSuggestionMarkets = [
                'fancy1',
                'khado',
                'Normal',
                'meter',
                'oddeven',
              ];
              const hideProfit = noSuggestionMarkets.includes(gameType);
              return hideProfit ? '-' : profit;
            })()}
          </div>
        </div>

        {/* Quick Stake Buttons */}
        <div className='p-2'>
          <div className='mb-1 flex gap-1'>
            <button
              onClick={() => handleQuickStake(1000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +1k
            </button>
            <button
              onClick={() => handleQuickStake(2000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +2k
            </button>
            <button
              onClick={() => handleQuickStake(5000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +5k
            </button>
            <button
              onClick={() => handleQuickStake(10000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +10k
            </button>
            <button
              onClick={() => handleQuickStake(20000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +20k
            </button>
          </div>
          <div className='flex gap-1'>
            <button
              onClick={() => handleQuickStake(25000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +25k
            </button>
            <button
              onClick={() => handleQuickStake(50000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +50k
            </button>
            <button
              onClick={() => handleQuickStake(75000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +75k
            </button>
            <button
              onClick={() => handleQuickStake(100000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +1L
            </button>
            <button
              onClick={() => handleQuickStake(200000)}
              className='w-[calc(20%-2px)] bg-[#cccccc] px-4 py-1 text-[14px] font-bold text-[#000000] hover:bg-gray-500'
            >
              +2L
            </button>
          </div>
          <div className='mt-1 flex justify-end'>
            <button
              onClick={handleClearStake}
              className='cursor-pointer text-[12px] text-[#212529] underline'
            >
              clear
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-1 p-2'>
          <button
            onClick={handleEdit}
            className='flex-1 border border-[#097c93] bg-[#097c93] py-2 text-[12px] font-bold text-white hover:bg-[#086a82]'
          >
            Edit
          </button>
          <button
            onClick={handleReset}
            className='flex-1 border border-[#bd1828] bg-[#bd1828] py-2 text-[12px] font-bold text-white hover:bg-[#c82333]'
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 border border-[#198754] bg-[#198754] py-2 text-[12px] font-bold text-white hover:bg-[#157347] ${
              loading ? 'cursor-not-allowed opacity-70' : ''
            }`}
          >
            {loading ? 'Placing...' : isMobile ? 'Place Bet' : 'Submit'}
          </button>
        </div>

        {/* Bet Summary Footer - Mobile Only */}
        {isMobile && allTeams.length > 0 && (
          <div
            className={`${betType === 'back' ? 'bg-[#ffffff45]' : 'bg-[#ffffff45]'} p-2`}
          >
            {allTeams.map((team, index) => {
              // Don't show suggestions for these bet types - only show after placing bet from API
              const noSuggestionMarkets = [
                'fancy1',
                'khado',
                'Normal',
                'meter',
                'oddeven',
              ];
              const shouldHideSuggestions =
                noSuggestionMarkets.includes(gameType);

              // Check for existing bet
              const { otype, totalBetAmount, totalPrice, teamName } =
                getBetDetails(team);
              const isMatchedTeam =
                teamName?.toLowerCase() === team?.toLowerCase();
              const existingBet =
                (otype && totalBetAmount) ||
                (totalPrice && teamName && isMatchedTeam);

              // For these bet types, only show existing bet values, no suggestions
              if (shouldHideSuggestions) {
                return (
                  <div
                    key={index}
                    className='mb-1 flex items-center justify-between'
                  >
                    <span className='text-[12px] text-black'>{team}</span>
                    {existingBet && (
                      <span
                        className={`text-[12px] font-semibold ${
                          otype === 'lay'
                            ? isMatchedTeam
                              ? 'text-[#dc3545]'
                              : 'text-[#28a745]'
                            : otype === 'back'
                              ? isMatchedTeam
                                ? 'text-[#28a745]'
                                : 'text-[#dc3545]'
                              : 'text-[#28a745]'
                        }`}
                      >
                        {(() => {
                          if (otype === 'lay') {
                            return isMatchedTeam
                              ? formatNumber(totalPrice)
                              : formatNumber(totalBetAmount);
                          } else if (otype === 'back') {
                            return isMatchedTeam
                              ? formatNumber(totalBetAmount)
                              : formatNumber(totalPrice);
                          }
                          return '';
                        })()}
                      </span>
                    )}
                  </div>
                );
              }

              // For other markets, show suggestions as before
              const isSelectedTeam =
                team?.toLowerCase() === betFor?.toLowerCase();
              const singleItemMarkets = [
                'fancy1',
                'khado',
                'Normal',
                'meter',
                'oddeven',
              ];
              const isSingleItemMarket = singleItemMarkets.includes(gameType);
              const shouldShowSuggestion = isSingleItemMarket
                ? isSelectedTeam
                : true;

              let suggestionValue = null;
              let suggestionColor = 'green';

              if (stake && selectedBet && shouldShowSuggestion) {
                if (isSelectedTeam) {
                  // For selected team: calculate profit/loss using same logic as components
                  const suggestion = calculateSuggestion(
                    team,
                    betFor,
                    betType,
                    stake,
                    odds
                  );
                  if (suggestion) {
                    // For Bookmaker LAY bets on selected team, the value represents loss (negative)
                    if (gameType === 'Bookmaker' && betType === 'lay') {
                      // For LAY: if selected team wins, you lose stake * (odds / 100)
                      // Show as negative value
                      suggestionValue = -suggestion.value;
                      suggestionColor = 'red'; // Always red for LAY loss on selected team
                    } else {
                      suggestionValue = suggestion.value;
                      suggestionColor = suggestion.color;
                    }
                  }
                } else {
                  // For other teams: depends on bet type (same logic as MatchOdds/Bookmaker)
                  // Only show for multi-team markets
                  if (!isSingleItemMarket) {
                    const stakeNum = parseFloat(stake);
                    if (!isNaN(stakeNum) && stakeNum > 0) {
                      if (betType === 'back') {
                        // BACK bet: if other team wins, you lose your stake
                        suggestionValue = stakeNum;
                        suggestionColor = 'red';
                      } else {
                        // LAY bet: if other team wins (selected team loses), you profit the stake
                        // For Bookmaker, this is correct
                        suggestionValue = stakeNum;
                        suggestionColor = 'green';
                      }
                    }
                  }
                }
              }

              return (
                <div
                  key={index}
                  className='mb-1 flex items-center justify-between'
                >
                  <span className='text-[12px] text-black'>{team}</span>
                  {(stake || existingBet) && (
                    <div className='flex items-center gap-1'>
                      {existingBet && (
                        <span
                          className={`text-[12px] font-semibold ${
                            otype === 'lay'
                              ? isMatchedTeam
                                ? 'text-[#dc3545]'
                                : 'text-[#28a745]'
                              : otype === 'back'
                                ? isMatchedTeam
                                  ? 'text-[#28a745]'
                                  : 'text-[#dc3545]'
                                : 'text-[#28a745]'
                          }`}
                        >
                          {(() => {
                            if (otype === 'lay') {
                              return isMatchedTeam
                                ? formatNumber(totalPrice)
                                : formatNumber(totalBetAmount);
                            } else if (otype === 'back') {
                              return isMatchedTeam
                                ? formatNumber(totalBetAmount)
                                : formatNumber(totalPrice);
                            }
                            return '';
                          })()}
                        </span>
                      )}
                      {suggestionValue !== null && (
                        <span
                          className={`text-[12px] font-semibold ${
                            suggestionColor === 'green'
                              ? 'text-[#28a745]'
                              : 'text-[#dc3545]'
                          }`}
                        >
                          {existingBet
                            ? `(${suggestionValue < 0 ? '-' : ''}${formatNumber(Math.abs(suggestionValue))})`
                            : `${suggestionValue < 0 ? '-' : ''}${formatNumber(Math.abs(suggestionValue))}`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaceBet;
