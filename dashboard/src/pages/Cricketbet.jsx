import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  getPendingBetAmo,
  fetchCricketBatingData,
  getBetPerents,
  masterBookReducer,
  masterBookReducerDownline,
} from '../redux/reducer/marketAnalyzeReducer';

import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import { BiInfoCircle } from 'react-icons/bi';
import Spinner2 from '../components/Spinner2';
import MatchOdd from './CircketComponent/MatchOdd';
import TiedMatch from './CircketComponent/TiedMatch';
import BookMaker from './CircketComponent/BookMaker';
import { host } from '../redux/api';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getAdmin } from '../redux/reducer/authReducer';

const oddsDataraw = [
  {
    title: 'KKR 14 Over Total Runs (Odds / Evens)',
    options: [
      { label: 'ODD', value: '1.95', stake: '1M' },
      { label: 'EVEN', value: '1.95', stake: '1M' },
    ],
  },
  {
    title: 'KKR 15 Over Total Runs (Odds / Evens)',
    options: [
      { label: 'ODD', value: '1.95', stake: '1M' },
      { label: 'EVEN', value: '1.95', stake: '1M' },
    ],
  },
];

const dismissalData = [
  { method: 'Caught', odds: '1.3' },
  { method: 'Bowled', odds: '4' },
  { method: 'LBW', odds: '5' },
  { method: 'Run Out', odds: '15' },
  { method: 'Stumped', odds: '20' },
  { method: 'Others', odds: '100' },
];

