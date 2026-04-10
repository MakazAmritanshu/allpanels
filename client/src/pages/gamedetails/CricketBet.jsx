// import React,{useState, useEffect} from 'react'
// import { useNavigate, useParams,useLocation } from 'react-router-dom';
// import { fetchCricketBatingData } from '../../redux/reducer/cricketSlice';
// import MatchOdds from './MatchOdds'
// import Bookmaker from './Bookmaker'
// import TiedMatch from './TiedMatch'
// import Normal from './Normal'
// import Fancy1 from './Fancy1'
// import Khado from './Khado'
// import OddEven from './OddEven'
// import MatchedBet from './MatchedBet'
// import PlaceBet from './PlaceBet'
// import { getUser } from '../../redux/reducer/authReducer';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//     createBet,
//     createfancyBet,
//     getPendingBetAmo,
//     messageClear,
//   } from '../../redux/reducer/betReducer';
// import { toast } from 'react-toastify';
// import { host } from '../../redux/api';
// function CricketBet() {
//     const {game, id} = useParams()
//     const location = useLocation();
//     const time = location.state?.time;
//     const gameid= id;
//     const match =game;
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [bettingData, setBettingData] = useState(null);
//     const [betOdds, setBetOdds] = useState(null);
//     const [betAmount, setBetAmount] = useState(0);
//     const [loader, setLoader] = useState(false);
//     const [showodds, setshowodds] = useState(true)
//     const [selectedBet, setSelectedBet] = useState(null)
//     const { battingData } = useSelector((state) => state.cricket);
//     const { pendingBetAmounts, successMessage, errorMessage } = useSelector((state) => state.bet);
//     const { userInfo } = useSelector((state) => state.auth);
//     const [formData, setFormData] = useState({
//       gameId: gameid,
//       sid: 4,
//       otype: '',
//       price: null,
//       xValue: '',
//       gameType: '',
//       gameName: 'Cricket Game',
//       teamName: '',
//     });
//     const [activeSubTab, setActiveSubTab] = useState('Normal');
//     const [item, setitem] = useState(null)

//   const subTabs = [
//     { id: 'Normal', name: 'ALL' },
//     { id: 'Fancy', name: 'Fancy' },
//     { id: 'line', name: 'Line Markets' },
//     { id: 'ball', name: 'Ball by Ball' },
//     { id: 'meter', name: 'Meter Markets' },
//     { id: 'khado', name: 'Khado Markets' },
//   ];
//     // Extract team names from match title
//     const matchTitle = "Paarl Royals v Joburg Super Kings"
//     const teams = matchTitle.split(' v ')
//     const team1 = teams[0] || "Team 1"
//     const team2 = teams[1] || "Team 2"
//     console.log(showodds)

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

//     // ✅ Fetch once before using socket (optional)
//   useEffect(() => {
//     if (gameid) {
//       setLoader(true);
//       dispatch(fetchCricketBatingData(gameid)).finally(() => {
//         setLoader(false);
//       });
//     }
//   }, [dispatch, gameid]);

//   useEffect(() => {
//     if (!gameid) return;
//     const socket = new WebSocket(host);
//     socket.onopen = () => {
//       socket.send(
//         JSON.stringify({
//           type: 'subscribe',
//           gameid,
//           apitype: 'cricket',
//           userId: userInfo?._id,
//         })
//       );
//     };

//     socket.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         if (message.gameid === gameid) {
//           setBettingData(message.data);
//         }
//       } catch (err) {
//         console.error('❌ Error parsing message:', err);
//       }
//     };

//     socket.onerror = (err) => {
//       console.error('❌ WebSocket error:', err);
//     };

//     socket.onclose = () => {
//       console.log('❌ WebSocket disconnected');
//     };

//     return () => socket.close();
//   }, [gameid, userInfo?._id]);

//   useEffect(() => {
//     let intervalId;

//     if (gameid) {
//       setLoader(true);

//       const fetchData = async () => {
//         await dispatch(fetchCricketBatingData(gameid));
//         setLoader(false);
//       };
//       fetchData();
//     }

