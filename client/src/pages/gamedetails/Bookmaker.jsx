import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowRight, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../redux/api';
import {
  getPendingBetAmo,
  getPendingBet,
  executeCashout,
  clearCashoutValues,
  updateCashoutValues,
} from '../../redux/reducer/betReducer';
import { getUser } from '../../redux/reducer/authReducer';

function Bookmaker({
  onBetSelect,
  BookmakerList,
  pendingBetAmounts,
  selectedBet,
  gameid,
}) {
  const dispatch = useDispatch();
  const { eventName, cashoutValues, cashoutLoading, cashoutPL } = useSelector(
    (state) => state.bet
  );

  const backBg = ['bg-[#72bbef7f]', 'bg-[#72bbefbf]', 'bg-[#72bbef]'];
  const layBg = ['bg-[#faa9ba]', 'bg-[#faa9babf]', 'bg-[#faa9ba7f]'];
  const [showCashoutOptions, setShowCashoutOptions] = useState(false);
  const [cashedOutBetIds, setCashedOutBetIds] = useState(new Set());

  useEffect(() => {
    if (gameid) {
      dispatch(getPendingBetAmo(gameid));
      dispatch(getPendingBet(gameid));
    }
  }, [dispatch, gameid]);

  useEffect(() => {
    if (selectedBet) {
      setShowCashoutOptions(false);
      dispatch(clearCashoutValues());
    }
  }, [selectedBet, dispatch]);

  // Transform API data similar to MatchOdds
  const bookmakerData = BookmakerList?.[0]?.section?.length
    ? BookmakerList[0].section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds,
        max: sec.max,
        min: sec.min,
        mname: BookmakerList[0].mname || 'Bookmaker',
        gstatus: sec.gstatus,
        status: BookmakerList[0].status,
      }))
    : [];
  console.log('bookmakerData from bookmaker', bookmakerData);

  const CASHOUT_GAME_TYPES = ['Bookmaker', 'Bookmaker IPL CUP'];

  const marketBetsForCashout =
    Array.isArray(eventName) && gameid
      ? eventName.filter(
          (b) =>
            String(b.gameId) === String(gameid) &&
            CASHOUT_GAME_TYPES.includes(b.gameType) &&
            !b.isCashoutHedge &&
            !b.isCashedOut &&
            !cashedOutBetIds.has(String(b.betId || b._id))
        )
      : [];

  const uniqueMarketBetsForCashout = marketBetsForCashout.filter(
    (bet, index, arr) =>
      index ===
      arr.findIndex(
        (b) => String(b.betId || b._id) === String(bet.betId || bet._id)
      )
  );

  const hasCashoutAvailable = uniqueMarketBetsForCashout.length > 0;

  const marketCashoutPL = cashoutPL?.['Bookmaker'] || 0;

  const mergedCashoutValue =
    uniqueMarketBetsForCashout.reduce((sum, bet) => {
      const id = bet.betId || bet._id;
      const val = cashoutValues[id];
      return val !== undefined ? sum + val : sum;
    }, 0) + (marketCashoutPL || 0);

  const hasMergedValue = uniqueMarketBetsForCashout.some((bet) => {
    const id = bet.betId || bet._id;
    return cashoutValues[id] !== undefined;
  });

  const fetchCashoutQuotes = async () => {
    const betIds = uniqueMarketBetsForCashout
      .map((b) => b.betId || b._id)
      .filter(Boolean);

    if (betIds.length === 0) return;

    const results = await Promise.allSettled(
      betIds.map((betId) =>
        api.post('/user/cashout/quote', { betId }, { withCredentials: true })
      )
    );

    const freshValues = {};
    for (const result of results) {
      if (
        result.status === 'fulfilled' &&
        result.value?.data?.cashoutAvailable
      ) {
        freshValues[result.value.data.betId] = result.value.data.cashoutValue;
      }
    }

    if (Object.keys(freshValues).length > 0) {
      dispatch(
        updateCashoutValues(
          Object.entries(freshValues).map(([betId, cashoutValue]) => ({
            betId,
            cashoutValue,
          }))
        )
      );
    }
  };

  const handleCashOutClick = async () => {
    if (!hasCashoutAvailable || cashoutLoading) return;

    const betIds = uniqueMarketBetsForCashout
      .map((b) => b.betId || b._id)
      .filter(Boolean);

    for (const id of betIds) {
      const result = await dispatch(executeCashout(id));
      if (result.meta?.requestStatus === 'fulfilled') {
        setCashedOutBetIds((prev) => new Set(prev).add(id));
      } else {
        toast.error(
          result.payload?.message || 'Cashout failed. Please try again.'
        );
      }
    }

    setShowCashoutOptions(false);
    dispatch(clearCashoutValues());
    await dispatch(getUser());
    if (gameid) {
      await dispatch(getPendingBetAmo(gameid));
      await dispatch(getPendingBet(gameid));
    }
    setCashedOutBetIds(new Set());
  };

  // Helper function to format stake/size
  const formatStake = (size) => {
    if (!size || size === 0) return '0';
    if (size < 1000) return size.toFixed(0);
    return `${(size / 1000).toFixed(1)}k`;
  };

  // Helper function to format max value
  const formatMax = (max) => {
    if (!max || max === 0) return '0';
    if (max < 1000) return max.toString();
    return `${(max / 1000).toFixed(0)}K`;
  };

  const getBetDetails = (team) => {
    const mCashoutPL = cashoutPL?.['Bookmaker'] || 0;

    const marketBets =
      pendingBetAmounts?.filter(
        (item) =>
          item.gameType === 'Bookmaker' || item.gameType === 'Bookmaker IPL CUP'
      ) || [];

    const matchedTeamBet = marketBets.find(
      (item) => item.teamName?.toLowerCase() === team?.toLowerCase()
    );
    const otherTeamBet = marketBets[0];

    const otype = matchedTeamBet?.otype || otherTeamBet?.otype || '';
    const totalBetAmount =
      matchedTeamBet?.totalBetAmount || otherTeamBet?.totalBetAmount || '';
    const totalPrice =
      matchedTeamBet?.totalPrice || otherTeamBet?.totalPrice || '';
    const teamName = matchedTeamBet?.teamName || otherTeamBet?.teamName || '';

    if (marketBets.length === 0) {
      if (mCashoutPL) {
        return {
          isHedged: true,
          netOutcome: Math.round(mCashoutPL * 100) / 100,
          otype: '',
          totalBetAmount: '',
          totalPrice: '',
          teamName: '',
        };
      }
      return {
        isHedged: false,
        netOutcome: null,
        otype,
        totalBetAmount,
        totalPrice,
        teamName,
      };
    }

    let netOutcome = 0;
    marketBets.forEach((bet) => {
      const isBetOnThisTeam =
        bet.teamName?.toLowerCase() === team?.toLowerCase();
      const betAmt = parseFloat(bet.totalBetAmount) || 0;
      const stake = parseFloat(bet.totalPrice) || 0;

      if (bet.otype === 'back') {
        netOutcome += isBetOnThisTeam ? betAmt : -stake;
      } else {
        netOutcome += isBetOnThisTeam ? -stake : betAmt;
      }
    });

    netOutcome += mCashoutPL;

    return {
      isHedged: true,
      netOutcome: Math.round(netOutcome * 100) / 100,
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
    };
  };

  // Calculate profit/loss suggestion (simplified for Bookmaker)
  const calculateSuggestion = (
    team,
    selectedTeam,
    selectedType,
    stake,
    odds
  ) => {
    if (!stake || !odds || !selectedBet) return null;

    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);
    if (isNaN(stakeNum) || isNaN(oddsNum) || stakeNum === 0) return null;

    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(team);
    const isMatchedTeam = teamName?.toLowerCase() === team?.toLowerCase();
    const existingBet =
      (otype && totalBetAmount) || (totalPrice && teamName && isMatchedTeam);

    if (!existingBet) {
      // Bookmaker calculation: b = otype === 'lay' ? p : p * (x / 100), p = otype === 'lay' ? p * (x / 100) : p
      const p = stakeNum;
      const x = oddsNum;
      const b = selectedType === 'lay' ? p : p * (x / 100);
      const pCalc = selectedType === 'lay' ? p * (x / 100) : p;

      if (selectedType === 'back') {
        const profit = b; // For BACK: profit = stake * (odds / 100)
        return {
          value: Math.abs(profit),
          color: profit >= 0 ? 'green' : 'red',
        };
      } else {
        // For LAY: if selected team wins, you lose pCalc (stake * odds / 100)
        // The value should be negative to show loss
        const profit = -pCalc; // Negative because it's a loss if selected team wins
        return { value: Math.abs(profit), color: 'red' }; // Always red for LAY loss on selected team
      }
    }

    // Complex calculation with existing bet (same logic as PlaceBet)
    let p = stakeNum;
    let x = oddsNum;
    // Bookmaker calculation: b = otype === 'lay' ? p : p * (x / 100)
    // p = otype === 'lay' ? p * (x / 100) : p
    let b = selectedType === 'lay' ? p : p * (x / 100);
    p = selectedType === 'lay' ? p * (x / 100) : p;

    const totalBetAmt = parseFloat(totalBetAmount || 0);
    const totalPrc = parseFloat(totalPrice || 0);

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
  };

  const handleOddsClick = (team, rate, type, sid, oname) => {
    if (onBetSelect && rate && rate !== 0) {
      // Extract all teams from this BookmakerList
      const allTeams = bookmakerData.map((item) => item.team);

      onBetSelect({
        team: team,
        odds: rate.toString(),
        type: type, // 'back' or 'lay'
        oname: oname || '',
        stake: '',
        //sid: sid, // Include section id
        teams: allTeams, // Add all teams for Bookmaker
        marketName: BookmakerList?.[0]?.mname || 'Bookmaker',
        gameType: 'Bookmaker',
        maxAmount: BookmakerList?.[0]?.max || BookmakerList?.[0]?.maxb || 0,
        minAmount: BookmakerList?.[0]?.min || 0,
      });
    }
  };

  // Get min and max from API
  const minValue = BookmakerList?.[0]?.min || 0;
  const maxValue = BookmakerList?.[0]?.max || BookmakerList?.[0]?.maxb || 0;

  return (
    <div>
      <div className='text-secondary mt-1 flex items-center justify-between bg-[#2C3E50D9] p-1'>
        <span className='text-[13px] font-bold lg:text-[15px]'>Bookmaker</span>
        {hasCashoutAvailable && showCashoutOptions ? (
          <button
            type='button'
            disabled={!hasMergedValue || cashoutLoading}
            onClick={handleCashOutClick}
            className={`flex items-center gap-1 p-1 font-[400] text-white ${
              hasMergedValue && !cashoutLoading
                ? 'cursor-pointer bg-[#198754]'
                : 'cursor-not-allowed bg-[#198754] opacity-60'
            }`}
          >
            <FaCheck className='text-xs' />
            <span>
              {hasMergedValue
                ? `₹ ${mergedCashoutValue.toFixed(2)}`
                : cashoutLoading
                  ? '...'
                  : marketCashoutPL
                    ? `₹ ${marketCashoutPL}`
                    : 'Cash Out'}
            </span>
          </button>
        ) : hasCashoutAvailable ? (
          <button
            onClick={() => {
              setShowCashoutOptions(true);
              fetchCashoutQuotes();
            }}
            className='cursor-pointer bg-[#198754] p-1 font-[400] text-white'
          >
            Cashout
          </button>
        ) : (
          <button
            disabled
            className='cursor-not-allowed bg-[#198754] p-1 font-[400] text-white opacity-60'
          >
            Cashout
          </button>
        )}
      </div>
      <div className='grid grid-cols-[1fr_12%_12%_12%_12%_12%_12%] border-b border-b-[#c7c8ca] lg:grid-cols-[1fr_60px_60px_60px_60px_60px_60px]'>
        <div className='ml-2 text-[12px] font-bold text-[#097c93]'>
          Min: {minValue} Max: {formatMax(maxValue)}
        </div>
        <div></div>
        <div></div>
        <div className='flex items-center justify-center bg-[#72bbef] p-[2px] font-[16px] font-bold text-[#333]'>
          Back
        </div>
        <div className='flex items-center justify-center bg-[#faa9ba] p-[2px] font-[16px] font-bold text-[#333]'>
          Lay
        </div>
        <div></div>
        <div></div>
      </div>

      {bookmakerData.length > 0 ? (
        bookmakerData.map(({ team, odds, sid, gstatus }, teamIndex) => {
          const isSuspended = gstatus === 'SUSPENDED';
          // Organize odds by type and position (back1, back2, back3, lay1, lay2, lay3)
          // The odds are already in order: back3, back2, back1, lay1, lay2, lay3
          // We need to reverse back odds to show: back1, back2, back3
          const backOdds = odds
            .filter((odd) => odd.otype === 'back')
            .slice(0, 3);

          const layOdds = odds.filter((odd) => odd.otype === 'lay').slice(0, 3);

          return (
            <div
              key={teamIndex}
              className='grid grid-cols-[1fr_12%_12%_12%_12%_12%_12%] border-b border-b-[#c7c8ca] hover:bg-[#f7f7f7] lg:grid-cols-[1fr_60px_60px_60px_60px_60px_60px]'
            >
              {/* Team Name with suggestions */}
              <div className='ml-2 truncate text-[13px] font-bold text-[#333] lg:text-[14px]'>
                <div>{team}</div>
                {(() => {
                  const isBookmakerBet =
                    selectedBet?.gameType === 'Bookmaker' ||
                    selectedBet?.marketName === 'Bookmaker';

                  const {
                    otype,
                    totalBetAmount,
                    totalPrice,
                    teamName,
                    isHedged,
                    netOutcome,
                  } = getBetDetails(team);
                  const isMatchedTeam =
                    teamName?.toLowerCase() === team?.toLowerCase();
                  const existingBet =
                    isHedged ||
                    (otype && totalBetAmount) ||
                    (totalPrice && teamName && isMatchedTeam);

                  const isSelectedTeam =
                    selectedBet?.team?.toLowerCase() === team?.toLowerCase();

                  if (isBookmakerBet && selectedBet?.stake) {
                    let suggestionValue = null;
                    let suggestionColor = 'green';

                    if (isSelectedTeam) {
                      const suggestion = calculateSuggestion(
                        team,
                        selectedBet.team,
                        selectedBet.type,
                        selectedBet.stake,
                        selectedBet.odds
                      );
                      if (suggestion) {
                        if (
                          selectedBet.type === 'lay' &&
                          suggestion.color === 'red'
                        ) {
                          suggestionValue = -suggestion.value;
                        } else {
                          suggestionValue = suggestion.value;
                        }
                        suggestionColor = suggestion.color;
                      }
                    } else {
                      const stakeNum = parseFloat(selectedBet.stake);
                      if (!isNaN(stakeNum) && stakeNum > 0) {
                        if (selectedBet.type === 'back') {
                          suggestionValue = stakeNum;
                          suggestionColor = 'red';
                        } else {
                          suggestionValue = stakeNum;
                          suggestionColor = 'green';
                        }
                      }
                    }

                    if (existingBet) {
                      let betColor;
                      let displayValue;

                      if (isHedged && netOutcome !== null) {
                        displayValue = netOutcome;
                        betColor = netOutcome >= 0 ? 'green' : 'red';
                      } else {
                        betColor =
                          otype === 'lay'
                            ? isMatchedTeam
                              ? 'red'
                              : 'green'
                            : otype === 'back'
                              ? isMatchedTeam
                                ? 'green'
                                : 'red'
                              : 'green';

                        displayValue = (() => {
                          if (otype === 'lay') {
                            return isMatchedTeam ? totalPrice : totalBetAmount;
                          } else if (otype === 'back') {
                            return isMatchedTeam ? totalBetAmount : totalPrice;
                          }
                          return '';
                        })();
                      }

                      return (
                        <div className='flex gap-1' style={{ color: betColor }}>
                          {displayValue !== '' &&
                            displayValue !== null &&
                            displayValue !== undefined && (
                              <span className='flex items-center gap-0.5 text-[11px]'>
                                <FaArrowRight />
                                {parseFloat(displayValue).toFixed(2)}
                              </span>
                            )}
                          {suggestionValue !== null && (
                            <span
                              style={{ color: suggestionColor }}
                              className='text-[11px]'
                            >
                              ({suggestionValue < 0 ? '-' : ''}
                              {Math.abs(suggestionValue).toFixed(2)})
                            </span>
                          )}
                        </div>
                      );
                    } else {
                      if (suggestionValue !== null) {
                        return (
                          <span
                            style={{ color: suggestionColor }}
                            className='text-[11px]'
                          >
                            ({suggestionValue < 0 ? '-' : ''}
                            {Math.abs(suggestionValue).toFixed(2)})
                          </span>
                        );
                      }
                    }
                  } else if (existingBet) {
                    let betColor;
                    let displayValue;

                    if (isHedged && netOutcome !== null) {
                      displayValue = netOutcome;
                      betColor = netOutcome >= 0 ? 'green' : 'red';
                    } else {
                      betColor =
                        otype === 'lay'
                          ? isMatchedTeam
                            ? 'red'
                            : 'green'
                          : otype === 'back'
                            ? isMatchedTeam
                              ? 'green'
                              : 'red'
                            : 'green';

                      displayValue = (() => {
                        if (otype === 'lay') {
                          return isMatchedTeam ? totalPrice : totalBetAmount;
                        } else if (otype === 'back') {
                          return isMatchedTeam ? totalBetAmount : totalPrice;
                        }
                        return '';
                      })();
                    }

                    return (
                      <div className='flex gap-1' style={{ color: betColor }}>
                        {displayValue !== '' &&
                          displayValue !== null &&
                          displayValue !== undefined && (
                            <span className='flex items-center gap-0.5 text-[11px]'>
                              <FaArrowRight />
                              {parseFloat(displayValue).toFixed(2)}
                            </span>
                          )}
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>

              {isSuspended ? (
                <div className='col-span-6 flex min-h-[30px] items-center justify-center bg-[#4b4b4b]'>
                  <span className='font-bold tracking-wide text-red-600'>
                    SUSPENDED
                  </span>
                </div>
              ) : (
                <>
                  {/* BACK - Fill 3 slots */}
                  {[0, 1, 2].map((i) => {
                    const backItem = backOdds[i];
                    const hasOdds = backItem && backItem.odds > 0;
                    return (
                      <div
                        key={`back-${i}`}
                        className={`${backBg[i]} flex min-h-[30px] max-w-[100%] flex-col items-center justify-center ${hasOdds ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                        onClick={() =>
                          hasOdds &&
                          handleOddsClick(
                            team,
                            backItem.odds,
                            'back',
                            sid,
                            backItem?.oname
                          )
                        }
                      >
                        {hasOdds ? (
                          <>
                            <span className='text-[15px] leading-4 font-bold text-[#333] lg:text-[16px]'>
                              {backItem.odds}
                            </span>
                            <span className='text-[11px] leading-4 font-[100] text-[#333] lg:text-[12px]'>
                              {formatStake(backItem.size)}
                            </span>
                          </>
                        ) : (
                          <span className='text-[16px] leading-4 font-bold text-[#333]'>
                            -
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* LAY - Fill 3 slots */}
                  {[0, 1, 2].map((i) => {
                    const layItem = layOdds[i];
                    const hasOdds = layItem && layItem.odds > 0;
                    return (
                      <div
                        key={`lay-${i}`}
                        className={`${layBg[i]} flex min-h-[30px] max-w-[100%] flex-col items-center justify-center ${hasOdds ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                        onClick={() =>
                          hasOdds &&
                          handleOddsClick(
                            team,
                            layItem.odds,
                            'lay',
                            sid,
                            layItem?.oname
                          )
                        }
                      >
                        {hasOdds ? (
                          <>
                            <span className='text-[15px] leading-4 font-bold text-[#333] lg:text-[16px]'>
                              {layItem.odds}
                            </span>
                            <span className='text-[11px] leading-4 font-[100] text-[#333] lg:text-[12px]'>
                              {formatStake(layItem.size)}
                            </span>
                          </>
                        ) : (
                          <span className='text-[16px] leading-4 font-bold text-[#333]'>
                            -
                          </span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })
      ) : (
        <div className='py-4 text-center text-gray-500'>
          No bookmaker data available
        </div>
      )}
    </div>
  );
}

export default Bookmaker;

// import React from "react";
// import { FaArrowRight } from "react-icons/fa";

// function Bookmaker({ onBetSelect, BookmakerList, pendingBetAmounts, selectedBet }) {
//   const backBg = ["bg-[#72bbef7f]", "bg-[#72bbefbf]", "bg-[#72bbef]"];
//   const layBg = ["bg-[#faa9ba]", "bg-[#faa9babf]", "bg-[#faa9ba7f]"];

//   const bookmakerData = BookmakerList?.[0]?.section?.length
//     ? BookmakerList[0].section.map((sec) => ({
//         team: sec.nat,
//         sid: sec.sid,
//         odds: sec.odds || [],
//         max: sec.max,
//         min: sec.min,
//         gstatus: sec.gstatus,
//         mname: BookmakerList[0].mname || "Bookmaker",
//       }))
//     : [];

//   const formatStake = (size) => {
//     if (!size || size === 0) return "0";
//     if (size < 1000) return size.toFixed(0);
//     return `${(size / 1000).toFixed(1)}k`;
//   };

//   const formatMax = (max) => {
//     if (!max || max === 0) return "0";
//     if (max < 1000) return max.toString();
//     return `${(max / 1000).toFixed(0)}K`;
//   };

//   const handleOddsClick = (team, rate, type, sid, gstatus) => {
//     if (gstatus === "SUSPENDED") return;

//     if (onBetSelect && rate && rate !== 0) {
//       const allTeams = bookmakerData.map((item) => item.team);

//       onBetSelect({
//         team,
//         odds: rate.toString(),
//         type,
//         stake: "",
//         sid,
//         teams: allTeams,
//         marketName: "Bookmaker",
//         gameType: "Bookmaker",
//         maxAmount: BookmakerList?.[0]?.max || 0,
//         minAmount: BookmakerList?.[0]?.min || 0,
//       });
//     }
//   };

//   const minValue = BookmakerList?.[0]?.min || 0;
//   const maxValue = BookmakerList?.[0]?.max || 0;

//   return (
//     <div>
//       {/* HEADER */}
//       <div className="bg-[#2C3E50D9] flex justify-between items-center p-1 mt-1 text-secondary">
//         <span className="text-[13px] lg:text-[15px] font-bold">Bookmaker</span>
//         <button className="bg-[#198754] text-white p-1">Cashout</button>
//       </div>

//       {/* COLUMN HEADER */}
//       <div className="grid grid-cols-[1fr_12%_12%_12%_12%_12%_12%] border-b">
//         <div className="text-[#097c93] text-[12px] font-bold ml-2">
//           Min: {minValue} Max: {formatMax(maxValue)}
//         </div>
//         <div></div><div></div>
//         <div className="bg-[#72bbef] text-center font-bold">Back</div>
//         <div className="bg-[#faa9ba] text-center font-bold">Lay</div>
//         <div></div><div></div>
//       </div>

//       {/* DATA ROWS */}
//       {bookmakerData.length > 0 ? (
//         bookmakerData.map(({ team, odds, sid, gstatus }, idx) => {
//           const isSuspended = gstatus === "SUSPENDED";

//           const backOdds = odds.filter(o => o.otype === "back").slice(0, 3);
//           const layOdds = odds.filter(o => o.otype === "lay").slice(0, 3);

//           return (
//             <div
//               key={idx}
//               className="grid grid-cols-[1fr_12%_12%_12%_12%_12%_12%] border-b hover:bg-[#f7f7f7]"
//             >
//               {/* TEAM */}
//               <div className="ml-2 font-bold text-[13px] truncate">
//                 {team}
//               </div>

//               {/* SUSPENDED VIEW */}
//               {isSuspended ? (
//                 <div className="col-span-6 flex justify-center items-center bg-[#4b4b4b] min-h-[30px]">
//                   <span className="text-red-600 font-bold tracking-wide">
//                     SUSPENDED
//                   </span>
//                 </div>
//               ) : (
//                 <>
//                   {/* BACK */}
//                   {[0, 1, 2].map((i) => {
//                     const item = backOdds[i];
//                     const hasOdds = item && item.odds > 0;
//                     return (
//                       <div
//                         key={`back-${i}`}
//                         className={`${backBg[i]} flex flex-col items-center justify-center min-h-[30px] ${
//                           hasOdds ? "cursor-pointer hover:opacity-80" : ""
//                         }`}
//                         onClick={() =>
//                           hasOdds &&
//                           handleOddsClick(team, item.odds, "back", sid, gstatus)
//                         }
//                       >
//                         {hasOdds ? (
//                           <>
//                             <span className="font-bold">{item.odds}</span>
//                             <span className="text-[11px]">
//                               {formatStake(item.size)}
//                             </span>
//                           </>
//                         ) : (
//                           <span>-</span>
//                         )}
//                       </div>
//                     );
//                   })}

//                   {/* LAY */}
//                   {[0, 1, 2].map((i) => {
//                     const item = layOdds[i];
//                     const hasOdds = item && item.odds > 0;
//                     return (
//                       <div
//                         key={`lay-${i}`}
//                         className={`${layBg[i]} flex flex-col items-center justify-center min-h-[30px] ${
//                           hasOdds ? "cursor-pointer hover:opacity-80" : ""
//                         }`}
//                         onClick={() =>
//                           hasOdds &&
//                           handleOddsClick(team, item.odds, "lay", sid, gstatus)
//                         }
//                       >
//                         {hasOdds ? (
//                           <>
//                             <span className="font-bold">{item.odds}</span>
//                             <span className="text-[11px]">
//                               {formatStake(item.size)}
//                             </span>
//                           </>
//                         ) : (
//                           <span>-</span>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </>
//               )}
//             </div>
//           );
//         })
//       ) : (
//         <div className="text-center py-4 text-gray-500">
//           No bookmaker data available
//         </div>
//       )}
//     </div>
//   );
// }

// export default Bookmaker;
