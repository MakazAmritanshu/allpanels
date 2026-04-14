import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';

function OverUnder_05({
  onBetSelect,
  matcUnder5List,
  pendingBetAmounts,
  selectedBet,
}) {
  const backBg = ['bg-[#72bbef7f]', 'bg-[#72bbefbf]', 'bg-[#72bbef]'];
  const layBg = ['bg-[#faa9ba]', 'bg-[#faa9babf]', 'bg-[#faa9ba7f]'];
  const [showCashoutOptions, setShowCashoutOptions] = useState(false);
  console.log('matcUnder5List from OverUnder_05', matcUnder5List);
  // Transform API data similar to MatchOdds component
  const oddsData = matcUnder5List?.[0]?.section?.length
    ? matcUnder5List[0].section.map((sec) => ({
        team: sec.nat,
        sid: sec.sid,
        odds: sec.odds,
        max: sec.max,
        min: sec.min,
        mname: matcUnder5List[0].mname,
        gstatus: sec.gstatus,
        status: matcUnder5List[0].status,
      }))
    : [];

  // Helper function to format stake/size
  const formatStake = (size) => {
    if (!size || size === 0) return '0';
    if (size < 1000) return size.toFixed(2);
    return `${(size / 1000).toFixed(1)}k`;
  };

  // Get bet details from pending bets
  const getBetDetails = (team) => {
    const matchedTeamBet = pendingBetAmounts?.find(
      (item) =>
        item.gameType === 'OVER_UNDER_05' &&
        item.teamName?.toLowerCase() === team?.toLowerCase()
    );

    const otherTeamBet = pendingBetAmounts?.find(
      (item) => item.gameType === 'OVER_UNDER_05'
    );

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

    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(team);
    const isMatchedTeam = teamName?.toLowerCase() === team?.toLowerCase();
    const existingBet =
      (otype && totalBetAmount) || (totalPrice && teamName && isMatchedTeam);

    if (!existingBet) {
      const profit =
        selectedType === 'back'
          ? stakeNum * (oddsNum - 1)
          : stakeNum * (1 - oddsNum);
      return { value: Math.abs(profit), color: profit >= 0 ? 'green' : 'red' };
    }

    let p = stakeNum;
    let x = oddsNum;
    let b = selectedType === 'lay' ? p : p * (x - 1);
    p = selectedType === 'lay' ? p * (x - 1) : p;

    const totalBetAmt = parseFloat(totalBetAmount || 0);
    const totalPrc = parseFloat(totalPrice || 0);

    if (selectedTeam?.toLowerCase() === teamName?.toLowerCase()) {
      if (selectedType === otype) {
        b = b + totalBetAmt;
        p = p + totalPrc;
        const calValue = selectedType === 'back' ? b : p;
        return {
          value: Math.abs(calValue),
          color: calValue >= 0 ? 'green' : 'red',
        };
      } else {
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
      // Extract all teams/options from OverUnder (e.g., "Over 0.5 Goals", "Under 0.5 Goals")
      const allTeams = oddsData.map((item) => item.team);

      onBetSelect({
        team: team,
        odds: rate.toString(),
        type: type, // 'back' or 'lay'
        oname: oname || '',
        stake: '',
        //sid: sid, // Include section id
        teams: allTeams, // Add all options for OverUnder
        marketName: 'OVER_UNDER_05',
        gameType: 'OVER_UNDER_05',
        maxAmount: matcUnder5List?.[0]?.max || matcUnder5List?.[0]?.maxb || 0,
        minAmount: matcUnder5List?.[0]?.min || 0,
      });
    }
  };

  // Get max value from API
  const maxValue = matcUnder5List?.[0]?.max || matcUnder5List?.[0]?.maxb || 0;
  return (
    <div>
      <div className='text-secondary mt-1 flex items-center justify-between bg-[#2C3E50D9] p-1'>
        <span className='text-[13px] font-bold lg:text-[15px]'>
          OVER_UNDER_05
        </span>
        <button
          disabled={!showCashoutOptions}
          className={`p-1 font-[400] text-white ${
            showCashoutOptions
              ? 'cursor-pointer bg-[#198754]'
              : ' bg-[#198754] opacity-60'
          }`}
        >
          Cashout
        </button>
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
        oddsData.map(({ team, odds, sid, gstatus }, teamIndex) => {
          const isSuspended = gstatus === 'SUSPENDED';
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
                  // Check if selectedBet belongs to OverUnder_05 market
                  const isOverUnderBet =
                    selectedBet?.gameType === 'OVER_UNDER_05' ||
                    selectedBet?.marketName === 'OVER_UNDER_05';

                  const { otype, totalBetAmount, totalPrice, teamName } =
                    getBetDetails(team);
                  const isMatchedTeam =
                    teamName?.toLowerCase() === team?.toLowerCase();
                  const existingBet =
                    (otype && totalBetAmount) ||
                    (totalPrice && teamName && isMatchedTeam);

                  // Check if this team is the selected team
                  const isSelectedTeam =
                    selectedBet?.team?.toLowerCase() === team?.toLowerCase();

                  // Show suggestions for all teams when a bet is selected in this market
                  if (isOverUnderBet && selectedBet?.stake) {
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

                    // If there's an existing bet, combine with suggestion
                    if (existingBet) {
                      let betColor =
                        otype === 'lay'
                          ? isMatchedTeam
                            ? 'red'
                            : 'green'
                          : otype === 'back'
                            ? isMatchedTeam
                              ? 'green'
                              : 'red'
                            : 'green';

                      const displayValue = (() => {
                        if (otype === 'lay') {
                          return isMatchedTeam ? totalPrice : totalBetAmount;
                        } else if (otype === 'back') {
                          return isMatchedTeam ? totalBetAmount : totalPrice;
                        }
                        return '';
                      })();

                      return (
                        <div className='flex gap-1' style={{ color: betColor }}>
                          {displayValue && (
                            <span className='flex items-center gap-0.5 text-[11px]'>
                              <FaArrowRight />
                              {displayValue.toFixed(2)}
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
                    // Show existing bet only (no selected bet in this market)
                    let betColor =
                      otype === 'lay'
                        ? isMatchedTeam
                          ? 'red'
                          : 'green'
                        : otype === 'back'
                          ? isMatchedTeam
                            ? 'green'
                            : 'red'
                          : 'green';

                    const displayValue = (() => {
                      if (otype === 'lay') {
                        return isMatchedTeam ? totalPrice : totalBetAmount;
                      } else if (otype === 'back') {
                        return isMatchedTeam ? totalBetAmount : totalPrice;
                      }
                      return '';
                    })();

                    return (
                      <div className='flex gap-1' style={{ color: betColor }}>
                        {displayValue && (
                          <span className='flex items-center gap-0.5 text-[11px]'>
                            <FaArrowRight />
                            {displayValue.toFixed(2)}
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
                </>
              )}
            </div>
          );
        })
      ) : (
        <div className='py-4 text-center text-gray-500'>No data available</div>
      )}
    </div>
  );
}

export default OverUnder_05;
