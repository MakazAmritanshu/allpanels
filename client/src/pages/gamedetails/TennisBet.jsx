// import React,{useState, useEffect,useRef} from 'react'
// import { useNavigate, useParams } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';
// import { createBet, getPendingBetAmo, messageClear } from '../../redux/reducer/betReducer';
// import { getUser } from '../../redux/reducer/authReducer';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import { fetchTannisBatingData } from '../../redux/reducer/tennisSlice';
// import { getPendingBet } from '../../redux/reducer/betReducer';
// import MatchOdds from './MatchOdds'
// import Bookmaker from './Bookmaker'
// import MatchedBet from './MatchedBet'
// import PlaceBet from './PlaceBet'
// import { host } from '../../redux/api';
// function TennisBet() {
//     const {game, id} = useParams()
//     const location = useLocation();
//     const time = location.state?.time;
//     const gameid= id;
//     const match =game;
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [bettingData, setBettingData] = useState(null);
//     const hasCheckedRef = useRef(false);
//     const [showodds, setshowodds] = useState(true)
//     const [selectedBet, setSelectedBet] = useState(null)
//     // Extract team names from match title
//     const matchTitle = "Paarl Royals v Joburg Super Kings"
//     const teams = matchTitle.split(' v ')
//     const team1 = teams[0] || "Team 1"
//     const team2 = teams[1] || "Team 2"
//     console.log(showodds)
//     const { loading, successMessage, errorMessage, pendingBetAmounts } = useSelector(
//         (state) => state.bet
//       );
//     const { battingData } = useSelector((state) => state.tennis);
//     const { userInfo } = useSelector((state) => state.auth);
//     const sharedSocketRef = useRef(null);

//     const handleBetSelect = (betData) => {
//         setSelectedBet(betData)
//     }

//     const handleBetChange = (updatedBet) => {
//         setSelectedBet(updatedBet)
//     }

//     useEffect(() => {
//         const handleResize = () => {
//             if (window.innerWidth >= 1024) {
//                 setshowodds(true)
//             }
//         }

//         window.addEventListener('resize', handleResize)
//         return () => window.removeEventListener('resize', handleResize)
//     }, [])

//     useEffect(() => {
//         if (!gameid) return;

//         const sharedSocket = sharedSocketRef.current;
//         if (!sharedSocket || sharedSocket.readyState !== 1) {
//           sharedSocketRef.current = new WebSocket(host);

//           sharedSocketRef.current.onopen = () => {
//             console.log('✅ Socket connected');
//             sharedSocketRef.current.send(
//               JSON.stringify({
//                 type: 'subscribe',
//                 gameid,
//                 apitype: 'tennis',
//                 userId: userInfo?._id,
//               })
//             );
//           };

//           sharedSocketRef.current.onmessage = (event) => {
//             try {
//               const message = JSON.parse(event.data);
//               if (message.gameid === gameid) {
//                 setBettingData(message.data);
//               }
//             } catch (e) {
//               console.error('❌ Message error', e);
//             }
//           };

//           sharedSocketRef.current.onerror = (err) => {
//             console.error('WebSocket error:', err);
//           };

//           sharedSocketRef.current.onclose = () => {
//             console.log('Socket closed');
//           };
//         } else {
//           // Already connected, just send subscription
//           sharedSocketRef.current.send(
//             JSON.stringify({
//               type: 'subscribe',
//               gameid,
//               apitype: 'tennis',
//               userId: userInfo?._id,
//             })
//           );
//         }

//         return () => {
//           // Optionally leave socket open for reuse
//         };
//       }, [gameid, userInfo?._id]);

//       useEffect(() => {
//         if (gameid) {
//           console.log('The gameId is', gameid);
//           dispatch(fetchTannisBatingData(gameid)); // initial
//         }
//       }, [gameid, dispatch]);

//       useEffect(() => {
//         setBettingData(battingData);
//       }, [battingData]);
//       useEffect(() => {
//         dispatch(getPendingBetAmo(gameid));
//       }, [dispatch, gameid]);

