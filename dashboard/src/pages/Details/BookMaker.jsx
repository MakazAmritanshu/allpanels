import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  createBet,
  getPendingBetAmo,
  messageClear,
} from '../../redux/reducer/betReducer';
import { toast } from 'react-toastify';
import { getUser } from '../../redux/reducer/authReducer';

import { HiOutlineExclamationCircle } from 'react-icons/hi2';

const BookMaker = ({ gameid, match }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const { battingData } = useSelector((state) => state.cricket);
  // console.log("battingData", battingData);

  const { userInfo } = useSelector((state) => state.auth);
  const { pendingBet } = useSelector((state) => state.bet);

  const [betOdds, setBetOdds] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [selectedIncrement, setSelectedIncrement] = useState(100);
  const [seletTeamName, setSeletTeamName] = useState('');

  const [formData, setFormData] = useState({
    gameId: gameid,
    sid: '',
    otype: '',
    price: null,
    xValue: '',
    gameType: '',
    gameName: 'Cricket Game',
    teamName: '',
  });

  // useEffect(() => {
  //   let intervalId;

  //   if (gameid) {
  //     // Set loader true before initial fetch
  //     setLoader(true);

  //     const fetchData = async () => {
  //       await dispatch(fetchCricketBatingData(gameid));
  //       setLoader(false); // Stop loader after first successful fetch
  //     };

  //     fetchData();

  //     intervalId = setInterval(() => {
  //       dispatch(fetchCricketBatingData(gameid));
  //     }, 2000);
  //   }

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [gameid]);
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const setValue = (xValue, team, sid, otype, fancyScore) => {
    setBetOdds(xValue);
    // console.log("xValue,team,sid,otype", xValue, team, sid, otype);
    setSeletTeamName(team);

    setFormData((prev) => ({
      ...prev,
      xValue: xValue,
      teamName: team,
      sid: sid,
      otype: otype,
      fancyScore,
    }));
  };

  const placeBet = async (gameType, marketName, maxAmo) => {
    if (!bookmakerData || bookmakerData.length === 0) {
      toast.error('Odds data not available. Please wait and try again.');
      return;
    }
    const selectedTeam = formData.teamName;
    const selectedOname = formData.oname;
    const selectedOdds = parseFloat(formData.xValue);
    const teamData = bookmakerData.find((d) => d.team === selectedTeam);
    const currentOddsObj = teamData?.odds?.find(
      (o) => o.oname === selectedOname
    );
    const currentOdds = currentOddsObj ? parseFloat(currentOddsObj.odds) : null;
    if (currentOdds === null || Math.abs(currentOdds - selectedOdds) >= 0.01) {
      toast.error(
        `Odds changed from ${selectedOdds.toFixed(2)} to ${currentOdds?.toFixed(2) ?? 'N/A'}. Please re-select.`
      );
      return;
    }

    if (betAmount > maxAmo) {
      toast.error(`Bet amount cannot exceed ${maxAmo}`);
      return;
    }

    // Balance validation is handled entirely by the backend using effective balance
    // (scenario-based calculation that accounts for hedge profits from existing positions).
    // Frontend cannot accurately determine effective balance, so we let the backend decide.

    const updatedFormData = {
      ...formData,
      price: betAmount,
      gameType,
      marketName,
      eventName: match,
    };
    setFormData(updatedFormData);
    await dispatch(createBet(updatedFormData));
    await dispatch(getUser());
    dispatch(getPendingBetAmo(gameid));
  };

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

  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
  }, [dispatch, gameid]);
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

  const [selectedRun, setSelectedRun] = useState({ type: null, index: null });

  const [betOddsValue, setBetOddsValue] = useState(0);
  const [betOddsType, setBetOddsType] = useState('');

  const handleSelect = (type, index, odds, back) => {
    setSelectedRun({ type, index });
    setBetAmount(0);
    setBetOddsValue(odds);
    setBetOddsType(back);
  };

  // Inside your React functional component (e.g., in a file like MyComponent.jsx)
  function MyComponent({
    team,
    matchData,
    pendingBet,
    myAmount,
    index,
    selectedRun,
  }) {
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

    const isSelected =
      selectedRun?.type === 'odd' && selectedRun?.index === index;
    const isSelectedTeam = selectedRun?.type === 'odd';

    let p = parseFloat(myAmount);
    let x = parseFloat(betOddsValue).toFixed(2);
    let b = 0;

    // let betColor;
    let elseColor;

    // let displayValue = 0;

    let calValue = 0;

    b = otype === 'lay' ? p : p * (x / 100);
    p = otype === 'lay' ? p * (x / 100) : p;

    if (isSelected && p !== 0) {
      calValue = betOddsType === 'back' ? b : p || 0;
      elseColor = betOddsType === 'back' && calValue >= 0 ? 'green' : 'red';
    } else if (isSelectedTeam && myAmount !== 0) {
      calValue = betOddsType === 'back' ? p : b || 0;
      elseColor = betOddsType === 'back' || calValue < 0 ? 'red' : 'green';
    }

    if (existingBet) {
      if (seletTeamName?.toLowerCase() === teamName?.toLowerCase()) {
        if (betOddsType === otype) {
          if (isSelected && p !== 0) {
            b = b + totalBetAmount;
            p = p + totalPrice;
            calValue = betOddsType === 'back' ? b : p;
            elseColor =
              betOddsType === 'back' && calValue >= 0 ? 'green' : 'red';
          } else if (isSelectedTeam && myAmount !== 0) {
            p = p + totalPrice;
            b = b + totalBetAmount;
            calValue = betOddsType === 'back' ? p : b;
            elseColor =
              betOddsType === 'back' || calValue < 0 ? 'red' : 'green';
          }
        } else {
          if (betOddsType === 'back') {
            if (totalBetAmount > p) {
              if (isSelected && p !== 0) {
                p = totalPrice - b;
                calValue = p || 0;
                elseColor = 'red';
              } else if (isSelectedTeam && myAmount !== 0) {
                b = totalBetAmount - p;
                calValue = b || 0;
                elseColor = calValue < 0 ? 'red' : 'green';
              }
            } else {
              if (isSelected && p !== 0) {
                b = b - totalPrice;
                calValue = b || 0;

                elseColor = calValue < 0 ? 'red' : 'green';
              } else if (isSelectedTeam && myAmount !== 0) {
                p = p - totalBetAmount;
                calValue = p || 0;
                elseColor = 'red';
              }
            }
          } else if (betOddsType === 'lay') {
            if (totalPrice >= b) {
              if (isSelected && p !== 0) {
                b = totalBetAmount - p;
                calValue = b || 0;
                elseColor = calValue < 0 ? 'red' : 'green';
              } else if (isSelectedTeam && myAmount !== 0) {
                p = totalPrice - b;
                calValue = p || 0;
                elseColor = 'red';
              }
            } else {
              if (isSelected && p !== 0) {
                p = p - totalBetAmount;
                calValue = p || 0;
                elseColor = 'red';
              } else if (isSelectedTeam && myAmount !== 0) {
                b = b - totalPrice;
                calValue = b || 0;
                elseColor = calValue < 0 ? 'red' : 'green';
              }
            }
          }
        }
      } else {
        if (betOddsType === otype) {
          if (betOddsType === 'back') {
            if (totalPrice >= b) {
              if (isSelected && p !== 0) {
                p = totalPrice - b;
                calValue = p || 0;
                elseColor = 'red';
              } else if (isSelectedTeam && myAmount !== 0) {
                b = totalBetAmount - p;
                calValue = b || 0;
                elseColor = calValue < 0 ? 'red' : 'green';
              }
            } else {
              if (isSelected && p !== 0) {
                b = b - totalPrice;
                calValue = b || 0;
                elseColor = calValue < 0 ? 'red' : 'green';
              } else if (isSelectedTeam && myAmount !== 0) {
                p = p - totalBetAmount;

                calValue = p || 0;
                elseColor = 'red';
              }
            }
          } else if (betOddsType === 'lay') {
            if (totalPrice >= b) {
              if (isSelected && p !== 0) {
                b = totalBetAmount - p;
                calValue = b || 0;
                elseColor = calValue < 0 ? 'red' : 'green';
              } else if (isSelectedTeam && myAmount !== 0) {
                p = totalPrice - b;
                calValue = p || 0;
                elseColor = 'red';
              }
            } else {
              if (isSelected && p !== 0) {
                p = p - totalBetAmount;
                calValue = p || 0;
                elseColor = 'red';
              } else if (isSelectedTeam && myAmount !== 0) {
                b = b - totalPrice;
                calValue = b || 0;
                elseColor = calValue < 0 ? 'red' : 'green';
              }
            }
          }
        } else {
          if (isSelected && p !== 0) {
            b = b + totalBetAmount;
            p = p + totalPrice;
            calValue = betOddsType === 'back' ? b : p;
            elseColor =
              betOddsType === 'back' && calValue >= 0 ? 'green' : 'red';
          } else if (isSelectedTeam && myAmount !== 0) {
            p = p + totalPrice;
            b = b + totalBetAmount;
            calValue = betOddsType === 'back' ? p : b;
            elseColor =
              betOddsType === 'back' || calValue < 0 ? 'red' : 'green';
          }
        }
      }
    }

    calValue = parseFloat(calValue).toFixed(2) || 0;

    // console.log("existingBet", existingBet)

    return (
      <div className='col-span-5 p-1 pl-4 text-left text-sm font-bold md:col-span-3 md:text-[11px]'>
        <div>
          <p>{team}</p>
          <p style={{ color: betColor }}>
            {displayValue}
            {/* {isSelected && myAmount !== 0 ? ( */}
            {selectedRun?.type ? (
              <span style={{ color: elseColor }}>({calValue})</span>
            ) : (
              ''
            )}

            {/* )} */}
          </p>
        </div>
      </div>
    );
  }

  // console.log("pendingBet1111", pendingBet);
  return (
    <div>
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
                      Min/Max {BookmakerList[0]?.min}-{BookmakerList[0]?.max}
                    </div>
                  </div>
                  {bookmakerData.map(({ team, odds, sid }, index) => (
                    <div key={index}>
                      <div
                        className='cursor-block grid grid-cols-9 border-b border-gray-300 bg-[#faf8d8] text-center text-[10px] font-semibold opacity-30'
                        // onClick={() => setSelectedRun(index)}
                      >
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
                            // onClick={() => {
                            //   setSelectedRun(index);
                            //   setCurrentOdd(odd);
                            // }}
                          >
                            <div
                              className='font-bold'
                              onClick={() => {
                                handleSelect(
                                  'bookmark',
                                  index,
                                  odd?.odds,
                                  odd?.otype
                                );
                                setValue(odd?.odds, team, sid, odd.otype);
                              }}
                            >
                              {odd?.odds}
                            </div>
                            <div className='text-gray-800'>{odd?.size}</div>
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
                      Min/Max {BookmakerList[0]?.min}-{BookmakerList[0]?.max}
                    </div>
                  </div>
                  {bookmakerData.map(({ team, odds, sid, status }, index) => (
                    <div key={index}>
                      <div
                        className='grid cursor-pointer grid-cols-9 border-b border-gray-300 bg-[#faf8d8] text-center text-[10px] font-semibold hover:bg-gray-200'
                        // onClick={() => setSelectedRun(index)}
                      >
                        <MyComponent
                          key={team}
                          team={team}
                          matchData={bookmakerData[0]}
                          pendingBet={pendingBet}
                          myAmount={betAmount} // the live entered amount
                          index={index}
                          selectedRun={selectedRun} // should include { type, index, team }
                          // oddsValue={odd?.odds}
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
                            // onClick={() => {
                            //   setSelectedRun(index);
                            //   setCurrentOdd(odd);
                            // }}
                          >
                            <div
                              onClick={() => {
                                if (odd?.odds !== 0) {
                                  handleSelect(
                                    'bookmark',
                                    index,
                                    odd?.odds,
                                    odd?.otype
                                  );
                                  setValue(odd?.odds, team, sid, odd.otype);
                                }
                              }}
                            >
                              <div className='font-bold'>{odd?.odds}</div>
                              <div className='text-gray-800'>{odd?.size}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedRun?.type === 'bookmark' &&
                        selectedRun.index === index && (
                          <div className='mt-2 bg-green-100 p-3'>
                            <div className='grid grid-cols-4 gap-2'>
                              <button
                                className='col-span-2 rounded-sm border border-black bg-white px-3 py-1 md:col-span-1'
                                onClick={() =>
                                  handleSelect(null, null, null, null)
                                }
                              >
                                Cancel
                              </button>
                              <div className='col-span-2 flex w-full items-center justify-between overflow-hidden rounded-sm border md:col-span-1'>
                                <button
                                  className='h-full bg-gray-300 px-3 py-1'
                                  onClick={() =>
                                    setBetOdds((prev) =>
                                      prev > 1 ? prev - 0.1 : prev
                                    )
                                  }
                                >
                                  -
                                </button>
                                <span className='mx-3'>
                                  {betOdds.toFixed(2)}
                                </span>
                                <button
                                  className='h-full bg-gray-300 px-3 py-1'
                                  onClick={() =>
                                    setBetOdds((prev) => prev + 0.1)
                                  }
                                >
                                  +
                                </button>
                              </div>

                              <div className='col-span-2 flex w-full items-center justify-between overflow-hidden rounded-sm border md:col-span-1'>
                                <button
                                  className='h-full bg-gray-300 px-3 py-1'
                                  onClick={() =>
                                    setBetAmount((prev) =>
                                      prev > selectedIncrement
                                        ? prev - selectedIncrement
                                        : 0
                                    )
                                  }
                                >
                                  -
                                </button>
                                <input
                                  value={betAmount || ''}
                                  onChange={(e) =>
                                    setBetAmount(Number(e.target.value))
                                  }
                                  placeholder='0'
                                  className='col-span-2 w-full bg-white p-2 text-black md:col-span-1'
                                />
                                <button
                                  className='h-full bg-gray-300 px-3 py-1'
                                  onClick={() =>
                                    setBetAmount(
                                      (prev) => prev + selectedIncrement
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() =>
                                  placeBet(
                                    bookmakerData[0]?.mname,
                                    bookmakerData[0]?.mname,
                                    BookmakerList[0]?.max
                                  ) && setBetAmount(0)
                                }
                                disabled={loading}
                                className={`bg-blue col-span-2 flex items-center justify-center gap-2 rounded-sm px-3 py-1 text-white transition-all duration-300 md:col-span-1 ${
                                  loading ? 'cursor-not-allowed opacity-70' : ''
                                }`}
                              >
                                {loading ? (
                                  <>
                                    <svg
                                      className='h-4 w-4 animate-spin text-white'
                                      xmlns='http://www.w3.org/2000/svg'
                                      fill='none'
                                      viewBox='0 0 24 24'
                                    >
                                      <circle
                                        className='opacity-25'
                                        cx='12'
                                        cy='12'
                                        r='10'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                      />
                                      <path
                                        className='opacity-75'
                                        fill='currentColor'
                                        d='M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z'
                                      />
                                    </svg>
                                    Placing...
                                  </>
                                ) : (
                                  'Place Bet'
                                )}
                              </button>
                            </div>

                            <div className='mt-2 grid grid-cols-4 gap-2 md:grid-cols-8'>
                              {[
                                100, 200, 500, 1000, 2000, 3000, 5000, 10000,
                              ].map((amt) => (
                                <button
                                  key={amt}
                                  onClick={() => {
                                    setBetAmount(amt);
                                    setSelectedIncrement(amt);
                                  }}
                                  className={`col-span-1 rounded-sm border border-black px-3 py-2 ${
                                    betAmount === amt
                                      ? 'bg-green-600 text-white'
                                      : 'bg-white'
                                  }`}
                                >
                                  {amt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
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
