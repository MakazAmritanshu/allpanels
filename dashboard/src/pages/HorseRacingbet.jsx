import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; //eslint-disable-line
import { useDispatch, useSelector } from 'react-redux';

import {
  getPendingBetAmo,
  fetchHorseRacingBatingData,
  getBetPerents,
  masterBookReducer,
  masterBookReducerDownline,
} from '../redux/reducer/marketAnalyzeReducer';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import { FaArrowRight } from 'react-icons/fa';
import Spinner2 from '../components/Spinner2';
import { host } from '../redux/api';
import Navbar from '../components/Navbar';
import axios from 'axios';

export default function HorseRacingbet() {
  const [bettingData, setBettingData] = useState(null);
  const hasCheckedRef = useRef(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { gameid } = useParams() || {};
  const [showMasterDownline, setShowMasterDownline] = useState(false);
  const [scoreUrl, setScoreUrl] = useState(false);
  const [url, setUrl] = useState('');
  const [masterpopup, setMasterpopup] = useState(false);
  const [userMasterpopup, setUserMasterpopup] = useState(false);
  const [liveBets, setLiveBets] = useState([]);
  const [userBet, setUserBet] = useState([]);
  const [storedGameType, setStoredGameType] = useState(null);
  const [storedMatchOddsList, setStoredMatchOddsList] = useState([]);
  const [teamHeaders, setTeamHeaders] = useState([]);
  const [masterDownline, setMasterDownline] = useState([]);

  const {
    loading,
    pendingBet,
    battingData,
    betsData,
    betPerantsData,
    masterData,
    masterDataDownline,
  } = useSelector((state) => state.market);
  const { userInfo } = useSelector((state) => state.auth);

  // Initial fetch
  useEffect(() => {
    if (gameid) {
      dispatch(fetchHorseRacingBatingData(gameid));
    }
  }, [gameid, dispatch]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!gameid) return;

    const socket = new WebSocket(host);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: 'subscribe', gameid, apitype: 'horse-racing' })
      );
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.gameid === gameid) {
          setBettingData(message.data);
        }
      } catch (err) {
        console.error(' Error parsing message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error(' WebSocket error:', err);
    };

    socket.onclose = () => {
      console.log(' WebSocket disconnected');
    };

    return () => socket.close();
  }, [gameid]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
  }, [dispatch]);

  const matchOddsList = Array.isArray(bettingData)
    ? bettingData.filter((item) => item.mname === 'MATCH_ODDS')
    : [];

  const matchOdd = Array.isArray(betsData)
    ? betsData.filter(
        (item) => item?.gameType === 'Match Odds' || item?.gameType === 'Winner'
      )
    : [];

  const oddsData =
    Array.isArray(matchOddsList) &&
    matchOddsList.length > 0 &&
    matchOddsList[0].section
      ? matchOddsList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          mname: 'Match Odds',
          status: matchOddsList[0].status,
        }))
      : [];

  useEffect(() => {
    document.body.style.overflow = masterpopup ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [masterpopup]);

  const hendalUserBetsData = (gameType, code, matchOddsList) => {
    const userBet = Array.isArray(betsData)
      ? betsData.filter(
          (item) => item?.gameType === gameType || item?.gameType === code
        )
      : [];

    // Extract teams from matchOddsList
    const teams = Array.isArray(matchOddsList[0]?.section)
      ? matchOddsList[0].section.map((sec) => sec.nat)
      : [];
    setTeamHeaders(teams); // Set teams to render in table header

    // console.log("userbetas", userBet)
    setUserBet(userBet);
  };

  const hemdelMasterBook = async (userId, gameType, matchOddsList) => {
    try {
      // Reset UI
      setMasterDownline([]);
      setTeamHeaders([]);
      setShowMasterDownline(true);

      // Use stored values if not passed (for downline use)
      const finalGameType = gameType || storedGameType;
      const finalMatchOddsList = matchOddsList?.length
        ? matchOddsList
        : storedMatchOddsList;

      // Save for future
      if (gameType && matchOddsList) {
        setStoredGameType(gameType);
        setStoredMatchOddsList(matchOddsList);
      }

      // Dispatch reset action if needed
      dispatch({ type: 'RESET_MASTER_BOOK' });

      // Fetch new data
      await dispatch(
        masterBookReducer({ userId, gameid, gameType: finalGameType })
      );

      // Update headers
      const teams = Array.isArray(finalMatchOddsList[0]?.section)
        ? finalMatchOddsList[0].section.map((sec) => sec.nat)
        : [];
      setTeamHeaders(teams);
    } catch (error) {
      console.log(error);
    }
  };

  const hemdelMasterBookDownline = async (userId) => {
    try {
      // Reset UI
      setMasterDownline([]);
      setTeamHeaders([]);

      const finalGameType = storedGameType;
      const finalMatchOddsList = storedMatchOddsList;

      // Dispatch new downline request
      await dispatch(
        masterBookReducerDownline({ userId, gameid, gameType: finalGameType })
      );

      // Update headers
      const teams = Array.isArray(finalMatchOddsList[0]?.section)
        ? finalMatchOddsList[0].section.map((sec) => sec.nat)
        : [];
      setTeamHeaders(teams);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (masterData?.length > 0) {
      setMasterDownline(masterData); // ⬅️ For first-level data
    }
  }, [masterData]);

  useEffect(() => {
    if (masterDataDownline?.length > 0) {
      setMasterDownline(masterDataDownline); // ⬅️ For downline drill
    }
  }, [masterDataDownline]);

  // Helper function
  const getBetDetails = (pendingBet, matchData, team) => {
    const marketBets =
      pendingBet?.filter((item) => item.gameType === matchData?.mname) || [];

    // If no bets, return empty
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

    // Find bet specifically for current team
    const matchedTeamBet = marketBets.find(
      (item) => item.teamName?.toLowerCase() === team?.toLowerCase()
    );

    // Always calculate NET outcome if THIS team wins
    // This works whether bets are on one team or multiple teams
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

    // console.log("existingBet", existingBet)

    return (
      <div className='col-span-5 p-1 pl-4 text-left text-sm font-bold md:col-span-5 md:text-[11px]'>
        <div>
          <p>{team}</p>
          <p style={{ color: betColor }}>{displayValue || '0.00'}</p>
        </div>
      </div>
    );
  }

  const [popup, setPopup] = useState(false);
  const handelpopup = async (id) => {
    setPopup(true);
    await dispatch(getBetPerents(id));
    // console.log("idddd", id);
  };

  const formatToK = (num) => {
    if (!num || num < 1000) return num;
    const n = Number(num) / 1000;
    return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}k`;
  };
  const pratnerShip = (role, amount, part) => {
    const roundedAmount = Math.round(amount * 100) / 100; // Round to 2 decimals
    if (role === 'user') {
      return roundedAmount;
    } else {
      return Math.round(roundedAmount * ((100 - part) / 100) * 100) / 100;
    }
  };

  return (
    <div className='relative'>
      <Navbar />

      {loading ? (
        <div className='py-4 text-center'>
          <Spinner2 />
        </div>
      ) : (
        <div className='flex w-full flex-col p-1 md:flex-row md:p-5'>
          <div className='sm:w-full md:w-[60%]'>
            <div>
              {/* odds match data */}
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
                            <div className='col-span-5 p-1 md:col-span-5'>
                              <div className='rounded-md bg-[#bed5d8] p-0.5 text-xs text-gray-600 md:hidden'>
                                <span className='text-[#315195]'>Min/Max </span>
                                {matchOddsList[0]?.min}-
                                {formatToK(matchOddsList[0]?.maxb)}
                              </div>
                            </div>
                            <div className='col-span-2 bg-[#72bbef] p-1 font-bold text-slate-800 md:col-span-1 md:rounded-t-2xl'>
                              Back
                            </div>
                            <div className='col-span-2 bg-[#faa9ba] p-1 font-bold text-slate-800 md:col-span-1 md:rounded-t-2xl'>
                              Lay
                            </div>
                            <div className='col-span-2 hidden rounded-lg p-1 text-[11px] font-semibold md:block'>
                              <div className='rounded-md bg-[#bed5d8] p-0.5'>
                                <span className='text-[#315195]'>Min/Max </span>
                                {matchOddsList[0]?.min}-
                                {formatToK(matchOddsList[0]?.maxb)}
                              </div>
                            </div>
                          </div>
                          {oddsData.map(({ team, odds }, index) => (
                            <div key={index}>
                              <div className='grid cursor-pointer grid-cols-9 border-b border-gray-300 bg-white text-center text-[10px] font-semibold opacity-30 hover:bg-gray-200'>
                                <div className='col-span-5 p-1 pl-4 text-left text-[11px] font-bold md:col-span-3'>
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
                                    <div className='font-bold'>
                                      {odd?.odds || 0}
                                    </div>
                                    <div className='text-gray-800'>
                                      {odd?.size || 0}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <div className='grid grid-cols-9 border-b border-gray-300 bg-white text-center'>
                            <div className='col-span-5 p-1 md:col-span-5'>
                              <div className='rounded-md bg-[#bed5d8] p-0.5 text-xs text-gray-600 md:hidden'>
                                <span className='text-[#315195]'>Min/Max </span>
                                {matchOddsList[0]?.min}-
                                {formatToK(matchOddsList[0]?.maxb)}
                              </div>
                            </div>
                            <div className='col-span-2 bg-[#72bbef] p-1 font-bold text-slate-800 md:col-span-1 md:rounded-t-2xl'>
                              Back
                            </div>
                            <div className='col-span-2 bg-[#faa9ba] p-1 font-bold text-slate-800 md:col-span-1 md:rounded-t-2xl'>
                              Lay
                            </div>
                            <div className='col-span-2 hidden rounded-lg p-1 text-[11px] font-semibold md:block'>
                              <div className='rounded-md bg-[#bed5d8] p-0.5'>
                                <span className='text-[#315195]'>Min/Max </span>
                                {matchOddsList[0]?.min}-
                                {formatToK(matchOddsList[0]?.maxb)}
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

                                  // oddsValue={odd?.odds}
                                />
                                {odds.map(
                                  (odd, i) =>
                                    odd?.tno === 0 && (
                                      <div
                                        key={i}
                                        className={`col-span-2 w-full cursor-pointer border-b p-1 text-center md:col-span-1 ${
                                          odd?.otype === 'back'
                                            ? 'bg-[#72bbef]'
                                            : 'bg-[#faa9ba]'
                                        }`}
                                      >
                                        <div>
                                          <div className='font-bold'>
                                            {odd?.odds}
                                          </div>
                                          <div className='text-gray-800'>
                                            {formatToK(odd?.size) || 0}
                                            {/* {odd?.size} */}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                )}
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
          <div className='md-mt-0 mt-5 sm:w-full md:w-[40%]'>
            <div>
              <div>
                <div
                  className='bg-dark cursor-pointer rounded-t-md px-4 py-1 font-semibold text-white'
                  onClick={() => setUrl(!url)}
                >
                  Live Streaming
                </div>
                {url ? (
                  <iframe
                    src={`https://live.cricketid.xyz/directStream?gmid=${gameid}&key=a1bett20252026`}
                    title='Watch Live'
                    className='w-full rounded-lg'
                    style={{ height: '50vh' }}
                    allowFullScreen
                    loading='lazy'
                    allow='
                      autoplay;
                      encrypted-media;
                      fullscreen;
                      picture-in-picture;
                      accelerometer;
                      gyroscope
                    '
                  />
                ) : null}
              </div>
              <div className='mt-4'>
                <div
                  className='bg-dark cursor-pointer rounded-t-md px-4 py-1 font-semibold text-white'
                  onClick={() => setScoreUrl(!scoreUrl)}
                >
                  Score Card
                </div>
                {scoreUrl ? (
                  <iframe
                    src={`https://score.akamaized.uk/diamond-live-score?gmid=${gameid}`}
                    allowFullScreen
                    className='w-full rounded-lg'
                    title='Live Score'
                    allow='
                      autoplay;
                      encrypted-media;
                      fullscreen;
                      picture-in-picture;
                      accelerometer;
                      gyroscope
                    '
                  />
                ) : null}
              </div>
              <div className='mt-4 bg-white'>
                <div className='bg-dark cursor-pointer rounded-t-md px-4 py-1 font-semibold text-white'>
                  Book
                </div>
                <div className='flex w-full justify-between p-4'>
                  <button
                    className='bg-dark w-[47%] cursor-pointer rounded-md px-4 py-1 font-semibold text-white'
                    onClick={() => setMasterpopup(true)}
                  >
                    Master Book
                  </button>
                  <button
                    className='bg-dark w-[47%] cursor-pointer rounded-md px-4 py-1 font-semibold text-white'
                    onClick={() => setUserMasterpopup(true)}
                  >
                    User Book
                  </button>
                </div>
              </div>
              <div className='mt-4 bg-white'>
                <div className='bg-dark flex w-full cursor-pointer justify-between rounded-t-md p-2 py-1 text-white md:px-4'>
                  <div className='flex w-2/3 justify-between p-0 md:w-[60%] md:p-4'>
                    <div className='flex gap-2 md:gap-5'>
                      <span className='mt-4 md:mt-1'>Live Bet</span>
                      <div className='inline-flex items-center'>
                        <label className='relative flex cursor-pointer items-center'>
                          <input
                            type='checkbox'
                            className='peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white shadow transition-all checked:border-slate-800 checked:bg-slate-800 hover:shadow-md'
                            id='uncheck'
                            onChange={(e) => {
                              if (e.target.checked) {
                                setLiveBets(betsData); // ✅ If checked
                              } else {
                                setLiveBets([]); // ❌ If unchecked
                              }
                            }}
                          />
                          <span className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-white text-blue-500 opacity-0 peer-checked:opacity-100'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-3.5 w-3.5'
                              viewBox='0 0 20 20'
                              fill='currentColor'
                              stroke='currentColor'
                              strokeWidth={1}
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className='flex gap-2 md:gap-5'>
                      <span className='mt-4 md:mt-1'>Partnership Book</span>
                      <div className='inline-flex items-center'>
                        <label className='relative flex cursor-pointer items-center'>
                          <input
                            type='checkbox'
                            className='peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white shadow transition-all checked:border-slate-800 checked:bg-slate-800 hover:shadow-md'
                            id='check'
                          />
                          <span className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-white text-blue-500 opacity-0 peer-checked:opacity-100'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-3.5 w-3.5'
                              viewBox='0 0 20 20'
                              fill='currentColor'
                              stroke='currentColor'
                              strokeWidth={1}
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='flex w-1/3 justify-end p-4 text-end md:w-[40%]'>
                    View More
                  </div>
                </div>

                {liveBets.length > 0 ? (
                  <div className='w-full border-t border-gray-300 p-2'>
                    <div className='grid grid-cols-10 border-b border-gray-400 bg-white py-2 text-[11px]'>
                      <div className='col-span-4'>Market Name</div>
                      <div className='col-span-2'>Odds</div>
                      <div className='col-span-2'>Stake</div>
                      <div className='col-span-2'>Username</div>
                    </div>

                    {liveBets.map((item, index) => (
                      <div
                        key={index}
                        className={`${item.otype === 'back' ? 'border-[#89c9f8] bg-[#b6defa]' : 'border-[#f8e8eb] bg-[#f8e8eb]'} border px-2 py-1 text-sm`}
                      >
                        <div>
                          <p className='text-[10px] text-gray-600'>
                            Time: {item.date}
                          </p>
                        </div>
                        <div
                          className={`${item.otype === 'back' ? ' bg-[#beddf4]' : 'bg-[#f8e8eb]'} grid grid-cols-10 items-center gap-2 text-sm`}
                        >
                          <div className='col-span-4'>
                            <div className='flex items-center gap-2'>
                              <div
                                className={`${item.otype === 'back' ? 'bg-[#79c0f4] ' : 'bg-[#faa9ba]'} rounded px-2 py-1 text-[10px] font-bold text-white`}
                              >
                                {item.otype}
                              </div>
                              <div className='flex flex-col'>
                                <span className='text-[10px] text-gray-400'>
                                  {item.teamName}
                                </span>
                                <span className='text-[11px] font-semibold'>
                                  {item.gameType}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='col-span-2 text-[11px]'>
                            <div>{item.xValue}</div>
                          </div>
                          <div className='col-span-2 text-[11px]'>
                            <div>
                              {item.otype === 'lay'
                                ? item.betAmount
                                : item.price}
                            </div>
                          </div>
                          <div className='col-span-2 text-[11px]'>
                            <div>
                              <div
                                className='cursor-pointer text-gray-700 underline'
                                onClick={() => handelpopup(item.userId)}
                              >
                                {item.userName}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='items-center py-8 text-center'>
                    <h2>There are no any bet.</h2>
                  </div>
                )}
              </div>

              {/* master list popup */}

              {masterpopup && (
                <div className='modal-overlay fixed top-10 left-[25%] h-full'>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className='modal-content h-fit w-[95%] md:w-[50%]'
                  >
                    <div className='modal-header bg-color flex justify-between'>
                      <span> Market List</span>
                      <span
                        className='text-lg'
                        onClick={() => setMasterpopup(false)}
                      >
                        {' '}
                        X
                      </span>
                    </div>
                    <div className='modal-body p-4'>
                      <div className='border border-gray-300'>
                        {matchOdd?.length > 0 && (
                          <h2
                            className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                            onClick={() =>
                              hemdelMasterBook(
                                '',
                                matchOdd[0]?.gameType,
                                matchOddsList
                              )
                            }
                          >
                            {matchOdd[0]?.gameType}
                          </h2>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* master Book popup */}
              {showMasterDownline && masterDownline?.length > 0 && (
                <div className='modal-overlay1 fixed top-10 left-[25%] z-[9999] h-full'>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className='modal-content h-fit w-[95%] rounded-lg bg-white shadow-lg md:w-[30%]'
                  >
                    <div className='modal-header bg-color flex justify-between border-b p-3'>
                      <span className='font-semibold'>Master Book</span>
                      <span
                        className='cursor-pointer text-2xl'
                        onClick={() => {
                          setMasterDownline([]);
                          setShowMasterDownline(false);
                        }}
                      >
                        ×
                      </span>
                    </div>
                    <div className='modal-body p-4'>
                      <div className='overflow-x-auto'>
                        <table className='w-full border-collapse'>
                          <thead>
                            <tr className='bg-gray-200 text-center text-sm'>
                              <th className='border p-2'>Username</th>
                              <th className='border p-2'>Role</th>
                              {teamHeaders.map((team, idx) => (
                                <th key={idx} className='border p-2'>
                                  {team}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {loading && (
                              <tr>
                                <td colSpan={6} className='p-4 text-center'>
                                  Loading...
                                </td>
                              </tr>
                            )}

                            {!loading && masterDownline?.length > 0 ? (
                              masterDownline.map((item, index) => (
                                <tr
                                  key={index}
                                  className='text-center text-sm hover:bg-gray-100'
                                >
                                  <td
                                    className='cursor-pointer border p-2 text-blue-500'
                                    onClick={() =>
                                      hemdelMasterBookDownline(item.id)
                                    }
                                  >
                                    {item.userName}
                                  </td>
                                  <td className='border p-2'>
                                    {item.userRole}
                                  </td>
                                  {teamHeaders.map((team, i) => {
                                    // Calculate the value to display
                                    let displayValue;
                                    if (item.otype === 'back') {
                                      displayValue =
                                        item.teamName === team
                                          ? item.totalBetAmount // Profit if this team wins
                                          : -item.totalPrice; // Loss if other team wins
                                    } else {
                                      // lay
                                      displayValue =
                                        item.teamName === team
                                          ? -item.totalPrice // Liability if this team wins
                                          : item.totalBetAmount; // Profit if other team wins
                                    }

                                    const roundedValue = pratnerShip(
                                      item.userRole,
                                      displayValue,
                                      item.partnership
                                    );
                                    const numericValue =
                                      parseFloat(roundedValue) || 0;
                                    const colorClass =
                                      numericValue >= 0
                                        ? 'text-green-600'
                                        : 'text-red-500';

                                    return (
                                      <td key={i} className='border p-2'>
                                        <span className={colorClass}>
                                          {roundedValue}
                                        </span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className='py-4 text-center'>
                                  No data available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* user master list popup */}

              {userMasterpopup && (
                <div className='modal-overlay fixed top-10 left-[25%] h-full'>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className='modal-content h-fit w-[95%] md:w-[50%]'
                  >
                    <div className='modal-header bg-color flex justify-between'>
                      <span> Market List</span>
                      <span
                        className='text-2xl'
                        onClick={() => setUserMasterpopup(false)}
                      >
                        {' '}
                        X
                      </span>
                    </div>
                    <div className='modal-body p-4'>
                      <div className='border border-gray-300'>
                        {matchOdd?.length > 0 && (
                          <h2
                            className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                            onClick={() =>
                              hendalUserBetsData(
                                matchOdd[0]?.gameType,
                                userInfo.code,
                                matchOddsList
                              )
                            }
                          >
                            {matchOdd[0]?.gameType}
                          </h2>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* user Book popup */}
              {userBet?.length > 0 && (
                <div className='modal-overlay1 fixed top-10 left-[25%] h-full'>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className='modal-content h-fit w-[95%] md:w-[30%]'
                  >
                    <div className='modal-header bg-color flex justify-between'>
                      <span> User Book</span>
                      <span
                        className='text-2xl'
                        onClick={() => setUserBet(null)}
                      >
                        {' '}
                        X
                      </span>
                    </div>
                    <div className='modal-body p-4'>
                      <div className='overflow-x-auto'>
                        <table className='w-full border-collapse'>
                          <thead>
                            <tr className='bg-gray-200 text-center'>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='flex items-center justify-center text-[13px]'>
                                  Username
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='flex items-center justify-center text-[13px]'>
                                  Role
                                </div>
                              </th>
                              {teamHeaders.map((team, index) => (
                                <th
                                  key={index}
                                  className='border border-gray-300 p-2 text-left'
                                >
                                  <div className='flex items-center justify-center text-[13px]'>
                                    {team}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {loading && (
                              <tr>
                                <td
                                  colSpan={6}
                                  className='border border-gray-300 p-4 text-center'
                                >
                                  Loading...
                                </td>
                              </tr>
                            )}
                            {!loading && userBet?.length > 0 ? (
                              userBet.map((item, index) => (
                                <tr
                                  key={index}
                                  className='text-center text-sm font-semibold hover:bg-gray-100'
                                >
                                  <td className='cursor-pointer border border-gray-300 p-2 text-[#2789ce]'>
                                    {item.userName}
                                  </td>

                                  <td className='border border-gray-300 p-2'>
                                    {item.userRole}
                                  </td>

                                  {/* Loop through team headers for dynamic columns */}
                                  {teamHeaders.map((team, i) => {
                                    // Check if bet matches any team in the current match
                                    const isMatchedTeam =
                                      item.teamName?.toLowerCase() ===
                                      team?.toLowerCase();
                                    const betMatchesAnyTeam = teamHeaders.some(
                                      (t) =>
                                        item.teamName?.toLowerCase() ===
                                        t?.toLowerCase()
                                    );

                                    // If bet doesn't belong to this match, show 0
                                    if (!betMatchesAnyTeam) {
                                      return (
                                        <td
                                          key={i}
                                          className='border border-gray-300 p-2'
                                        >
                                          <span className='text-gray-400'>
                                            0
                                          </span>
                                        </td>
                                      );
                                    }

                                    // Calculate display value
                                    let displayValue;
                                    if (item.otype === 'back') {
                                      displayValue = isMatchedTeam
                                        ? item.betAmount || 0 // Profit if this team wins
                                        : -(item.price || 0); // Loss if other team wins
                                    } else {
                                      // lay
                                      displayValue = isMatchedTeam
                                        ? -(item.price || 0) // Liability if this team wins
                                        : item.betAmount || 0; // Profit if other team wins
                                    }

                                    // Round to 2 decimal places
                                    const roundedValue =
                                      Math.round(displayValue * 100) / 100;

                                    // Color based on actual value (positive = green, negative = red)
                                    const colorClass =
                                      roundedValue >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500';

                                    return (
                                      <td
                                        key={i}
                                        className='border border-gray-300 p-2'
                                      >
                                        <span className={colorClass}>
                                          {roundedValue}
                                        </span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={6}
                                  className='border border-gray-300 p-4 text-center'
                                >
                                  No data available in table
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            {/* user bet presents popup */}
          </div>
          <div>
            {popup && (
              <div className='bg-opacity-50 fixed inset-0 z-[100] flex items-start justify-center bg-[#0000005d]'>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className='mt-1 w-94 rounded-lg bg-white shadow-lg md:w-150'
                >
                  {/* Header */}
                  <div className='bg-color flex justify-between px-4 py-1.5 font-bold text-white'>
                    <span>Parent List</span>
                    <button
                      onClick={() => setPopup(false)}
                      className='text-xl text-white'
                    >
                      X
                    </button>
                  </div>

                  {/* Commission List */}
                  <div className='space-y-2 p-4'>
                    {[...betPerantsData].reverse().map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-center border border-gray-300 px-4 py-2 text-center font-semibold'
                      >
                        <span>{item.userName}</span>
                        <span>
                          <span>({item.role.toUpperCase()})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