//       // Show toast messages for success/error (centralized to prevent duplicates)
//       useEffect(() => {
//         if (successMessage) {
//           toast.success(successMessage);
//           dispatch(messageClear());
//           // Hide PlaceBet component when bet is successfully placed
//           setSelectedBet(null);
//         }
//         if (errorMessage) {
//           toast.error(errorMessage);
//           dispatch(messageClear());
//         }
//       }, [successMessage, errorMessage, dispatch]);

//       const matchOddsList = Array.isArray(bettingData)
//         ? bettingData.filter((item) => item.mname === 'MATCH_ODDS')
//         : [];

//       console.log('this is matchOddsList', matchOddsList);

//       console.log('bettingData', bettingData);

//     //   const oddsData =
//     //     Array.isArray(matchOddsList) &&
//     //     matchOddsList.length > 0 &&
//     //     matchOddsList[0].section
//     //       ? matchOddsList[0].section.map((sec) => ({
//     //           team: sec.nat,
//     //           sid: sec.sid,
//     //           odds: sec.odds,
//     //           mname: 'Match Odds', // ✅ Access from first item
//     //           status: matchOddsList[0].status, // ✅ Access from first item
//     //         }))
//     //       : [];
//   return (
//     <div className='flex mt-0.5 gap-px'>
//         <div className='w-full lg:w-[calc(100%-352px)] ml-0 md:ml-1'>
//             <div className='flex justify-between items-center bg-secondary text-secondary text-[12px] lg:text-[15px] font-bold p-1'>
//                 <span>{game}</span>
//                 <span>{time}</span>
//             </div>
//             <div className='flex lg:hidden bg-primary text-primary justify-around items-center  text-[12px] font-bold'>
//                 <div className={`p-2 w-full border-r border-r-[#FFFFFF] flex justify-center items-center ${showodds?"border-t-2 border-t-[#cccccc]":""}`}
//                 onClick={()=>setshowodds(true)}
//                 >ODDS</div>
//                 <div className={`p-2 w-full flex justify-center items-center ${showodds?"":"border-t-2 border-t-[#cccccc]"}`}
//                 onClick={()=>setshowodds(false)}
//                 >MATCHED BET(0)</div>
//             </div>

//             {showodds && (
//                 <div>
//                 {/** Match Odds */}
//                 {matchOddsList.length > 0 && <MatchOdds onBetSelect={handleBetSelect} matchOddsList={matchOddsList} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

//                 {/** Bookmaker */}
//                 {/* {BookmakerList.length > 0 && <Bookmaker onBetSelect={handleBetSelect} BookmakerList={BookmakerList} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>} */}

//                 </div>
//             )}
//             {!showodds && (
//                 <div className='block lg:hidden'>
//                     <MatchedBet gameid={gameid}/>
//                 </div>
//             )}

//         </div>
//         <div className='hidden lg:block  h-fit sticky top-0'>
//             <div className='w-[350px]'>
//                 <div className=''>
//                     <PlaceBet
//                         selectedBet={selectedBet}
//                         onBetChange={handleBetChange}
//                         team1={team1}
//                         team2={team2}
//                         gameId={gameid}
//                         eventName={match}
//                         marketName={selectedBet?.marketName}
//                         gameType={selectedBet?.gameType}
//                         gameName="Tennis Game"
//                         maxAmount={selectedBet?.maxAmount}
//                         minAmount={selectedBet?.minAmount}
//                         fancyScore={selectedBet?.fancyScore}
//                     />
//                 </div>
//                 <div className='bg-secondary text-secondary p-1'>
//                     <span className='font-bold'>My Bet</span>
//                 </div>
//                 <MatchedBet gameid={gameid}/>

//             </div>
//         </div>

