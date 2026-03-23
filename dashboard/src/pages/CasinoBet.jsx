import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import {
  getPendingBetAmo,
  fetchCasinoBattingData,
  getBetPerents,
  casinoMasterBookReducer,
  casinoMasterBookReducerDownline,
} from '../redux/reducer/marketAnalyzeReducer';

// Components

import VideoStream from './CasinoBet/components/VideoStream';
import RecentResults from './CasinoBet/components/RecentResults';

// Hooks
import useBetting from './CasinoBet/hooks/useBetting';
import useCasinoResults from './CasinoBet/hooks/useCasinoResults';
import useCasinoWebSocket from './CasinoBet/hooks/useCasinoWebSocket';

// Utils & Constants
import { renderGameUI } from './CasinoBet/utils/gameRendererFactory';
import {
  groupBettingData,
  filterPlayersForTwoPlayerGames,
} from './CasinoBet/utils/bettingUtils';
import { TWO_PLAYER_GAMES, getWinnerMap } from './CasinoBet/constants';

import Navbar from '../components/Navbar';
import Spinner2 from '../components/Spinner2';

export default function CasinoBet() {
  const dispatch = useDispatch();
  const { gameid } = useParams() || {};

  // Local state
  const [bettingData, setBettingData] = useState(null);
  const [videoPageLoader, setVideoPageLoader] = useState(true);

  // Refs
  const previousMidRef = useRef(null);
  const hasInitializedRef = useRef(false);

  const {
    loading,
    battingData,
    betsData,
    betPerantsData,
    casinoMasterData,
    casinoMasterDataDownline,
  } = useSelector((state) => state.market);
  const { userInfo } = useSelector((state) => state.auth);

  // Custom hooks
  const betting = useBetting({ gameid, bettingData });
  const results = useCasinoResults({ gameid });

  // WebSocket connection
  const { isConnected } = useCasinoWebSocket({
    gameid,
    userId: userInfo?._id,
    bettingDataMid: bettingData?.mid,
    onBettingDataUpdate: setBettingData,
  });

  // Winner map for result display
  const winnerMap = getWinnerMap(gameid);

  // ============== EFFECTS ==============

  // Fetch betting data when game changes
  useEffect(() => {
    if (gameid) {
      dispatch(getPendingBetAmo(gameid));
    }
  }, [gameid, dispatch]);

  // Sync betting data from Redux
  useEffect(() => {
    setBettingData(battingData?.data);
  }, [battingData]);

  // Reset betting state when game becomes suspended
  useEffect(() => {
    const gstatus = bettingData?.sub?.[0]?.gstatus;
    if (gstatus === 'SUSPENDED') {
      betting.resetBettingState();
    }
  }, [bettingData?.sub, betting.resetBettingState]);

  // Handle round changes - clear bets and refresh data when new round starts

  // ============== DATA PROCESSING ==============

  // Group and filter betting data
  const groupedData = groupBettingData(bettingData?.sub, gameid);
  const displayData = filterPlayersForTwoPlayerGames(
    groupedData,
    gameid,
    bettingData?.sub,
    TWO_PLAYER_GAMES
  );

  // add new code

  const casinoData = battingData;
  const activeCasinoOptions = Array.isArray(battingData?.sub?.[0])
    ? battingData.sub[0]
    : (battingData?.sub?.[0]?.options ?? []);

  const [masterpopup, setMasterpopup] = useState(false);
  const [userMasterpopup, setUserMasterpopup] = useState(false);
  const [liveBets, setLiveBets] = useState([]);
  const [userBet, setUserBet] = useState([]);
  const [storedGameType, setStoredGameType] = useState(null);
  const [storedMatchOddsList, setStoredMatchOddsList] = useState([]);
  const [teamHeaders, setTeamHeaders] = useState([]);
  const [casinoMasterDownline, setCasinoMasterDownline] = useState([]);
  const [popup, setPopup] = useState(false);

  const casinoGameInfo = {
    gameType: casinoData?.gtype || 'Casino',
    card: casinoData?.card || '',
    mid: casinoData?.mid || '',
    min: activeCasinoOptions[0]?.min || 100,
    max: activeCasinoOptions[0]?.max || 300000,
  };
  // For master book functionality - use casino data structure
  const matchOdd = [
    {
      gameType: casinoGameInfo.gameType,
      mname: casinoGameInfo.gameType,
    },
  ];

  const matchOddsList = [
    {
      section: activeCasinoOptions,
      status: 'ACTIVE',
      min: casinoGameInfo.min,
      max: casinoGameInfo.max,
    },
  ];

  useEffect(() => {
    document.body.style.overflow = masterpopup ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [masterpopup]);

  const hendalUserBetsData = (gameType, code, matchOddsList) => {
    console.log('🔍 hendalUserBetsData called with:', {
      gameType,
      code,
      matchOddsList,
    });
    console.log('🔍 betsData:', betsData);
    console.log(
      '🔍 betsData type:',
      typeof betsData,
      'Array:',
      Array.isArray(betsData)
    );
    const userBet = Array.isArray(betsData)
      ? betsData.filter((item) => {
          // Only check gameType, not code

          const gameTypeMatch = item?.gameType === gameType;
          const gameNameMatch = item?.gameName === gameType;
          const eventNameMatch = item?.eventName === gameType;
          const matches = gameTypeMatch || gameNameMatch || eventNameMatch;
          console.log('🔍 Filtering item:', {
            itemGameType: item?.gameType,
            itemGameName: item?.gameName,
            itemEventName: item?.eventName,
            searchGameType: gameType,
            gameTypeMatch,
            gameNameMatch,
            eventNameMatch,
            matches,
          });
          return matches;
        })
      : [];
    console.log('🔍 Filtered userBet:', userBet);
    console.log('🔍 userBet length:', userBet.length);

    userBet.forEach((bet, index) => {
      console.log(`🔍 Bet ${index}:`, {
        userName: bet.userName,
        userRole: bet.userRole,
        otype: bet.otype,
        playerName: bet.playerName,
        totalBetAmount: bet.totalBetAmount,
        totalPrice: bet.totalPrice,
        price: bet.price,
        betAmount: bet.betAmount,
        teamName: bet.teamName,
        gameName: bet.gameName,
        eventName: bet.eventName,
        marketName: bet.marketName,
      });
    });

    // Extract teams from matchOddsList
    const teams = Array.isArray(matchOddsList[0]?.section)
      ? matchOddsList[0].section
          .map((sec) => sec.nat)
          .filter((team) => team.includes('Player'))
      : [];
    setTeamHeaders(teams); // Set teams to render in table header
    // console.log("userbetas", userBet)
    setUserBet(userBet);
    console.log('🔍 Set userBet state to:', userBet);
  };

  const hemdelMasterBook = async (userId, gameType, matchOddsList) => {
    try {
      // Reset UI
      // setMasterDownline([]);
      setCasinoMasterDownline([]);
      setTeamHeaders([]);

      // Use stored values if not passed (for downline use)
      const finalGameType = gameType || storedGameType;

      // Save for future
      if (gameType && matchOddsList) {
        setStoredGameType(gameType);
        setStoredMatchOddsList(matchOddsList);
      }

      // Dispatch reset action if needed
      dispatch({ type: 'RESET_MASTER_BOOK' });

      // Fetch new data
      await dispatch(
        casinoMasterBookReducer({ userId, gameid, gameType: finalGameType })
      );

      // Update headers - use casino active options
      const teams = activeCasinoOptions.map((option) => option.nat);
      setTeamHeaders(teams);
    } catch (error) {
      console.log(error);
    }
  };

  const hemdelMasterBookDownline = async (userId) => {
    try {
      console.log('🎰 [DOWNLINE] Starting downline fetch for userId:', userId);

      // Reset UI
      // setMasterDownline([]);
      setCasinoMasterDownline([]);
      setTeamHeaders([]);

      const finalGameType = storedGameType;
      console.log(
        '🎰 [DOWNLINE] Using gameType:',
        finalGameType,
        'gameid:',
        gameid
      );

      // Dispatch new downline request
      console.log(
        '🎰 [DOWNLINE] Dispatching casinoMasterBookReducerDownline...'
      );
      await dispatch(
        casinoMasterBookReducerDownline({
          userId,
          gameid,
          gameType: finalGameType,
        })
      );

      // Update headers - use casino active options
      const teams = activeCasinoOptions.map((option) => option.nat);
      console.log('🎰 [DOWNLINE] Setting team headers:', teams);
      setTeamHeaders(teams);
    } catch (error) {
      console.log('❌ [DOWNLINE] Error:', error);
    }
  };

  useEffect(() => {
    console.log('🎰 [CASINO MASTER DATA] Received:', casinoMasterData);
    if (casinoMasterData?.length > 0) {
      console.log(
        '🎰 [CASINO MASTER DATA] Setting master downline with',
        casinoMasterData.length,
        'items'
      );
      setCasinoMasterDownline(casinoMasterData); // ⬅️ For first-level data
    }
  }, [casinoMasterData]);

  useEffect(() => {
    console.log(
      '🎰 [CASINO MASTER DATA DOWNLINE] Received:',
      casinoMasterDataDownline
    );
    if (casinoMasterDataDownline?.length > 0) {
      console.log(
        '🎰 [CASINO MASTER DATA DOWNLINE] Setting master downline with',
        casinoMasterDataDownline.length,
        'items'
      );
      setCasinoMasterDownline(casinoMasterDataDownline); // ⬅️ For downline drill
    }
  }, [casinoMasterDataDownline]);

  // Inside your React functional component (e.g., in a file like MyComponent.jsx)
  const handelpopup = async (id) => {
    setPopup(true);
    await dispatch(getBetPerents(id));
    // console.log("idddd", id);
  };
  const pratnerShip = (role, amount, part) => {
    if (role === 'user') {
      return amount;
    } else {
      return Math.floor(amount * ((100 - part) / 100));
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
        <div className='flex w-full flex-col gap-1 px-1 md:flex-row md:px-4'>
          <div className='sm:w-full md:w-[60%]'>
            <VideoStream
              gameid={gameid}
              bettingData={bettingData}
              showWinner={results.showWinner}
              winnerLabel={winnerMap[results.resultData?.res?.[0]?.win]}
            />

            {/* Game-Specific Betting UI */}
            <div>
              {bettingData?.sub &&
                renderGameUI({
                  gameid,
                  displayData,
                  bettingData,
                  resultData: results.resultData,
                  betControl: betting.betControl,
                  setBetControl: betting.setBetControl,
                  setValue: betting.setValue,
                  setSelectedTeamSubtype: betting.setSelectedTeamSubtype,
                  betAmount: betting.betAmount,
                  betOdds: betting.betOdds,
                  setBetOdds: betting.setBetOdds,
                  updateAmount: betting.updateAmount,
                  placeBet: betting.placeBet,
                  loading: betting.loading,
                  pendingBetAmounts: betting.pendingBetAmounts,
                  selectedTeamSubtype: betting.selectedTeamSubtype,
                  resetBettingState: betting.resetBettingState,
                  hasPendingBetForControl: betting.hasPendingBetForControl,
                })}
            </div>
          </div>

          <div className='md-mt-0 sm:w-full md:w-[40%]'>
            <div>
              <div className='bg-white'>
                <div className='bg-dark cursor-pointer rounded-t-md px-2 py-1 font-semibold text-white'>
                  Book
                </div>
                <div className='flex w-full justify-between p-2'>
                  <button
                    className='bg-dark w-[49%] cursor-pointer rounded-md px-2 py-1 font-semibold text-white'
                    onClick={() => setMasterpopup(true)}
                  >
                    Master Book
                  </button>
                  <button
                    className='bg-dark w-[49%] cursor-pointer rounded-md px-4 py-1 font-semibold text-white'
                    onClick={() => setUserMasterpopup(true)}
                  >
                    User Book
                  </button>
                </div>
              </div>
              <div className='mt-4 bg-white'>
                <div className='bg-dark flex w-full cursor-pointer justify-between rounded-t-md p-2 py-1 text-white md:px-2'>
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
                    <div className='modal-header bg-color flex items-center justify-between'>
                      <span>Market List</span>
                      <span
                        className='text-lg'
                        onClick={() => setMasterpopup(false)}
                      >
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
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* master Book popup */}
              {casinoMasterDownline?.length > 0 && (
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
                        onClick={() => setCasinoMasterDownline([])}
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

                            {!loading && casinoMasterDownline?.length > 0 ? (
                              casinoMasterDownline.map((item, index) => (
                                <tr
                                  key={index}
                                  className='text-center text-sm hover:bg-gray-100'
                                >
                                  <td
                                    className='cursor-pointer border p-2 text-blue-500'
                                    onClick={() => {
                                      console.log(
                                        '🎰 [CLICK] Opening downline for user:',
                                        item.userName,
                                        'ID:',
                                        item.id
                                      );
                                      hemdelMasterBookDownline(item.id);
                                    }}
                                  >
                                    {item.userName}
                                  </td>
                                  <td className='border p-2'>
                                    {item.userRole}
                                  </td>
                                  {teamHeaders.map((team, i) => (
                                    <td key={i} className='border p-2'>
                                      {item.otype === 'back' ? (
                                        item.playerName === team ? (
                                          <span className='text-green-600'>
                                            {pratnerShip(
                                              item.userRole,
                                              item.totalBetAmount,
                                              item.partnership || 0
                                            )}
                                          </span>
                                        ) : (
                                          <span className='text-red-500'>
                                            -
                                            {pratnerShip(
                                              item.userRole,
                                              item.totalPrice,
                                              item.partnership || 0
                                            )}
                                          </span>
                                        )
                                      ) : item.playerName === team ? (
                                        <span className='text-red-500'>
                                          -
                                          {pratnerShip(
                                            item.userRole,
                                            item.totalPrice,
                                            item.partnership || 0
                                          )}
                                        </span>
                                      ) : (
                                        <span className='text-green-600'>
                                          {pratnerShip(
                                            item.userRole,
                                            item.totalBetAmount,
                                            item.partnership || 0
                                          )}
                                        </span>
                                      )}
                                    </td>
                                  ))}
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
                      <span>Market List</span>
                      <span
                        className='text-2xl'
                        onClick={() => setUserMasterpopup(false)}
                      >
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
                      <span>User Book</span>
                      <span
                        className='text-2xl'
                        onClick={() => setUserBet(null)}
                      >
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
                                  {teamHeaders.map((team, i) => (
                                    // Around line 1236, replace the existing logic:
                                    <td
                                      key={i}
                                      className='border border-gray-300 p-2'
                                    >
                                      {item.teamName === team ? (
                                        <span
                                          className={
                                            item.otype === 'back'
                                              ? 'text-green-500'
                                              : 'text-red-500'
                                          }
                                        >
                                          {item.otype === 'back'
                                            ? item.betAmount || 0
                                            : -(item.price || 0)}
                                        </span>
                                      ) : (
                                        <span
                                          className={
                                            item.otype === 'back'
                                              ? 'text-red-500'
                                              : 'text-green-500'
                                          }
                                        >
                                          {item.otype === 'back'
                                            ? -(item.price || 0)
                                            : item.betAmount || 0}
                                        </span>
                                      )}
                                    </td>
                                  ))}
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
                    {[...betPerantsData]
                      .slice(0, 2)
                      .reverse()
                      .map((item, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-center border border-gray-300 px-4 py-2 text-center font-semibold'
                        >
                          <span>{item.userName}</span>
                          <span>({item.role.toUpperCase()})</span>
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
