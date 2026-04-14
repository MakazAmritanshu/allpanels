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

function MatchOdds({
  onBetSelect,
  matchOddsList,
  setitem,
  pendingBetAmounts,
  selectedBet,
  gameid,
}) {
  const dispatch = useDispatch();
  const { eventName, cashoutValues, cashoutLoading, cashoutPL } = useSelector(
    (state) => state.bet
  );

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

  const backBg = ['bg-[#72bbef7f]', 'bg-[#72bbefbf]', 'bg-[#72bbef]'];
  const layBg = ['bg-[#faa9ba]', 'bg-[#faa9babf]', 'bg-[#faa9ba7f]'];

  // Transform API data similar to MatchOdd component
  const oddsData = matchOddsList?.[0]?.section?.length
    ? matchOddsList[0].section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds,
        max: sec.max,
        min: sec.min,
        mname:
          matchOddsList[0].mname === 'MATCH_ODDS' ? 'Match Odds' : 'Winner',
        status: matchOddsList[0].status,
      }))
    : [];

  const CASHOUT_GAME_TYPES = ['Match Odds', 'MATCH_ODDS'];

  const marketBetsForCashout =
    Array.isArray(eventName) && oddsData?.[0]?.mname && gameid
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

  const marketCashoutPL = cashoutPL?.[oddsData?.[0]?.mname] || 0;

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
    if (size < 1000) return size.toFixed(2);
    return `${(size / 1000).toFixed(1)}k`;
  };

  const getBetDetails = (team, marketName) => {
    const mname = marketName === 'MATCH_ODDS' ? 'Match Odds' : marketName;
    const mCashoutPL = cashoutPL?.[mname] || 0;

    const marketBets =
      pendingBetAmounts?.filter(
        (item) => item.gameType === 'Match Odds' || item.gameType === marketName
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

  // Calculate profit/loss suggestion
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

    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(
      team,
      matchOddsList?.[0]?.mname
    );
    const isMatchedTeam = teamName?.toLowerCase() === team?.toLowerCase();
    const existingBet =
      (otype && totalBetAmount) || (totalPrice && teamName && isMatchedTeam);

    if (!existingBet) {
      // No existing bet - simple calculation
      const profit =
        selectedType === 'back'
          ? stakeNum * (oddsNum - 1)
          : stakeNum * (1 - oddsNum);
      return { value: Math.abs(profit), color: profit >= 0 ? 'green' : 'red' };
    }

    // Complex calculation with existing bet (simplified version)
    let p = stakeNum;
    let x = oddsNum;
    let b = selectedType === 'lay' ? p : p * (x - 1);
    p = selectedType === 'lay' ? p * (x - 1) : p;

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

  const handleOddsClick = (team, rate, type, sid, oname) => {
    if (onBetSelect && rate) {
      // Extract all teams from this matchOddsList
      const allTeams = oddsData.map((item) => item.team);

      const marketName = matchOddsList?.[0]?.mname || 'MATCH_ODDS';
      const gameType =
        marketName === 'MATCH_ODDS' || marketName === 'TOURNAMENT_WINNER'
          ? 'Match Odds'
          : 'Winner';

      onBetSelect({
        team: team,
        odds: rate.toString(),
        type: type, // 'back' or 'lay'
        oname: oname || '',
        stake: '',
        //sid: sid, // Include section id
        teams: allTeams, // Add all teams for MatchOdds
        marketName: marketName,
        gameType: gameType,
        maxAmount: matchOddsList?.[0]?.max || matchOddsList?.[0]?.maxb || 0,
        minAmount: matchOddsList?.[0]?.min || 0,
      });
    }
  };

  // Get max value from API
  const maxValue = matchOddsList?.[0]?.max || matchOddsList?.[0]?.maxb || 0;

  return (
    <div>
      <div className='text-secondary mt-1 flex items-center justify-between bg-[#2C3E50D9] p-1'>
        <span className='text-[13px] font-bold lg:text-[15px]'>MATCH_ODDS</span>
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
          Max:{maxValue}
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

      {oddsData.length > 0 ? (
        oddsData.map(({ team, odds, sid }, teamIndex) => {
          // Separate back and lay odds
          const backOdds = odds
            .filter((odd) => odd.otype === 'back' && odd.odds > 0)
            .slice(0, 3); // Take only first 3

          const layOdds = odds
            .filter((odd) => odd.otype === 'lay' && odd.odds > 0)
            .slice(0, 3); // Take only first 3

          return (
            <div
              key={teamIndex}
              className='grid grid-cols-[1fr_12%_12%_12%_12%_12%_12%] border-b border-b-[#c7c8ca] hover:bg-[#f7f7f7] lg:grid-cols-[1fr_60px_60px_60px_60px_60px_60px]'
            >
              {/* Team with suggestions */}
              <div className='ml-2 truncate text-[13px] font-bold text-[#333] lg:text-[14px]'>
                <div>{team}</div>
                {(() => {
                  // Check if selectedBet belongs to Match Odds market
                  const isMatchOddsBet =
                    selectedBet?.gameType === 'Match Odds' ||
                    selectedBet?.gameType === 'Winner' ||
                    selectedBet?.marketName === 'MATCH_ODDS' ||
                    selectedBet?.marketName === 'TOURNAMENT_WINNER';

                  const {
                    otype,
                    totalBetAmount,
                    totalPrice,
                    teamName,
                    isHedged,
                    netOutcome,
                  } = getBetDetails(team, matchOddsList?.[0]?.mname);
                  const isMatchedTeam =
                    teamName?.toLowerCase() === team?.toLowerCase();
                  const existingBet =
                    isHedged ||
                    (otype && totalBetAmount) ||
                    (totalPrice && teamName && isMatchedTeam);

                  // Check if this team is the selected team
                  const isSelectedTeam =
                    selectedBet?.team?.toLowerCase() === team?.toLowerCase();

                  // Show suggestions for all teams when a bet is selected in this market
                  if (isMatchOddsBet && selectedBet?.stake) {
                    let suggestionValue = null;
                    let suggestionColor = 'green';

                    if (isSelectedTeam) {
                      // For selected team: calculate profit/loss
                      const suggestion = calculateSuggestion(
                        team,
                        selectedBet.team,
                        selectedBet.type,
                        selectedBet.stake,
                        selectedBet.odds
                      );
                      if (suggestion) {
                        suggestionValue = suggestion.value;
                        suggestionColor = suggestion.color;
                      }
                    } else {
                      // For other teams: depends on bet type
                      const stakeNum = parseFloat(selectedBet.stake);
                      if (!isNaN(stakeNum) && stakeNum > 0) {
                        if (selectedBet.type === 'back') {
                          // BACK bet: if other team wins, you lose your stake
                          suggestionValue = stakeNum;
                          suggestionColor = 'red';
                        } else {
                          // LAY bet: if other team wins (selected team loses), you profit the stake
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
                              ({suggestionValue.toFixed(2)})
                            </span>
                          )}
                        </div>
                      );
                    } else {
                      // No existing bet, just show suggestion
                      if (suggestionValue !== null) {
                        return (
                          <span
                            style={{ color: suggestionColor }}
                            className='text-[11px]'
                          >
                            ({suggestionValue.toFixed(2)})
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

              {/* BACK - Fill 3 slots */}
              {[0, 1, 2].map((i) => {
                const backItem = backOdds[i];
                const formattedOdds = backItem ? backItem.odds : null;
                return (
                  <div
                    key={`back-${i}`}
                    className={`${backBg[i]} flex min-h-[30px] max-w-[100%] flex-col items-center justify-center ${formattedOdds ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                    onClick={() =>
                      formattedOdds &&
                      handleOddsClick(
                        team,
                        formattedOdds,
                        'back',
                        sid,
                        backItem?.oname
                      )
                    }
                  >
                    {formattedOdds ? (
                      <>
                        <span className='text-[15px] leading-4 font-bold text-[#333] lg:text-[16px]'>
                          {formattedOdds}
                        </span>
                        <span className='text-[11px] leading-4 font-[100] text-[#333] lg:text-[12px]'>
                          {formatStake(backItem.size)}
                        </span>
                      </>
                    ) : (
                      <span className='text-[15px] leading-4 font-bold text-[#333] lg:text-[16px]'>
                        -
                      </span>
                    )}
                  </div>
                );
              })}

              {/* LAY - Fill 3 slots */}
              {[0, 1, 2].map((i) => {
                const layItem = layOdds[i];
                const formattedOdds = layItem ? layItem.odds : null;
                return (
                  <div
                    key={`lay-${i}`}
                    className={`${layBg[i]} flex min-h-[30px] max-w-[100%] flex-col items-center justify-center ${formattedOdds ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                    onClick={() =>
                      formattedOdds &&
                      handleOddsClick(
                        team,
                        formattedOdds,
                        'lay',
                        sid,
                        layItem?.oname
                      )
                    }
                  >
                    {formattedOdds ? (
                      <>
                        <span className='text-[15px] leading-4 font-bold text-[#333] lg:text-[16px]'>
                          {formattedOdds}
                        </span>
                        <span className='text-[11px] leading-4 font-[100] text-[#333] lg:text-[12px]'>
                          {formatStake(layItem.size)}
                        </span>
                      </>
                    ) : (
                      <span className='text-[15px] leading-4 font-bold text-[#333] lg:text-[16px]'>
                        -
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })
      ) : (
        <div className='py-4 text-center text-gray-500'>
          No match odds available
        </div>
      )}
    </div>
  );
}

export default MatchOdds;