//         {/* Mobile PlaceBet Modal */}
//         {selectedBet && (
//             <>
//                 {/* Backdrop */}
//                 <div
//                     className='block lg:hidden fixed inset-0 bg-black/60 bg-opacity-50 z-40'
//                     onClick={() => setSelectedBet(null)}
//                 ></div>
//                 {/* Modal */}
//                 <div className='block lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-lg max-h-screen overflow-y-auto'>
//                     <PlaceBet
//                         selectedBet={selectedBet}
//                         onBetChange={handleBetChange}
//                         onClose={() => setSelectedBet(null)}
//                         isMobile={true}
//                         team1={team1}
//                         team2={team2}
//                         gameId={gameid}
//                         eventName={match}
//                         marketName={selectedBet?.marketName}
//                         gameType={selectedBet?.gameType}
//                         gameName="Tennis Game"
//                         maxAmount={selectedBet?.maxAmount}
//                         minAmount={selectedBet?.minAmount}
//                         fancyScore={selectedBet?.fancyScore}
//                     />
//                 </div>
//             </>
//         )}

//     </div>
//   )
// }

// export default TennisBet

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {
  createBet,
  getPendingBetAmo,
  messageClear,
} from '../../redux/reducer/betReducer';
import { getUser } from '../../redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaTv } from 'react-icons/fa6';
import axios from 'axios';
import { fetchTannisBatingData } from '../../redux/reducer/tennisSlice';
import { getPendingBet } from '../../redux/reducer/betReducer';
import MatchOdds from './MatchOdds';
import Bookmaker from './Bookmaker';
import MatchedBet from './MatchedBet';
import PlaceBet from './PlaceBet';
import { host } from '../../redux/api';
function TennisBet() {
  const key_new = import.meta.env.VITE_LIVE_STREAM_KEY_NEW;
  const { game, id } = useParams();
  const location = useLocation();
  const time = location.state?.time;
  const gameid = id;
  const match = game;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [bettingData, setBettingData] = useState(null);
  const hasCheckedRef = useRef(false);
  const [showodds, setshowodds] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [showlivetv, setshowlivetv] = useState(false);
  const [isScoreCardAvailable, setIsScoreCardAvailable] = useState(true);
  const [isCheckingScoreCard, setIsCheckingScoreCard] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  // Extract team names from match title
  const matchTitle = 'Paarl Royals v Joburg Super Kings';
  const teams = matchTitle.split(' v ');
  const team1 = teams[0] || 'Team 1';
  const team2 = teams[1] || 'Team 2';
  console.log(showodds);
  const { loading, successMessage, errorMessage, pendingBetAmounts } =
    useSelector((state) => state.bet);
  const { battingData } = useSelector((state) => state.tennis);
  const { userInfo } = useSelector((state) => state.auth);
  const sharedSocketRef = useRef(null);

  const handleBetSelect = (betData) => {
    setSelectedBet(betData);
  };

  const handleBetChange = (updatedBet) => {
    setSelectedBet(updatedBet);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setshowodds(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!gameid) return;

    const sharedSocket = sharedSocketRef.current;
    if (!sharedSocket || sharedSocket.readyState !== 1) {
      sharedSocketRef.current = new WebSocket(host);

      sharedSocketRef.current.onopen = () => {
        console.log('✅ Socket connected');
        sharedSocketRef.current.send(
          JSON.stringify({
            type: 'subscribe',
            gameid,
            apitype: 'tennis',
            userId: userInfo?._id,
          })
        );
      };

      sharedSocketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.gameid === gameid) {
            setBettingData(message.data);
          }
        } catch (e) {
          console.error('❌ Message error', e);
        }
      };

      sharedSocketRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
      };

      sharedSocketRef.current.onclose = () => {
        console.log('Socket closed');
      };
    } else {
      // Already connected, just send subscription
      sharedSocketRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          gameid,
          apitype: 'tennis',
          userId: userInfo?._id,
        })
      );
    }

    return () => {
      // Optionally leave socket open for reuse
    };
  }, [gameid, userInfo?._id]);

  useEffect(() => {
    if (gameid) {
      console.log('The gameId is', gameid);
      dispatch(fetchTannisBatingData(gameid)); // initial
    }
  }, [gameid, dispatch]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);
  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
    dispatch(getPendingBet(gameid));
  }, [dispatch, gameid]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      setSelectedBet(null);
      if (gameid) {
        dispatch(getPendingBetAmo(gameid));
        dispatch(getPendingBet(gameid));
      }
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, gameid]);

  const checkscorecardavailability = async () => {
    if (!gameid) return;
    setIsCheckingScoreCard(true);
    try {
      const response = await axios.get(
        `https://bulkapi.co.in/api/v1/live-scorecard?key=${key_new}&gmid=${gameid}&sportid=2`
      );
      const html = String(response?.data || '').toLowerCase();
      const isUnavailable =
        html.includes('live score not available') ||
        html.includes('alt="live score not available"');
      setIsScoreCardAvailable(!isUnavailable);
    } catch (error) {
      console.error('error in checking score card availability', error);
      setIsScoreCardAvailable(false);
    } finally {
      setIsCheckingScoreCard(false);
    }
  };

  useEffect(() => {
    checkscorecardavailability();
  }, [gameid]);

  useEffect(() => {
    const fetchLiveStreamUrl = async () => {
      if (!gameid || !key_new) return;

      setIsLoadingStream(true);
      try {
        const response = await axios.get(
          'https://bulkapi.co.in/api/v1/live-stream',
          {
            params: {
              key: key_new,
              gmid: gameid,
            },
          }
        );

        if (response?.data?.url) {
          setLiveStreamUrl(response.data.url);
        } else if (response?.data?.data?.url) {
          setLiveStreamUrl(response.data.data.url);
        } else if (typeof response?.data === 'string') {
          setLiveStreamUrl(response.data);
        }
      } catch (error) {
        console.error('Error fetching live stream URL:', error);
        setLiveStreamUrl(
          `https://bulkapi.co.in/api/v1/live-stream?gmid=${gameid}&key=${key_new}`
        );
      } finally {
        setIsLoadingStream(false);
      }
    };

    fetchLiveStreamUrl();
  }, [gameid, key_new]);

  const matchOddsList = Array.isArray(bettingData)
    ? bettingData.filter((item) => item.mname === 'MATCH_ODDS')
    : [];

  console.log('this is matchOddsList', matchOddsList);

  console.log('bettingData', bettingData);

  //   const oddsData =
  //     Array.isArray(matchOddsList) &&
  //     matchOddsList.length > 0 &&
  //     matchOddsList[0].section
  //       ? matchOddsList[0].section.map((sec) => ({
  //           team: sec.nat,
  //           sid: sec.sid,
  //           odds: sec.odds,
  //           mname: 'Match Odds', // ✅ Access from first item
  //           status: matchOddsList[0].status, // ✅ Access from first item
  //         }))
  //       : [];
  return (
    <div className='mt-0.5 flex gap-px'>
      <div className='ml-0 w-full md:ml-1 lg:w-[calc(100%-352px)]'>
        <div className='bg-secondary text-secondary flex items-center justify-between p-1 text-[12px] font-bold lg:text-[15px]'>
          <span>{game}</span>
          <span>{time}</span>
        </div>
        <div className='bg-primary text-primary flex items-center justify-around text-[12px] font-bold lg:hidden'>
          <div
            className={`flex w-full items-center justify-center border-r border-r-[#FFFFFF] p-2 ${showodds ? 'border-t-2 border-t-[#cccccc]' : ''}`}
            onClick={() => {
              setshowodds(true);
              setShowLive(false);
            }}
          >
            ODDS
          </div>
          <div
            className={`flex w-full items-center justify-center border-r border-r-[#FFFFFF] p-2 ${showodds ? '' : 'border-t-2 border-t-[#cccccc]'}`}
            onClick={() => setshowodds(false)}
          >
            MATCHED BET(0)
          </div>
          <div
            className='flex w-full cursor-pointer items-center justify-center p-2'
            onClick={() => {
              setShowLive(true);
              setshowodds(true);
            }}
          >
            <FaTv className='text-sm' />
          </div>
        </div>

        {showodds && (
          <div>
            {!showLive && !isCheckingScoreCard && isScoreCardAvailable && (
              <iframe
                src={`https://bulkapi.co.in/api/v1/live-scorecard?key=${key_new}&gmid=${gameid}&sportid=2`}
                allowFullScreen
                className='w-full'
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
            )}
            {showLive && (
              <div className='w-full'>
                {isLoadingStream ? (
                  <div className='flex h-[50vh] w-full items-center justify-center bg-gray-200'>
                    <span>Loading stream...</span>
                  </div>
                ) : (
                  <iframe
                    src={
                      liveStreamUrl ||
                      `https://bulkapi.co.in/api/v1/live-stream?gmid=${gameid}&key=${key_new}`
                    }
                    title='Watch Live'
                    className='w-full'
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
                )}
              </div>
            )}
            {/** Match Odds */}
            {matchOddsList.length > 0 && (
              <MatchOdds
                gameid={gameid}
                onBetSelect={handleBetSelect}
                matchOddsList={matchOddsList}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Bookmaker */}
            {/* {BookmakerList.length > 0 && <Bookmaker onBetSelect={handleBetSelect} BookmakerList={BookmakerList} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>} */}
          </div>
        )}
        {!showodds && (
          <div className='block lg:hidden'>
            <MatchedBet gameid={gameid} />
          </div>
        )}
      </div>
      <div className='sticky top-0 hidden h-fit lg:block'>
        <div className='w-[350px]'>
          <div className='mb-1'>
            <div
              className='bg-secondary text-secondary cursor-pointer p-1'
              onClick={() => setshowlivetv((prev) => !prev)}
            >
              <span className='font-bold'>Live Match</span>
            </div>
            {showlivetv && (
              <div className='w-full'>
                {isLoadingStream ? (
                  <div className='flex h-[50vh] w-full items-center justify-center bg-gray-200'>
                    <span>Loading stream...</span>
                  </div>
                ) : (
                  <iframe
                    src={
                      liveStreamUrl ||
                      `https://bulkapi.co.in/api/v1/live-stream?gmid=${gameid}&key=${key_new}`
                    }
                    title='Watch Live'
                    className='w-full'
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
                )}
              </div>
            )}
          </div>
          <div className=''>
            <PlaceBet
              selectedBet={selectedBet}
              onBetChange={handleBetChange}
              onClose={() => setSelectedBet(null)}
              team1={team1}
              team2={team2}
              gameId={gameid}
              eventName={match}
              sid={2}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Tennis Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
              fancyScore={selectedBet?.fancyScore}
            />
          </div>
          <div className='bg-secondary text-secondary p-1'>
            <span className='font-bold'>My Bet</span>
          </div>
          <MatchedBet gameid={gameid} />
        </div>
      </div>

      {/* Mobile PlaceBet Modal */}
      {selectedBet && (
        <>
          {/* Backdrop */}
          <div
            className='bg-opacity-50 fixed inset-0 z-40 block bg-black/60 lg:hidden'
            onClick={() => setSelectedBet(null)}
          ></div>
          {/* Modal */}
          <div className='fixed top-0 right-0 left-0 z-50 block max-h-screen overflow-y-auto bg-white shadow-lg lg:hidden'>
            <PlaceBet
              selectedBet={selectedBet}
              onBetChange={handleBetChange}
              onClose={() => setSelectedBet(null)}
              isMobile={true}
              team1={team1}
              team2={team2}
              gameId={gameid}
              eventName={match}
              sid={2}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Tennis Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
              fancyScore={selectedBet?.fancyScore}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default TennisBet;