//     return () => {
//       clearInterval(intervalId);
//     };
//   }, [gameid, dispatch]);

//   useEffect(() => {
//     setBettingData(battingData);
//   }, [battingData]);

//   useEffect(() => {
//     dispatch(getUser());
//   }, [dispatch]);

//   useEffect(() => {
//     if (gameid) {
//       dispatch(getPendingBetAmo(gameid));
//     }
//   }, [dispatch, gameid]);

//   // Show toast messages for success/error (centralized to prevent duplicates)
//   useEffect(() => {
//     if (successMessage) {
//       toast.success(successMessage);
//       dispatch(messageClear());
//       // Hide PlaceBet component when bet is successfully placed
//       setSelectedBet(null);
//     }
//     if (errorMessage) {
//       toast.error(errorMessage);
//       dispatch(messageClear());
//     }
//   }, [successMessage, errorMessage, dispatch]);

//  console.log("bettting data",bettingData)

//   const matchOddsList = Array.isArray(bettingData)
//     ? bettingData.filter(
//         (item) =>
//           item?.mname === 'MATCH_ODDS' || item?.mname === 'TOURNAMENT_WINNER'
//       )
//     : [];

//    console.log("matchodds from cricketbet",matchOddsList)

//   const tiedMatchList = Array.isArray(bettingData)
//     ? bettingData.filter(
//         (item) =>
//           item?.mname === 'Tied Match' || item?.mname === 'Bookmaker IPL CUP'
//       )
//     : [];

//     const newtiedMatchList = Array.isArray(bettingData)
//     ? bettingData.filter(
//         (item) =>
//           item?.mname === 'TIED_MATCH'
//       )
//     : [];

//   const BookmakerList = Array.isArray(bettingData)
//     ? bettingData.filter((item) => item.mname === 'Bookmaker')
//     : [];

//     const fancy1List = bettingData?.filter((item) => item.mname === 'fancy1');

//     const fancy1Data =
//       Array.isArray(fancy1List) && fancy1List.length > 0 && fancy1List[0].section
//         ? fancy1List[0].section.map((sec) => ({
//             team: sec.nat,
//             sid: sec.sid,
//             odds: sec.odds,
//             max: sec.max,
//             min: sec.min,
//             mname: fancy1List[0].mname, // ✅ Access from first item
//             status: fancy1List[0].status, // ✅ Access from first item
//           }))
//         : [];

//     console.log("fancy1Data from cricketbet",fancy1Data)

//     const NormalList = bettingData?.filter((item) => item.mname === 'Normal');
//     const NormalData =
//       Array.isArray(NormalList) && NormalList.length > 0 && NormalList[0].section
//         ? NormalList[0].section.map((sec) => ({
//             team: sec.nat,
//             sid: sec.sid,
//             odds: sec.odds,
//             max: sec.max,
//             min: sec.min,
//             mname: NormalList[0].mname, // ✅ Access from first item
//             status: sec.gstatus, // ✅ Access from first item
//           }))
//         : [];

//     console.log("NormalData from cricketbet",NormalData)

//     const khadoList = bettingData?.filter((item) => item.mname === 'khado');
//     const khadoData =
//       Array.isArray(khadoList) && khadoList.length > 0 && khadoList[0].section
//         ? khadoList[0].section.map((sec) => ({
//             team: sec.nat,
//             sid: sec.sid,
//             odds: sec.odds,
//             max: sec.max,
//             min: sec.min,
//             mname: khadoList[0].mname, // ✅ Access from first item
//             status: sec.gstatus, // ✅ Access from first item
//           }))
//         : [];

//     console.log("khadoData from cricketbet",khadoData)

