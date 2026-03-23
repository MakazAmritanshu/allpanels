import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import { FaArrowRight } from 'react-icons/fa';
const SoccerOdds = ({ matchOddsList, gameid }) => {
  const dispatch = useDispatch();
  const { pendingBet } = useSelector((state) => state.market);

  const oddsData =
    Array.isArray(matchOddsList) &&
    matchOddsList.length > 0 &&
    matchOddsList[0].section
      ? matchOddsList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          mname: 'Match Odds', // Access from first item
          status: matchOddsList[0].status, // Access from first item
        }))
      : [];

  // Helper function
  const getBetDetails = (pendingBet, matchData, team) => {
    const marketBets =
      pendingBet?.filter((item) => item.gameType === matchData?.mname) || [];

    if (marketBets.length === 0) {
      return {
        isHedged: false,
        netOutcome: null,
        displayAmount: null,
        otype: '',
        totalBetAmount: '',
        totalPrice: '',
        teamName: '',
        isMatchedTeam: false,
      };
    }

    const matchedTeamBet = marketBets.find(
      (item) => item.teamName?.toLowerCase() === team?.toLowerCase()
    );

    let netOutcome = 0;
    marketBets.forEach((bet) => {
      const isBetOnThisTeam =
        bet.teamName?.toLowerCase() === team?.toLowerCase();
      const betAmount = parseFloat(bet.totalBetAmount) || 0;
      const stake = parseFloat(bet.totalPrice) || 0;

      if (bet.otype === 'back') {
        if (isBetOnThisTeam) {
          netOutcome += betAmount;
        } else {
          netOutcome -= stake;
        }
      } else {
        if (isBetOnThisTeam) {
          netOutcome -= stake;
        } else {
          netOutcome += betAmount;
        }
      }
    });

    return {
      isHedged: true,
      netOutcome: Math.round(netOutcome * 100) / 100,
      otype: matchedTeamBet?.otype || marketBets[0]?.otype || '',
      totalBetAmount:
        matchedTeamBet?.totalBetAmount || marketBets[0]?.totalBetAmount || '',
      totalPrice: matchedTeamBet?.totalPrice || marketBets[0]?.totalPrice || '',
      teamName: matchedTeamBet?.teamName || marketBets[0]?.teamName || '',
      isMatchedTeam: !!matchedTeamBet,
    };
  };

  // Inside your React functional component (e.g., in a file like MyComponent.jsx)
  function MyComponent({ team, matchData, pendingBet }) {
    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(
      pendingBet,
      matchData,
      team
    );

    const betDetails = getBetDetails(pendingBet, matchData, team);
    const {
      isHedged,
      netOutcome,
      displayAmount,
      isMatchedTeam: isMatchedFromDetails,
    } = betDetails;

    const isMatchedTeam =
      isMatchedFromDetails !== undefined
        ? isMatchedFromDetails
        : teamName?.toLowerCase() === team?.toLowerCase();

    const existingBet =
      (otype && totalBetAmount) ||
      (totalPrice && teamName) ||
      isHedged ||
      displayAmount !== null
        ? true
        : false;

    // Determine the actual value to display
    let actualDisplayValue;
    if (isHedged) {
      actualDisplayValue = netOutcome;
    } else if (displayAmount !== null && displayAmount !== undefined) {
      actualDisplayValue = displayAmount;
    } else if (otype === 'lay') {
      actualDisplayValue = isMatchedTeam ? totalPrice : totalBetAmount;
    } else if (otype === 'back') {
      actualDisplayValue = isMatchedTeam ? totalBetAmount : totalPrice;
    } else {
      actualDisplayValue = null;
    }

    // Color based on actual value - simple logic: negative = red, positive/zero = green
    const numericValue = parseFloat(actualDisplayValue) || 0;
    const betColor =
      existingBet && actualDisplayValue !== null
        ? numericValue >= 0
          ? 'green'
          : 'red'
        : 'green';

    const displayValue = (() => {
      if (!existingBet || actualDisplayValue === null) {
        return null;
      }

      return (
        <span className='flex items-center gap-0.5'>
          <FaArrowRight />
          {actualDisplayValue}
        </span>
      );
    })();

    return (
      <div className='col-span-5 p-1 pl-4 text-left text-sm font-bold md:col-span-3 md:text-[11px]'>
        <div>
          <p>{team}</p>
          <p style={{ color: betColor }}>{displayValue}</p>
        </div>
      </div>
    );
  }

  const formatToK = (num) => {
    if (!num) return '0';
    const n = Number(num);
    if (n < 1000) return n.toFixed(2);
    return (n / 1000).toFixed(2) + 'K';
  };

  return (
    <div>
      <div className='mx-auto text-[13px]'>
        <div>
          {oddsData.length > 0 && (
            <div>
              <div className='mx-auto bg-gray-200 text-[13px]'>
                <div className='flex items-center justify-between rounded-t-md bg-white'>
                  <div className='bg-blue flex gap-3 rounded-tr-3xl p-2 px-4 font-bold text-white'>
                    <span>{oddsData[0]?.mname}</span>

                    <span className='mt-1 text-lg font-black'>
                      <HiOutlineExclamationCircle />
                    </span>
                  </div>
                  <div className='font-bold'>Matched € 204.7K</div>
                </div>

                {oddsData[0]?.status === 'SUSPENDED' ? (
                  <div className='relative mx-auto border-2 border-red-500'>
                    <div className='justify-centerz-10 absolute flex h-full w-full items-center bg-[#e1e1e17e]'>
                      <p className='absolute left-1/2 -translate-x-1/2 transform text-3xl font-bold text-red-700'>
                        SUSPENDED
                      </p>
                    </div>

                    <div className='grid grid-cols-9 border-b border-gray-300 bg-white text-center'>
                      <div className='col-span-5 md:col-span-5'></div>
                      <div className='col-span-2 bg-[#72bbef] p-1 font-bold text-slate-800 md:col-span-1 md:rounded-t-2xl'>
                        Back
                      </div>
                      <div className='col-span-2 bg-[#faa9ba] p-1 font-bold text-slate-800 md:col-span-1 md:rounded-t-2xl'>
                        Lay
                      </div>
                      <div className='col-span-2 hidden rounded-lg p-1 text-[11px] font-semibold md:block'>
                        <div className='rounded-md bg-[#bed5d8] p-0.5'>
                          <span className='text-[#315195]'>Min/Max </span>
                          100-100000
                        </div>
                      </div>
                    </div>
                    {oddsData.map(({ team, odds }, index) => (
                      <div key={index}>
                        <div className='grid cursor-pointer grid-cols-9 border-b border-gray-300 bg-white text-center text-[10px] font-semibold opacity-30 hover:bg-gray-200'>
                          <div className='col-span-5 p-1 pl-4 text-left text-sm font-bold md:col-span-3 md:text-[11px]'>
                            {team}
                          </div>
                          {odds.map((odd, i) => (
                            <div
                              key={i}
                              className={`col-span-2 cursor-pointer p-1 md:col-span-1 ${
                                i === 0
                                  ? 'hidden bg-sky-100 md:block'
                                  : i === 1
                                    ? 'hidden bg-sky-200 md:block'
                                    : i === 2
                                      ? 'bg-[#72bbef] '
                                      : i === 3
                                        ? 'bg-[#faa9ba]'
                                        : i === 4
                                          ? 'hidden bg-pink-200 md:block'
                                          : 'hidden bg-pink-100 md:block'
                              }`}
                            >
                              <div>{odd?.odds}</div>
                              <div className='text-gray-800'>{odd?.size}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className='grid grid-cols-9 border-b border-gray-300 bg-white text-center'>
                      <div className='col-span-5 md:col-span-5'></div>
                      <div className='col-span-2 bg-[#72bbef] p-1 font-bold text-slate-800 md:col-span-1 md:rounded-t-2xl'>
                        Back
                      </div>
                      <div className='col-span-2 bg-[#faa9ba] p-1 font-bold text-slate-800 md:col-span-1 md:rounded-t-2xl'>
                        Lay
                      </div>
                      <div className='col-span-2 hidden rounded-lg p-1 text-[11px] font-semibold md:block'>
                        <div className='rounded-md bg-[#bed5d8] p-0.5'>
                          <span className='text-[#315195]'>Min/Max </span>
                          {matchOddsList[0]?.min}-{matchOddsList[0]?.maxb}
                        </div>
                      </div>
                    </div>
                    {oddsData.map(({ team, odds }, index) => (
                      <div key={index}>
                        <div className='grid cursor-pointer grid-cols-9 border-b border-gray-300 bg-white text-center text-[10px] font-semibold hover:bg-gray-200'>
                          <MyComponent
                            key={team}
                            team={team}
                            matchData={oddsData[0]}
                            pendingBet={pendingBet}
                            index={index}
                          />
                          {odds.map((odd, i) => (
                            <div
                              key={i}
                              className={`col-span-2 cursor-pointer p-1 md:col-span-1 ${
                                i === 0
                                  ? 'hidden bg-sky-100 md:block'
                                  : i === 1
                                    ? 'hidden bg-sky-200 md:block'
                                    : i === 2
                                      ? 'bg-[#72bbef] '
                                      : i === 3
                                        ? 'bg-[#faa9ba]'
                                        : i === 4
                                          ? 'hidden bg-pink-200 md:block'
                                          : 'hidden bg-pink-100 md:block'
                              }`}
                            >
                              <div>
                                <div className='font-bold'>{odd?.odds}</div>
                                <div className='text-gray-800'>
                                  {formatToK(odd?.size)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoccerOdds;