export default function Cricketbet() {
  const { gameid } = useParams() || {};
  const { match } = useParams() || {};
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  // const { pendingBetAmounts } = useSelector((state) => state.bet);
  //  WebSocket Setup (Real-time updates)
  const [bettingData, setBettingData] = useState(null);

  const [loader, setLoader] = useState(false);

  const { battingData } = useSelector((state) => state.market);

  const {
    loading,
    pendingBet,
    betsData,
    betPerantsData,
    masterData,
    masterDataDownline,
  } = useSelector((state) => state.market);

  const [activeTab, setActiveTab] = useState('fancy');
  const [activeSubTab, setActiveSubTab] = useState('Normal');
  const [scoreUrl, setScoreUrl] = useState(false);
  const [url, setUrl] = useState('');
  const [masterpopup, setMasterpopup] = useState(false);
  const [userMasterpopup, setUserMasterpopup] = useState(false);
  const [viewMoreDetail, setViewMoreDetail] = useState(false);
  const [showMasterDownline, setShowMasterDownline] = useState(false);
  const [liveBets, setLiveBets] = useState([]);
  const [userBet, setUserBet] = useState([]);
  const [storedGameType, setStoredGameType] = useState(null);
  const [storedMatchOddsList, setStoredMatchOddsList] = useState([]);
  const [teamHeaders, setTeamHeaders] = useState([]);
  const [masterDownline, setMasterDownline] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const subTabs = [
    { id: 'Normal', name: 'ALL' },
    { id: 'Normal', name: 'Fancy' },
    { id: 'line', name: 'Line Markets' },
    { id: 'ball', name: 'Ball by Ball' },
    { id: 'meter', name: 'Meter Markets' },
    { id: 'khado', name: 'Khado Markets' },
  ];

  console.log('pendingBet', pendingBet);
  console.log('betPerantsData', betPerantsData);
  console.log('masterData', masterData);
  console.log('betsData', betsData);
  //  Fetch once before using socket (optional)
  useEffect(() => {
    if (gameid) {
      setLoader(true);
      dispatch(fetchCricketBatingData(gameid)).finally(() => {
        setLoader(false);
      });
    }
  }, [dispatch, gameid]);

  useEffect(() => {
    if (!gameid) return;

    const socket = new WebSocket(host);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: 'subscribe', gameid, apitype: 'cricket' })
      );
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.gameid === gameid) {
          setBettingData(message.data);
        }
      } catch (err) {
        console.error('❌ Error parsing message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
    };

    socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    return () => socket.close();
  }, [gameid]);

  useEffect(() => {
    let intervalId;

    if (gameid) {
      // Set loader true before initial fetch
      setLoader(true);

      const fetchData = async () => {
        dispatch(fetchCricketBatingData(gameid));
        setLoader(false);
      };

      fetchData();
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [gameid]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  // Calculate net outcome for a team in a given market (like MatchOdd.jsx)
  const getTossBetDetails = (pendingBets, gameType, team) => {
    const marketBets =
      pendingBets?.filter((item) => item.gameType === gameType) || [];

    if (marketBets.length === 0) {
      return { netOutcome: null, hasExistingBet: false };
    }

    let netOutcome = 0;
    marketBets.forEach((bet) => {
      const isBetOnThisTeam =
        bet.teamName?.toLowerCase().trim() === team?.toLowerCase().trim();
      const betAmount = parseFloat(bet.totalBetAmount) || 0;
      const stake = parseFloat(bet.totalPrice) || 0;

      if (bet.otype === 'back') {
        if (isBetOnThisTeam) {
          netOutcome += betAmount; // Profit if THIS team wins
        } else {
          netOutcome -= stake; // Loss if OTHER team wins (lose your stake)
        }
      } else {
        // lay bet logic
        if (isBetOnThisTeam) {
          netOutcome -= stake; // Loss if THIS team wins (liability)
        } else {
          netOutcome += betAmount; // Profit if OTHER team wins
        }
      }
    });

    return {
      netOutcome: Math.round(netOutcome * 100) / 100,
      hasExistingBet: true,
    };
  };

  const matchOddsList = Array.isArray(bettingData)
    ? bettingData.filter(
        (item) =>
          item?.mname === 'MATCH_ODDS' || item?.mname === 'TOURNAMENT_WINNER'
      )
    : [];

  const matchOdd = Array.isArray(betsData)
    ? betsData.filter(
        (item) => item?.gameType === 'Match Odds' || item?.gameType === 'Winner'
      )
    : [];

  const tiedMatchList = Array.isArray(bettingData)
    ? bettingData.filter(
        (item) =>
          item?.mname === 'TIED_MATCH' || item?.mname === 'Bookmaker IPL CUP'
      )
    : [];
  const tiedMatch = Array.isArray(betsData)
    ? betsData.filter(
        (item) =>
          item?.gameType === 'Bookmaker IPL CUP' ||
          item?.gameType === 'TIED_MATCH'
      )
    : [];

  const BookmakerList = Array.isArray(bettingData)
    ? bettingData.filter((item) => item.mname === 'Bookmaker')
    : [];

  const Bookmaker = Array.isArray(betsData)
    ? betsData.filter((item) => item.gameType === 'Bookmaker')
    : [];

  const Toss = Array.isArray(betsData)
    ? betsData.filter((item) => item.gameType === 'Toss')
    : [];

  const first6over = Array.isArray(betsData)
    ? betsData.filter((item) => item.gameType === '1st 6 over')
    : [];

  const fancy1List = bettingData?.filter((item) => item.mname === 'fancy1');

  const fancy1Data =
    Array.isArray(fancy1List) && fancy1List.length > 0 && fancy1List[0].section
      ? fancy1List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: fancy1List[0].mname, // Access from first item
          status: fancy1List[0].status, //  Access from first item
        }))
      : [];

  const over6List = bettingData?.filter((item) => item.mname === 'Normal');
  const over6Data =
    Array.isArray(over6List) && over6List.length > 0 && over6List[0].section
      ? over6List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: over6List[0].mname, //  Access from first item
          status: sec.gstatus, //  Access from first item
        }))
      : [];

  const fancy2List = bettingData?.filter((item) => item.mname === activeSubTab);
  const fancy2Data =
    Array.isArray(fancy2List) && fancy2List.length > 0 && fancy2List[0].section
      ? fancy2List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: fancy2List[0].mname, //  Access from first item
          status: sec.gstatus, //  Access from first item
        }))
      : [];

  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
  }, [dispatch]);

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

  const tossTeamamo = (gameType, team1, team2) => {
    const team1Data = Array.isArray(betsData)
      ? betsData.filter(
          (item) => item?.gameType === gameType || item?.teamName === team1
        )
      : [];

    console.log('team1Data', team1Data);
  };

  useEffect(() => {
    if (masterData?.length > 0) {
      setMasterDownline(masterData); //  For first-level data
    }
  }, [masterData]);

  useEffect(() => {
    if (masterDataDownline?.length > 0) {
      setMasterDownline(masterDataDownline); // For downline drill
    }
  }, [masterDataDownline]);

  const [popup, setPopup] = useState(false);
  const handelpopup = async (id) => {
    setPopup(true);
    await dispatch(getBetPerents(id));
  };

  // Inside your React functional component (e.g., in a file like MyComponent.jsx)

  const formatToK = (num) => {
    if (!num || num < 1000) return num;
    const n = Number(num);
    return `${n / 1000}k`;
  };

  const pratnerShip = (role, amount, part) => {
    const roundedAmount = Math.round(amount * 100) / 100; // Round to 2 decimals
    if (role === 'user') {
      return roundedAmount;
    } else {
      return Math.round(roundedAmount * ((100 - part) / 100) * 100) / 100;
    }
  };
  const filteredBetOdd = betsData
    ?.filter((item) =>
      searchTerm
        ? item.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.gameType?.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )
    .slice(0, entriesPerPage);
  return (
    <div className='relative'>
      <Navbar />
      <div className='w-full'>
        {loader ? (
          <div className='fixed top-52 left-[40%] py-4 text-center'>
            <Spinner2 />
          </div>
        ) : (
          <div className='flex w-full flex-col p-1 md:flex-row md:p-5'>
            <div className='sm:w-full md:w-[60%]'>
              <div className='z-0'>
                {/* odds match data */}

                <MatchOdd
                  matchOddsList={matchOddsList}
                  gameid={gameid}
                  match={match}
                />
                <TiedMatch
                  tiedMatchList={tiedMatchList}
                  gameid={gameid}
                  match={match}
                />
                <BookMaker
                  BookmakerList={BookmakerList}
                  gameid={gameid}
                  match={match}
                />

                <div className='mt-2'>
                  {fancy1Data.length > 0 &&
                    fancy1Data[0]?.team?.split('(')[0]?.includes('Toss') && (
                      <div>
                        <div className='mx-auto bg-gray-200 text-[13px]'>
                          <div className='flex items-center justify-between rounded-t-md bg-white'>
                            <div className='bg-blue flex gap-3 rounded-tr-3xl p-2 px-4 font-bold text-white'>
                              <span>Which Team Will Win The Toss </span>

                              <span className='mt-1 text-lg font-black'>
                                <HiOutlineExclamationCircle />
                              </span>
                            </div>
                            <div className='font-bold'>
                              {fancy1Data[0].min} -{' '}
                              {formatToK(fancy1Data[0]?.max)}
                            </div>
                          </div>

                          {fancy1Data[0]?.status === 'SUSPENDED' ? (
                            <div className='relative mx-auto border-2 border-red-500'>
                              <div className='justify-centerz-10 absolute flex h-full w-full items-center bg-[#e1e1e17e]'>
                                <p className='absolute left-1/2 -translate-x-1/2 transform text-3xl font-bold text-red-700'>
                                  SUSPENDED
                                </p>
                              </div>
                              <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                                <div className='flex justify-around p-3'>
                                  <div className='text-center'>
                                    <p className='font-semibold'>
                                      {' '}
                                      {fancy1Data[0]?.team?.split('(')[0]}
                                    </p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        {fancy1Data[0]?.odds[0].odds}
                                      </span>
                                      <span className='text-[10px]'>
                                        {' '}
                                        {fancy1Data[0]?.odds[0].size}
                                      </span>
                                    </span>
                                  </div>
                                  <div className='text-center'>
                                    <p className='font-semibold'>
                                      {fancy1Data[1]?.team?.split('(')[0]}
                                    </p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        1.5
                                      </span>
                                      <span className='text-[10px]'>3m</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                              <div className='flex justify-around p-3'>
                                <div className='grid justify-items-center text-center'>
                                  <p className='text-xs font-semibold'>
                                    {' '}
                                    {fancy1Data[0]?.team?.split('(')[0]}
                                  </p>
                                  <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                    <span className='text-[13px] font-semibold'>
                                      {fancy1Data[0]?.odds[0].odds}
                                    </span>
                                    <span className='text-[10px]'>
                                      {' '}
                                      {fancy1Data[0]?.odds[0].size}
                                    </span>
                                  </span>
                                  <span>
                                    {tossTeamamo(
                                      'Toss',
                                      fancy1Data[0]?.team?.split('(')[0]
                                    )}
                                  </span>
                                  {(() => {
                                    const { netOutcome, hasExistingBet } =
                                      getTossBetDetails(
                                        pendingBet,
                                        'Toss',
                                        fancy1Data[0]?.team?.split('(')[0]
                                      );
                                    if (hasExistingBet && netOutcome !== null) {
                                      return (
                                        <span
                                          className={`text-xs font-bold ${
                                            netOutcome >= 0
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                          }`}
                                        >
                                          {netOutcome}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>

                                <div className='grid justify-items-center text-center'>
                                  <p className='text-xs font-bold md:text-[11px]'>
                                    {' '}
                                    {fancy1Data[1]?.team?.split('(')[0]}
                                  </p>
                                  <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                    <span className='text-[13px] font-semibold'>
                                      {fancy1Data[1]?.odds[0].odds}
                                    </span>
                                    <span className='text-[10px]'>
                                      {' '}
                                      {fancy1Data[1]?.odds[0].size}
                                    </span>
                                  </span>
                                  {(() => {
                                    const { netOutcome, hasExistingBet } =
                                      getTossBetDetails(
                                        pendingBet,
                                        'Toss',
                                        fancy1Data[1]?.team?.split('(')[0]
                                      );
                                    if (hasExistingBet && netOutcome !== null) {
                                      return (
                                        <span
                                          className={`text-xs font-bold ${
                                            netOutcome >= 0
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                          }`}
                                        >
                                          {netOutcome}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
                {/* 1st 6 over matches */}
                <div className='mt-2'>
                  {over6Data.length > 0 &&
                    over6Data[0]?.team?.split('(')[0]?.includes('6 over') && (
                      <div>
                        <div className='mx-auto bg-gray-200 text-[13px]'>
                          <div className='flex items-center justify-between rounded-t-md bg-white'>
                            <div className='bg-blue flex gap-3 rounded-tr-3xl p-2 px-4 font-bold text-white'>
                              <span>Highest Score In 1st 6 Over </span>

                              <span className='mt-1 text-lg font-black'>
                                <HiOutlineExclamationCircle />
                              </span>
                            </div>
                            <div className='font-bold'>
                              {over6Data[0].min} -{' '}
                              {formatToK(over6Data[0]?.max)}
                            </div>
                          </div>

                          {over6Data[0]?.status === 'SUSPENDED' ? (
                            <div className='relative mx-auto border-2 border-red-500'>
                              <div className='justify-centerz-10 absolute flex h-full w-full items-center bg-[#e1e1e17e]'>
                                <p className='absolute left-1/2 -translate-x-1/2 transform text-3xl font-bold text-red-700'>
                                  SUSPENDED
                                </p>
                              </div>
                              <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                                <div className='flex justify-around p-3'>
                                  <div className='text-center'>
                                    <p className='font-semibold'>
                                      {' '}
                                      {over6Data[0]?.team?.split('(')[0]}
                                    </p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        {over6Data[0]?.odds[0].odds}
                                      </span>
                                      <span className='text-[10px]'>
                                        {' '}
                                        {over6Data[0]?.odds[0].size}
                                      </span>
                                    </span>
                                  </div>
                                  <div className='text-center'>
                                    <p className='font-semibold'>Kolkata</p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        1.5
                                      </span>
                                      <span className='text-[10px]'>3m</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                              <div className='flex justify-around p-3'>
                                <div className='text-center'>
                                  <p className='font-semibold'>
                                    {' '}
                                    {over6Data[0]?.team?.split('(')[0]}
                                  </p>
                                  <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                    <span className='text-[13px] font-semibold'>
                                      {over6Data[0]?.odds[0].odds}
                                    </span>
                                    <span className='text-[10px]'>
                                      {' '}
                                      {over6Data[0]?.odds[0].size}
                                    </span>
                                  </span>
                                  {(() => {
                                    const { netOutcome, hasExistingBet } =
                                      getTossBetDetails(
                                        pendingBet,
                                        '1st 6 over',
                                        over6Data[0]?.team
                                      );
                                    if (hasExistingBet && netOutcome !== null) {
                                      return (
                                        <span
                                          className={`text-xs font-bold ${
                                            netOutcome >= 0
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                          }`}
                                        >
                                          {netOutcome}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                                <div className='text-center'>
                                  <p className='font-semibold'>
                                    {' '}
                                    {over6Data[1]?.team?.split('(')[0]}
                                  </p>
                                  <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                    <span className='text-[13px] font-semibold'>
                                      {over6Data[1]?.odds[0].odds}
                                    </span>
                                    <span className='text-[10px]'>
                                      {' '}
                                      {over6Data[1]?.odds[0].size}
                                    </span>
                                  </span>
                                  {/* Show bet amount for THIS team */}
                                  {(() => {
                                    const { netOutcome, hasExistingBet } =
                                      getTossBetDetails(
                                        pendingBet,
                                        '1st 6 over',
                                        over6Data[1]?.team
                                      );
                                    if (hasExistingBet && netOutcome !== null) {
                                      return (
                                        <span
                                          className={`text-xs font-bold ${
                                            netOutcome >= 0
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                          }`}
                                        >
                                          {netOutcome}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
                {/*fancy  */}

                <main className='mt-2 h-full bg-gray-100'>
                  <div className='mx-auto w-full overflow-hidden rounded-md bg-white'>
                    <div className='flex gap-1 text-xs md:text-sm'>
                      <button
                        className={`flex items-center rounded-tl-2xl px-4 py-2 ${
                          activeTab === 'fancy'
                            ? 'bg-color text-white'
                            : 'bg-color text-white'
                        }`}
                        onClick={() => setActiveTab('fancy')}
                      >
                        <span className='font-bold'>Fancy Bet</span>
                        <BiInfoCircle size={16} className='ml-2' />
                      </button>
                      <button
                        className={`flex items-center rounded-tl-2xl px-4 py-2 ${
                          activeTab === 'sportsbook'
                            ? 'bg-orange text-white'
                            : 'bg-orange text-white'
                        }`}
                        onClick={() => setActiveTab('sportsbook')}
                      >
                        <span className='font-bold'>Sportsbook</span>
                        <BiInfoCircle size={16} className='ml-2' />
                      </button>
                    </div>

                    {activeTab === 'fancy' && (
                      <>
                        <div className='bg-color flex justify-start gap-1 overflow-x-auto scroll-smooth px-2 py-1 whitespace-nowrap text-white'>
                          {subTabs.map((tab) => (
                            <button
                              key={tab.id}
                              className={`px-2 py-1 text-xs ${
                                activeSubTab === tab.id
                                  ? 'rounded-t-md bg-white text-xs font-medium text-black'
                                  : ''
                              }`}
                              onClick={() => setActiveSubTab(tab.id)}
                            >
                              {tab.name}
                            </button>
                          ))}
                        </div>

                        <div className='overflow-x-auto'>
                          <div className='w-full text-xs'>
                            <div className=''>
                              <div className='grid grid-cols-6 border-b border-gray-400 text-xs'>
                                <span className='col-span-4 px-4 py-2 text-left md:col-span-3'></span>
                                <span className='col-span-1 bg-[#72bbef] px-4 py-2 text-center'>
                                  Yes
                                </span>
                                <span className='col-span-1 w-full bg-[#faa9ba] px-4 py-2 text-center'>
                                  No
                                </span>

                                <span className='col-span-1 hidden px-4 py-2 text-center md:block'>
                                  Min/Max
                                </span>
                              </div>
                            </div>
                            <div>
                              {fancy2Data.length > 0 ? (
                                fancy2Data.map(
                                  (
                                    { team, odds, sid, min, max, status },
                                    index
                                  ) => (
                                    <div key={index} className='w-full'>
                                      <div className='grid grid-cols-6'>
                                        <span className='col-span-4 border-b border-gray-400 px-2 py-1 text-sm font-bold md:col-span-2 md:text-[11px]'>
                                          {team}
                                          <div className='flex items-center'>
                                            <p className='text-green-500'>
                                              {
                                                pendingBet
                                                  ?.filter(
                                                    (item) =>
                                                      item.gameType ===
                                                        activeSubTab &&
                                                      item.teamName?.toLowerCase() ===
                                                        team?.toLowerCase()
                                                  )
                                                  .reduce(
                                                    (sum, item) =>
                                                      sum +
                                                      (item.totalPrice ||
                                                        '0.00'),
                                                    ''
                                                  ) // Changed initial value to 0
                                              }
                                            </p>
                                          </div>
                                        </span>
                                        <span className='hidden border-b border-gray-400 px-2 py-1 text-center md:block'>
                                          <button className='rounded bg-gray-700 px-4 py-1 text-xs text-white hover:bg-[#243a48]'>
                                            Book
                                          </button>
                                        </span>
                                        {status === 'SUSPENDED' ? (
                                          <div className='item-center relative col-span-2 flex'>
                                            <div className='justify-centerz-10 absolute flex h-full w-full items-center bg-[#48484869]'>
                                              <p className='absolute left-1/2 -translate-x-1/2 transform text-white'>
                                                SUSPENDED
                                              </p>
                                            </div>

                                            {odds.slice(0, 2).map((odd, i) => (
                                              <span
                                                key={i}
                                                className={`w-full cursor-pointer border-b p-1 text-center ${
                                                  i === 0
                                                    ? 'bg-[#72bbef]'
                                                    : i === 1
                                                      ? 'bg-[#faa9ba]'
                                                      : i === 2
                                                        ? 'bg-[#72bbef]'
                                                        : i === 3
                                                          ? 'bg-[#faa9ba]'
                                                          : i === 4
                                                            ? 'bg-pink-200'
                                                            : 'bg-pink-100'
                                                }`}
                                                // onClick={() => {
                                                //   setSelectedRun(index);
                                                //   setCurrentOdd(odd);
                                                // }}
                                              >
                                                <div className='font-bold'>
                                                  {odd?.odds}
                                                </div>
                                                <div className='text-gray-800'>
                                                  {odd?.size}
                                                </div>
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className='item-center col-span-2 flex'>
                                            {' '}
                                            {/* This was likely col-span-4 (2 back + 2 lay for the actual odds) */}
                                            {odds.map(
                                              (odd, i) =>
                                                // ONLY RENDER IF odd.tno IS 0
                                                odd?.tno === 0 && ( // <-- Added this conditional rendering
                                                  <span
                                                    key={i}
                                                    className={`w-full cursor-pointer border-b p-1 text-center ${
                                                      odd?.otype === 'back'
                                                        ? 'bg-[#72bbef]'
                                                        : 'bg-[#faa9ba]'
                                                    }`}
                                                  >
                                                    <div className='cursor-pointer'>
                                                      <div className='font-bold'>
                                                        <span>{odd?.odds}</span>{' '}
                                                        {/* No need for tno === 0 check here, already filtered */}
                                                      </div>
                                                      <div className='text-gray-800'>
                                                        {odd?.size}
                                                      </div>
                                                    </div>
                                                  </span>
                                                )
                                            )}
                                          </div>
                                        )}
                                        <span className='col-span-1 hidden border-b border-gray-400 px-2 py-1 text-center font-semibold md:block'>
                                          {min} - {formatToK(max)}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )
                              ) : (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className='py-4 text-center text-gray-500'
                                  >
                                    No betting options available for this
                                    category
                                  </td>
                                </tr>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'sportsbook' && (
                      <div className='mt-2 text-xs'>
                        <div className='space-y-3'>
                          {/* Odds/Evens Sections */}
                          {oddsDataraw.map((item, idx) => (
                            <div key={idx} className='overflow-hidden rounded'>
                              <div className='bg-orange px-4 py-2 font-semibold text-white'>
                                {item.title}
                              </div>
                              <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                                <div className='flex justify-around p-3'>
                                  <div className='text-center'>
                                    <p className='font-semibold'>Kolkata</p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        1.5
                                      </span>
                                      <span className='text-[10px]'>3m</span>
                                    </span>
                                  </div>
                                  <div className='text-center'>
                                    <p className='font-semibold'>Kolkata</p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        1.5
                                      </span>
                                      <span className='text-[10px]'>3m</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* 5th Wicket Dismissal Method */}
                          <div className='overflow-hidden rounded'>
                            <div className='bg-orange px-4 py-2 text-xs font-semibold text-white'>
                              KKR 5th Wicket Dismissal Method
                            </div>
                            <div className='divide-y divide-gray-200'>
                              {dismissalData.map((item, idx) => (
                                <div
                                  key={idx}
                                  className='flex items-center justify-between border-b border-gray-500 px-4 py-1 transition'
                                >
                                  <span className='font-medium'>
                                    {item.method}
                                  </span>
                                  <span className='flex w-[100px] flex-col items-center justify-center bg-green-300 p-1 font-semibold'>
                                    {item.odds}
                                    <span className='text-xs'>100K</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </main>
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
                    <div
                      className='flex w-1/3 justify-end p-4 text-end md:w-[40%]'
                      onClick={() => setViewMoreDetail(true)}
                    >
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
                              <div>
                                {/* {item.xValue} */}
                                {item.gameType === 'Normal'
                                  ? `${item.fancyScore}/`
                                  : ''}
                                {item.xValue}
                              </div>
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

                {/* view more popup */}

                {viewMoreDetail && (
                  <div className='modal-overlay fixed h-full'>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className='absolute top-7 left-1/2 max-w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-full md:max-w-6xl'
                    >
                      {/* Header */}
                      <div className='bg-color flex items-center justify-between px-2 py-2.5 text-white'>
                        <h4 className='text-[15px] font-semibold'>
                          View More Bet
                        </h4>
                        <button
                          className='text-md font-bold text-white'
                          onClick={() => setViewMoreDetail(false)}
                        >
                          ×
                        </button>
                      </div>

                      {/* Body */}

                      <div className='p-4'>
                        {loading ? (
                          <div className='flex items-center justify-center py-10'>
                            <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'>
                              Loading...
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className='mb-4 flex flex-col justify-between text-[13px] md:flex-row'>
                              <div className='mb-2 flex items-center justify-center text-[#333] md:mb-0'>
                                <span className='mr-2'>Show</span>
                                <select
                                  className='rounded border border-gray-300 px-2 py-1'
                                  value={entriesPerPage}
                                  onChange={(e) =>
                                    setEntriesPerPage(Number(e.target.value))
                                  }
                                >
                                  <option value='2'>2</option>
                                  <option value='5'>5</option>
                                  <option value='10'>10</option>
                                </select>
                                <span className='ml-2'>entries</span>
                              </div>
                              <div className='flex items-center justify-center'>
                                <span className='mr-2'>Search</span>
                                <input
                                  type='text'
                                  className='rounded border border-gray-300 px-2 py-1'
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                />
                              </div>
                            </div>

                            <table className='block w-full border-collapse overflow-x-auto border border-gray-300 md:table'>
                              <thead className='bg-gray-200'>
                                <tr>
                                  <th className='border border-gray-300 px-[10px] py-[9px]'>
                                    UserName
                                  </th>
                                  <th className='border border-gray-300 px-[10px] py-[9px]'>
                                    Nation
                                  </th>
                                  <th className='border border-gray-300 px-[10px] py-[9px]'>
                                    Amount
                                  </th>
                                  <th className='border border-gray-300 px-[10px] py-[9px]'>
                                    User Rate
                                  </th>
                                  <th className='border border-gray-300 px-[10px] py-[9px]'>
                                    Place Date
                                  </th>
                                  <th className='border border-gray-300 px-[10px] py-[9px]'>
                                    Match Date
                                  </th>
                                  <th className='border border-gray-300 px-[10px] py-[9px]'>
                                    Game Type
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredBetOdd?.length > 0 ? (
                                  filteredBetOdd.map((item, index) => (
                                    <tr
                                      key={index}
                                      className={`text-center ${item.otype === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}
                                    >
                                      <td
                                        className='border border-gray-300 p-2 text-blue-500 uppercase underline'
                                        onClick={() => handelpopup(item.userId)}
                                      >
                                        {item.userName}
                                      </td>
                                      <td className='border border-gray-300 px-[10px] py-[9px]'>
                                        {item.teamName}
                                      </td>
                                      <td className='border border-gray-300 p-2'>
                                        {item.price}
                                      </td>
                                      <td className='border border-gray-300 px-[10px] py-[9px]'>
                                        {item.xValue}
                                      </td>
                                      <td className='border border-gray-300 px-[10px] py-[9px] uppercase'>
                                        {new Date(
                                          item.createdAt
                                        ).toLocaleString('en-IN')}
                                      </td>
                                      <td className='border border-gray-300 px-[10px] py-[9px] uppercase'>
                                        {new Date(
                                          item.updatedAt
                                        ).toLocaleString('en-IN')}
                                      </td>
                                      <td className='border border-gray-300 px-[10px] py-[9px] uppercase'>
                                        {item.gameType}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan='7'
                                      className='border border-gray-300 px-[10px] py-[9px] text-center'
                                    >
                                      No Detail found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}

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
                      <div className='modal-header bg-color flex items-center justify-between'>
                        <span> Market List</span>
                        <span
                          className='text-lg'
                          onClick={() => setMasterpopup(false)}
                        >
                          {' '}
                          ×
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
                          {tiedMatch?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hemdelMasterBook(
                                  '',
                                  tiedMatch[0]?.gameType,
                                  tiedMatchList
                                )
                              }
                            >
                              {tiedMatch[0]?.gameType}
                            </h2>
                          )}
                          {Bookmaker?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hemdelMasterBook(
                                  '',
                                  Bookmaker[0]?.gameType,
                                  BookmakerList
                                )
                              }
                            >
                              {Bookmaker[0]?.gameType}
                            </h2>
                          )}
                          {Toss?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hemdelMasterBook('', Toss[0]?.gameType, Toss)
                              }
                            >
                              {/* {Toss[0]?.gameType} */}
                              Which Team Will Win The Toss
                            </h2>
                          )}
                          {first6over?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hemdelMasterBook(
                                  '',
                                  first6over[0]?.gameType,
                                  first6over
                                )
                              }
                            >
                              {/* {Toss[0]?.gameType} */}
                              Highest Score In 1st 6 Over
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
                      <div className='modal-header bg-color flex items-center justify-between border-b p-3'>
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
                      <div className='modal-header bg-color flex items-center justify-between'>
                        <span> Market List</span>
                        <span
                          className='text-2xl'
                          onClick={() => setUserMasterpopup(false)}
                        >
                          {' '}
                          ×
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
                          {tiedMatch?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hendalUserBetsData(
                                  tiedMatch[0]?.gameType,
                                  userInfo.code,
                                  tiedMatchList
                                )
                              }
                            >
                              {tiedMatch[0]?.gameType}
                            </h2>
                          )}
                          {Bookmaker?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hendalUserBetsData(
                                  Bookmaker[0]?.gameType,
                                  userInfo.code,
                                  BookmakerList
                                )
                              }
                            >
                              {Bookmaker[0]?.gameType}
                            </h2>
                          )}
                          {Toss?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hendalUserBetsData(
                                  Toss[0]?.gameType,
                                  userInfo.code,
                                  Toss
                                )
                              }
                            >
                              {/* {Toss[0]?.gameType} */}
                              Which Team Will Win The Toss
                            </h2>
                          )}
                          {first6over?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hendalUserBetsData(
                                  first6over[0]?.gameType,
                                  userInfo.code,
                                  first6over
                                )
                              }
                            >
                              {/* {first6over[0]?.gameType} */}
                              Highest Score In 1st 6 Over
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
                      <div className='modal-header bg-color flex items-center justify-between'>
                        <span> User Book</span>
                        <span
                          className='text-2xl'
                          onClick={() => setUserBet(null)}
                        >
                          {' '}
                          ×
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
                                      const betMatchesAnyTeam =
                                        teamHeaders.some(
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
                <div className='bg-opacity-50 fixed inset-0 z-9999 flex items-start justify-center bg-[#0000005d]'>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className='mt-7 w-[96%] rounded-lg bg-white shadow-lg md:w-150'
                  >
                    {/* Header */}
                    <div className='bg-color flex items-center justify-between px-4 py-1.5 font-bold text-white'>
                      <span>Parent List</span>
                      <button
                        onClick={() => setPopup(false)}
                        className='text-xl text-white'
                      >
                        ×
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
    </div>
  );
}
