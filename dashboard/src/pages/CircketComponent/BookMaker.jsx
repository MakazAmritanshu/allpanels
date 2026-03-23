import React from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import { FaArrowRight } from 'react-icons/fa';

const BookMaker = ({ BookmakerList }) => {
  const { pendingBet } = useSelector((state) => state.market);

  // console.log("BookmakerList", BookmakerList);
  const bookmakerData =
    Array.isArray(BookmakerList) &&
    BookmakerList.length > 0 &&
    BookmakerList[0].section
      ? BookmakerList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: 'Bookmaker',
          status: sec.gstatus,
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
    const betDetails = getBetDetails(pendingBet, matchData, team);
    const {
      isHedged,
      netOutcome,
      displayAmount,
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
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
          <p style={{ color: betColor }}>{displayValue || '0.00'}</p>
        </div>
      </div>
    );
  }
  // Inside your React functional component (e.g., in a file like MyComponent.jsx)
  const formatToK = (num) => {
    if (!num || num < 1000) return num;
    const n = Number(num);
    return `${n / 1000}k`;
  };

  // console.log("pendingBet1111", pendingBet);
  return (
    <div>
      {/* {loading ? (
        <div className="text-center py-4">
          <Spinner2 />
        </div>) : ("")} */}
      <div className='mt-2'>
        {bookmakerData.length > 0 && (
          <div>
            <div className='mx-auto bg-gray-200 text-[13px]'>
              <div className='flex items-center justify-between rounded-t-md bg-white'>
                <div className='bg-blue flex gap-3 rounded-tr-3xl p-2 px-4 font-bold text-white'>
                  <span>{bookmakerData[0]?.mname}</span>

                  <span className='mt-1 text-lg font-black'>
                    <HiOutlineExclamationCircle />
                  </span>
                </div>
                {/* <div className="font-bold">Matched € 204.7K</div> */}
              </div>

              {bookmakerData[0]?.status === 'SUSPENDED' ? (
                <div className='relative mx-auto border-2 border-red-500'>
                  <div className='justify-centerz-10 absolute flex h-full w-full items-center bg-[#e1e1e17e]'>
                    <p className='absolute left-1/2 -translate-x-1/2 transform text-3xl font-bold text-red-700'>
                      SUSPENDED
                    </p>
                  </div>

                  <div className='grid grid-cols-9 border-b border-gray-300 bg-[#faf8d8] text-center'>
                    <div className='col-span-5'></div>
                    <div className='col-span-2 bg-[#72bbef] p-1 font-bold text-slate-800 md:col-span-1'>
                      Back
                    </div>
                    <div className='col-span-2 bg-[#faa9ba] p-1 font-bold text-slate-800 md:col-span-1'>
                      Lay
                    </div>
                    <div className='col-span-2 hidden rounded-lg bg-[#bed5d8] p-1 text-[10px] text-[#2789ce] md:block'>
                      Min/Max {BookmakerList[0]?.min}-
                      {formatToK(BookmakerList[0]?.maxb)}
                    </div>
                  </div>
                  {bookmakerData.map(({ team, odds, sid }, index) => (
                    <div key={index}>
                      <div className='cursor-block grid grid-cols-9 border-b border-gray-300 bg-[#faf8d8] text-center text-[10px] font-semibold opacity-30'>
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
                            <div className='font-bold'>{odd?.odds}</div>
                            <div className='text-gray-800'>
                              {' '}
                              {formatToK(odd?.size)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className='grid grid-cols-9 border-b border-gray-300 bg-[#faf8d8] text-center'>
                    <div className='col-span-5'></div>
                    <div className='col-span-2 bg-[#72bbef] p-1 font-bold text-slate-800 md:col-span-1'>
                      Back
                    </div>
                    <div className='col-span-2 bg-[#faa9ba] p-1 font-bold text-slate-800 md:col-span-1'>
                      Lay
                    </div>
                    <div className='col-span-2 hidden rounded-lg bg-[#bed5d8] p-1 text-[10px] text-[#2789ce] md:block'>
                      Min/Max {BookmakerList[0]?.min}-
                      {formatToK(BookmakerList[0]?.maxb)}
                    </div>
                  </div>
                  {bookmakerData.map(({ team, odds }, index) => (
                    <div key={index}>
                      <div className='grid cursor-pointer grid-cols-9 border-b border-gray-300 bg-[#faf8d8] text-center text-[10px] font-semibold hover:bg-gray-200'>
                        <MyComponent
                          key={team}
                          team={team}
                          matchData={bookmakerData[0]}
                          pendingBet={pendingBet}
                          index={index}
                        />

                        {odds.map((odd, i) => (
                          <div
                            key={i}
                            className={`col-span-2 p-1 md:col-span-1 ${
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
  );
};

export default BookMaker;