//     const oddEvenList = bettingData?.filter((item) => item.mname === 'oddeven');
//     const oddEvenData =
//       Array.isArray(oddEvenList) && oddEvenList.length > 0 && oddEvenList[0].section
//         ? oddEvenList[0].section.map((sec) => ({
//             team: sec.nat,
//             sid: sec.sid,
//             odds: sec.odds,
//             max: sec.max,
//             min: sec.min,
//             mname: oddEvenList[0].mname, // ✅ Access from first item
//             status: sec.gstatus, // ✅ Access from first item
//           }))
//         : [];

//     console.log("oddEvenData from cricketbet",oddEvenData)

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
//                 {matchOddsList.length > 0 && <MatchOdds onBetSelect={handleBetSelect} matchOddsList={matchOddsList} setitem={setitem} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

//                 {/** Bookmaker */}
//                 {BookmakerList.length > 0 && <Bookmaker onBetSelect={handleBetSelect} BookmakerList={BookmakerList} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

//                 {/** Tied Match */}
//                 {tiedMatchList.length > 0 && <TiedMatch onBetSelect={handleBetSelect} tiedMatchList={tiedMatchList} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

//                 {/** Normal */}
//                 {NormalData.length > 0 && <Normal onBetSelect={handleBetSelect} NormalData={NormalData} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

//                 {/** Fancy1  */}
//                 {fancy1Data.length > 0 && <Fancy1 onBetSelect={handleBetSelect} fancy1Data={fancy1Data} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

//                 {/** */}
//                 {khadoData.length > 0 && <Khado onBetSelect={handleBetSelect} khadoData={khadoData} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

//                 {/** OddEven */}
//                 {oddEvenData.length > 0 && <OddEven onBetSelect={handleBetSelect} oddEvenData={oddEvenData} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

//                 {/** New Tied Match */}
//                 {newtiedMatchList.length > 0 && <TiedMatch onBetSelect={handleBetSelect} tiedMatchList={newtiedMatchList} pendingBetAmounts={pendingBetAmounts} selectedBet={selectedBet}/>}

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
//                         item={item}
//                         gameId={gameid}
//                         eventName={match}
//                         marketName={selectedBet?.marketName}
//                         gameType={selectedBet?.gameType}
//                         gameName="Cricket Game"
//                         maxAmount={selectedBet?.maxAmount}
//                         minAmount={selectedBet?.minAmount}
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
//                         gameName="Cricket Game"
//                         maxAmount={selectedBet?.maxAmount}
//                         minAmount={selectedBet?.minAmount}
//                     />
//                 </div>
//             </>
//         )}

//     </div>
//   )
// }

// export default CricketBet

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { fetchCricketBatingData } from '../../redux/reducer/cricketSlice';
import MatchOdds from './MatchOdds';
import Bookmaker from './Bookmaker';
import TiedMatch from './TiedMatch';
import Normal from './Normal';
import Fancy1 from './Fancy1';
import Khado from './Khado';
import OddEven from './OddEven';
import MatchedBet from './MatchedBet';
import PlaceBet from './PlaceBet';
import { getUser } from '../../redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import { FaTv } from 'react-icons/fa6';
import axios from 'axios';
import {
  createBet,
  createfancyBet,
  getPendingBet,
  getPendingBetAmo,
  messageClear,
} from '../../redux/reducer/betReducer';
import { toast } from 'react-toastify';
import { host } from '../../redux/api';
import LiveTv from './LiveTv';
import LiveScore from './LiveScore';
function CricketBet() {
  const key = import.meta.env.VITE_LIVE_STREAM_KEY;
  const key_new = import.meta.env.VITE_LIVE_STREAM_KEY_NEW;
  const { game, id } = useParams();
  const location = useLocation();
  const time = location.state?.time;
  const gameid = id;
  const match = game;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [bettingData, setBettingData] = useState(null);
  const [betOdds, setBetOdds] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [loader, setLoader] = useState(false);
  const [showodds, setshowodds] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const { battingData } = useSelector((state) => state.cricket);
  const { pendingBetAmounts, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const { userInfo } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    gameId: gameid,
    sid: 4,
    otype: '',
    price: null,
    xValue: '',
    gameType: '',
    gameName: 'Cricket Game',
    teamName: '',
  });
  const [activeSubTab, setActiveSubTab] = useState('Normal');
  const [item, setitem] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [showlivetv, setshowlivetv] = useState(false);
  const [isScoreCardAvailable, setIsScoreCardAvailable] = useState(true);
  const [isCheckingScoreCard, setIsCheckingScoreCard] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [isLoadingStream, setIsLoadingStream] = useState(false);

  const subTabs = [
    { id: 'Normal', name: 'ALL' },
    { id: 'Fancy', name: 'Fancy' },
    { id: 'line', name: 'Line Markets' },
    { id: 'ball', name: 'Ball by Ball' },
    { id: 'meter', name: 'Meter Markets' },
    { id: 'khado', name: 'Khado Markets' },
  ];
  // Extract team names from match title
  const matchTitle = decodeURIComponent(game || 'Team 1 v Team 2');
  const teams = matchTitle.split(' v ');
  const team1 = teams[0] || 'Team 1';
  const team2 = teams[1] || 'Team 2';
  console.log(showodds);

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

  // ✅ Fetch once before using socket (optional)
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
        JSON.stringify({
          type: 'subscribe',
          gameid,
          apitype: 'cricket',
          userId: userInfo?._id,
        })
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
  }, [gameid, userInfo?._id]);

  useEffect(() => {
    let intervalId;

    if (gameid) {
      setLoader(true);

      const fetchData = async () => {
        await dispatch(fetchCricketBatingData(gameid));
        setLoader(false);
      };
      fetchData();
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [gameid, dispatch]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (gameid) {
      dispatch(getPendingBetAmo(gameid));
      dispatch(getPendingBet(gameid));
    }
  }, [dispatch, gameid]);

  // Show toast messages for success/error (centralized to prevent duplicates)
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
        `https://score.akamaized.uk/diamond-live-score?gmid=${gameid}`
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

  // Fetch live stream URL from API
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
        
        // Extract URL from response - adjust based on actual API response structure
        if (response?.data?.url) {
          setLiveStreamUrl(response.data.url);
        } else if (response?.data?.data?.url) {
          setLiveStreamUrl(response.data.data.url);
        } else if (typeof response?.data === 'string') {
          setLiveStreamUrl(response.data);
        }
      } catch (error) {
        console.error('Error fetching live stream URL:', error);
        // Fallback to default URL if API fails
        setLiveStreamUrl(`https://bulkapi.co.in/api/v1/live-stream?gmid=${gameid}&key=${key_new}`);
      } finally {
        setIsLoadingStream(false);
      }
    };

    fetchLiveStreamUrl();
  }, [gameid, key_new]);

  console.log('bettting data', bettingData);

  const matchOddsList = Array.isArray(bettingData)
    ? bettingData.filter(
        (item) =>
          item?.mname === 'MATCH_ODDS' || item?.mname === 'TOURNAMENT_WINNER'
      )
    : [];

  console.log('matchodds from cricketbet', matchOddsList);

  const tiedMatchList = Array.isArray(bettingData)
    ? bettingData.filter(
        (item) =>
          item?.mname === 'Tied Match' || item?.mname === 'Bookmaker IPL CUP'
      )
    : [];

  const newtiedMatchList = Array.isArray(bettingData)
    ? bettingData.filter((item) => item?.mname === 'TIED_MATCH')
    : [];

  const BookmakerList = Array.isArray(bettingData)
    ? bettingData.filter((item) => item.mname === 'Bookmaker')
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
          mname: fancy1List[0].mname, // ✅ Access from first item
          status: fancy1List[0].status, // ✅ Access from first item
        }))
      : [];

  console.log('fancy1Data from cricketbet', fancy1Data);

  const NormalList = bettingData?.filter((item) => item.mname === 'Normal');
  const NormalData =
    Array.isArray(NormalList) && NormalList.length > 0 && NormalList[0].section
      ? NormalList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: NormalList[0].mname, // ✅ Access from first item
          status: sec.gstatus, // ✅ Access from first item
        }))
      : [];

  console.log('NormalData from cricketbet', NormalList);

  const khadoList = bettingData?.filter((item) => item.mname === 'khado');
  const khadoData =
    Array.isArray(khadoList) && khadoList.length > 0 && khadoList[0].section
      ? khadoList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: khadoList[0].mname, // ✅ Access from first item
          status: sec.gstatus, // ✅ Access from first item
        }))
      : [];

  console.log('khadoData from cricketbet', khadoData);

  const oddEvenList = bettingData?.filter((item) => item.mname === 'oddeven');
  const oddEvenData =
    Array.isArray(oddEvenList) &&
    oddEvenList.length > 0 &&
    oddEvenList[0].section
      ? oddEvenList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: oddEvenList[0].mname, // ✅ Access from first item
          status: sec.gstatus, // ✅ Access from first item
        }))
      : [];

  console.log('oddEvenData from cricketbet', oddEvenData);

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
            MATCHED BET
          </div>
          <div
            className={`flex w-full cursor-pointer items-center justify-center p-2`}
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
                src={`https://score.akamaized.uk/diamond-live-score?gmid=${gameid}`}
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
              // <LiveTv gameid={gameid}/>
              // <iframe
              //   src={`https://live.cricketid.xyz/directStream?gmid=${gameid}&key=a1bett20252026`}
              //   // src={`https://test.shivay9554.com/api/v1/live-stream?gmid=${gameid}&key=${key}`}
              //   title='Watch Live'
              //   className='w-full'
              //   style={{ height: '50vh' }}
              //   allowFullScreen
              //   loading='lazy'
              //   allow='
              //   autoplay;
              //   encrypted-media;
              //   fullscreen;
              //   picture-in-picture;
              //   accelerometer;
              //   gyroscope
              // '
              // />
              <div className='w-full'>
                {isLoadingStream ? (
                  <div className='flex h-[50vh] w-full items-center justify-center bg-gray-200'>
                    <span>Loading stream...</span>
                  </div>
                ) : (
                  <iframe
                    src={liveStreamUrl || `https://bulkapi.co.in/api/v1/live-stream?gmid=${gameid}&key=${key_new}`}
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
                setitem={setitem}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Bookmaker */}
            {BookmakerList.length > 0 && (
              <Bookmaker
                gameid={gameid}
                onBetSelect={handleBetSelect}
                BookmakerList={BookmakerList}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Tied Match */}
            {tiedMatchList.length > 0 && (
              <TiedMatch
                onBetSelect={handleBetSelect}
                tiedMatchList={tiedMatchList}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Normal */}
            {NormalData.length > 0 && (
              <Normal
                onBetSelect={handleBetSelect}
                NormalData={NormalData}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** Fancy1  */}
            {fancy1Data.length > 0 && (
              <Fancy1
                onBetSelect={handleBetSelect}
                fancy1Data={fancy1Data}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** */}
            {khadoData.length > 0 && (
              <Khado
                onBetSelect={handleBetSelect}
                khadoData={khadoData}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** OddEven */}
            {oddEvenData.length > 0 && (
              <OddEven
                onBetSelect={handleBetSelect}
                oddEvenData={oddEvenData}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}

            {/** New Tied Match */}
            {newtiedMatchList.length > 0 && (
              <TiedMatch
                onBetSelect={handleBetSelect}
                tiedMatchList={newtiedMatchList}
                pendingBetAmounts={pendingBetAmounts}
                selectedBet={selectedBet}
              />
            )}
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
                  src={liveStreamUrl || `https://bulkapi.co.in/api/v1/live-stream?gmid=${gameid}&key=${key_new}`}
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
              item={item}
              gameId={gameid}
              eventName={match}
              sid={4}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Cricket Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
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
              sid={4}
              marketName={selectedBet?.marketName}
              gameType={selectedBet?.gameType}
              gameName='Cricket Game'
              maxAmount={selectedBet?.maxAmount}
              minAmount={selectedBet?.minAmount}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default CricketBet;
