import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser } from '../redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import {
  createBet,
  createfancyBet,
  getPendingBetAmo,
  messageClear,
} from '../redux/reducer/betReducer';
import { toast } from 'react-toastify';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import { fetchCricketBatingData } from '../redux/reducer/cricketSlice';
import { BiInfoCircle } from 'react-icons/bi';
import MatchOdd from './Details/MatchOdd';
import TiedMatch from './Details/TiedMatch';
import BookMaker from './Details/BookMaker';
import Loader from '../components/Loader';

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

export default function MarketDetail() {
  const { gameid } = useParams() || {};
  const { match } = useParams() || {};

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, successMessage, errorMessage } = useSelector(
    (state) => state.bet
  );
  const { battingData } = useSelector((state) => state.cricket);

  const { pendingBet } = useSelector((state) => state.bet);

  const [selectedRun, setSelectedRun] = useState({ type: null, index: null });
  const [selectedBet, setSelectedBet] = useState({
    team: null,
    odds: null,
    otype: null,
    amount: null,
  });

  const [betOdds, setBetOdds] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [selectedIncrement, setSelectedIncrement] = useState(100);
  const [loader, setLoader] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [betOddsValue, setBetOddsValue] = useState(0);
  const [betOddsType, setBetOddsType] = useState('');

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

  const [activeTab, setActiveTab] = useState('fancy');
  const [activeSubTab, setActiveSubTab] = useState('Normal');

  const subTabs = [
    { id: 'Normal', name: 'ALL' },
    { id: 'Normal', name: 'Fancy' },
    { id: 'line', name: 'Line Markets' },
    { id: 'ball', name: 'Ball by Ball' },
    { id: 'meter', name: 'Meter Markets' },
    { id: 'khado', name: 'Khado Markets' },
  ];

  const handleSelect = (type, index, odds, back) => {
    setSelectedRun({ type, index });
    setBetAmount(0);
    setBetOddsValue(odds);
    setBetOddsType(back);
  };

  useEffect(() => {
    let intervalId;

    if (gameid) {
      setLoader(true);

      const fetchData = async () => {
        await dispatch(fetchCricketBatingData(gameid));
        setLoader(false);
      };

      fetchData();

      intervalId = setInterval(() => {
        dispatch(fetchCricketBatingData(gameid));
      }, 2000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [gameid]);
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const setValue = (xValue, team, sid, otype, fancyScore) => {
    setBetOdds(xValue);
    setTeamName(team);

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
    if (betAmount > maxAmo) {
      toast.error(`Bet amount cannot exceed ${maxAmo}`);
      return;
    }
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
    setSelectedRun(null, null);
  };

  const placefancyBet = async (gameType, marketName, maxAmo) => {
    if (betAmount > maxAmo) {
      toast.error(`Bet amount cannot exceed ${maxAmo}`);
      return;
    }
    try {
      const updatedFormData = {
        ...formData,
        price: betAmount,
        gameType,
        marketName,
        eventName: match,
      };
      setFormData(updatedFormData);

      const data = await dispatch(createfancyBet(updatedFormData)).then(
        (res) => {
          if (successMessage) {
            toast.success(successMessage);
            setSelectedRun(null);
            dispatch(messageClear());
          }

          if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
          }
        }
      );
      await dispatch(getUser());
      dispatch(getPendingBetAmo(gameid));
    } catch (error) {
      toast.error(error);
    }
  };

  const matchOddsList = Array.isArray(battingData)
    ? battingData.filter(
        (item) =>
          item?.mname === 'MATCH_ODDS' || item?.mname === 'TOURNAMENT_WINNER'
      )
    : [];

  const tiedMatchList = Array.isArray(battingData)
    ? battingData.filter(
        (item) =>
          item?.mname === 'Tied Match' || item?.mname === 'Bookmaker IPL CUP'
      )
    : [];

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setSelectedRun(null);
      dispatch(messageClear());
    }

    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch]);
  const fancy1List = battingData.filter((item) => item.mname === 'fancy1');

  const fancy1Data =
    Array.isArray(fancy1List) && fancy1List.length > 0 && fancy1List[0].section
      ? fancy1List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: fancy1List[0].mname,
          status: fancy1List[0].status,
        }))
      : [];

  const over6List = battingData.filter((item) => item.mname === 'Normal');
  const over6Data =
    Array.isArray(over6List) && over6List.length > 0 && over6List[0].section
      ? over6List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: over6List[0].mname,
          status: sec.gstatus,
        }))
      : [];

  const fancy2List = battingData.filter((item) => item.mname === activeSubTab);
  const fancy2Data =
    Array.isArray(fancy2List) && fancy2List.length > 0 && fancy2List[0].section
      ? fancy2List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: fancy2List[0].mname,
          status: sec.gstatus,
        }))
      : [];

  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
  }, [dispatch]);

  const getBetDetails = (pendingBet, matchData, team) => {
    const matchedTeamBet = pendingBet?.find(
      (item) =>
        item.gameType === matchData?.mname &&
        item.teamName?.toLowerCase() === team?.toLowerCase()
    );

    // Also find *any* other bet on the same match (for fallback price)
    const otherTeamBet = pendingBet?.find(
      (item) => item.gameType === matchData?.mname
    );

    const otype = matchedTeamBet?.otype || otherTeamBet?.otype || '';
    const totalBetAmount = matchedTeamBet?.totalBetAmount || '';
    const totalPrice =
      matchedTeamBet?.totalPrice || otherTeamBet?.totalPrice || '';
    const teamName = matchedTeamBet?.teamName || '';

    return {
      otype,
      totalBetAmount,
      totalPrice,
      teamName,
    };
  };

  function MyComponent({
    team,
    matchData,
    pendingBet,
    myAmount,
    index,
    selectedRun,
  }) {
    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(
      pendingBet,
      matchData,
      team
    );

    const isMatchedTeam = teamName?.toLowerCase() === team?.toLowerCase();

    const betColor =
      otype === 'lay'
        ? isMatchedTeam
          ? 'red'
          : 'green'
        : otype === 'back'
          ? isMatchedTeam
            ? 'green'
            : 'red'
          : 'green';

    const valueColor =
      betOddsType === 'lay'
        ? 'red'
        : betOddsType === 'back'
          ? 'green'
          : 'black';

    const displayValue = isMatchedTeam ? totalBetAmount : totalPrice;

    const isSelected =
      selectedRun?.type === 'odd' && selectedRun?.index === index;

    return (
      <div className='col-span-5 p-1 pl-4 text-left text-sm font-bold md:col-span-3 md:text-[11px]'>
        <div>
          <p>{team}</p>
          <p style={{ color: betColor }}>
            {displayValue}
            {isSelected && myAmount !== 0 ? (
              <span style={{ color: betColor }}>
                (
                {betOddsType !== 'lay'
                  ? Math.round(myAmount * (betOddsValue - 1))
                  : Math.round(myAmount)}
                )
              </span>
            ) : (
              myAmount !== 0 && (
                <span style={{ color: valueColor }}>
                  (
                  {betOddsType !== 'lay'
                    ? Math.round(myAmount)
                    : Math.round(myAmount * (betOddsValue - 1))}
                  )
                </span>
              )
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=''>
      {loader ? (
        <div className='py-4 text-center'>
          <Loader />
        </div>
      ) : (
        <div>
          <div>
            {/* <video src="https://live.cricketid.xyz/directStream?gmid=907822902"></video> */}
          </div>
          {/* odds match data */}

          <MatchOdd
            matchOddsList={matchOddsList}
            gameid={gameid}
            match={match}
          />
          {/* tied match data */}
          {/* tied match data */}
          <TiedMatch
            tiedMatchList={tiedMatchList}
            gameid={gameid}
            match={match}
          />
          {/* bookmaker match data */}
          <BookMaker gameid={gameid} match={match} />

          {/* toss winn loass */}
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
                        {fancy1Data[0].min} - {fancy1Data[0].max}
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
                          <div
                            onClick={() => {
                              if (fancy1Data[0]?.odds[0].odds !== 0) {
                                handleSelect('toss', fancy1Data[0].sid);
                                setValue(
                                  fancy1Data[0]?.odds[0].odds,
                                  fancy1Data[0]?.team?.split('(')[0],
                                  fancy1Data[0].sid,
                                  fancy1Data[0]?.odds[0].otype
                                );
                              }
                            }}
                            className='text-center'
                          >
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
                          </div>
                          <div
                            onClick={() => {
                              handleSelect('toss', fancy1Data[0].sid);
                              setValue(
                                fancy1Data[1]?.odds[0].odds,
                                fancy1Data[1]?.team?.split('(')[0],
                                fancy1Data[1].sid,
                                fancy1Data[1]?.odds[0].otype
                              );
                            }}
                            className='text-center'
                          >
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
                          </div>
                        </div>
                        {selectedRun?.type === 'toss' &&
                          selectedRun?.index === fancy1Data[0].sid && (
                            <div className='mt-2 bg-green-100 p-3'>
                              <div className='grid grid-cols-4 gap-2'>
                                <button
                                  className='col-span-2 rounded-sm border border-black bg-white px-3 py-1 md:col-span-1'
                                  onClick={() => handleSelect(null, null)}
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
                                    placeBet('Toss', 'Toss', fancy1Data[0].max)
                                  }
                                  disabled={loading}
                                  className={`bg-blue col-span-2 flex items-center justify-center gap-2 rounded-sm px-3 py-1 text-white transition-all duration-300 md:col-span-1 ${
                                    loading
                                      ? 'cursor-not-allowed opacity-70'
                                      : ''
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
                        {over6Data[0].min} - {over6Data[0].max}
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
                          <div
                            onClick={() => {
                              handleSelect('six', over6Data[0].sid);
                              setValue(
                                over6Data[0]?.odds[0].odds,
                                over6Data[0]?.team,
                                over6Data[0].sid,
                                over6Data[0]?.odds[0].otype
                              );
                            }}
                            className='text-center'
                          >
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
                          <div
                            onClick={() => {
                              handleSelect('six', over6Data[0].sid);
                              setValue(
                                over6Data[1]?.odds[0].odds,
                                over6Data[1]?.team,
                                over6Data[1].sid,
                                over6Data[1]?.odds[0].otype
                              );
                            }}
                            className='text-center'
                          >
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
                          </div>
                        </div>
                        {selectedRun?.type === 'six' &&
                          selectedRun?.index === over6Data[0].sid && (
                            <div className='mt-2 bg-green-100 p-3'>
                              <div className='grid grid-cols-4 gap-2'>
                                <button
                                  className='col-span-2 rounded-sm border border-black bg-white px-3 py-1 md:col-span-1'
                                  onClick={() => handleSelect(null, null)}
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
                                      '1st 6 over',
                                      teamName,
                                      over6Data[0].max
                                    )
                                  }
                                  disabled={
                                    betAmount < 1 || loading ? true : false
                                  }
                                  className={`bg-blue col-span-2 flex items-center justify-center gap-2 rounded-sm px-3 py-1 text-white transition-all duration-300 md:col-span-1 ${
                                    loading
                                      ? 'cursor-not-allowed opacity-70'
                                      : ''
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
                            ({ team, odds, sid, min, max, status }, index) => (
                              <div key={index} className='w-full'>
                                <div className='grid grid-cols-6'>
                                  <span className='col-span-4 border-b border-gray-400 px-2 py-1 text-sm font-bold md:col-span-2 md:text-[11px]'>
                                    {team}
                                    <div className='flex items-center'>
                                      {/* {pendingBet?.filter(
                                        (item) =>
                                          item.gameType === activeSubTab &&
                                          item.teamName?.toLowerCase() === team?.toLowerCase()
                                      ) && (
                                          <span className="text-red-500">
                                            <FaArrowRight />
                                          </span>
                                        )} */}
                                      <p className='text-red-500'>
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
                                                sum + (item.totalPrice || 0),
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
                                          onClick={() => {
                                            setSelectedRun(index);
                                            setValue(
                                              odd?.odds,
                                              team,
                                              sid,
                                              odd.otype
                                            );
                                          }}
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
                                          <div className='cursor-pointer'>
                                            <div className='font-bold'>
                                              {odd?.odds}
                                            </div>
                                            <div className='text-gray-800'>
                                              {odd?.size}
                                            </div>
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
                                              onClick={() => {
                                                if (odd?.odds !== 0) {
                                                  handleSelect('fancy', index);
                                                  setValue(
                                                    odd?.size,
                                                    team,
                                                    sid,
                                                    odd.otype,
                                                    odd?.odds
                                                  );
                                                }
                                              }}
                                              key={i}
                                              className={`w-full cursor-pointer border-b p-1 text-center ${
                                                odd?.otype === 'back'
                                                  ? 'bg-[#72bbef]'
                                                  : 'bg-[#faa9ba]'
                                              }`}
                                            >
                                              <div
                                                className='cursor-pointer'
                                                onClick={() => {
                                                  if (odd?.odds !== 0) {
                                                    handleSelect(
                                                      'fancy',
                                                      index
                                                    );
                                                    setValue(
                                                      odd?.size,
                                                      team,
                                                      sid,
                                                      odd.otype,
                                                      odd?.odds
                                                    );
                                                  }
                                                }}
                                              >
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
                                    {min} - {max}
                                  </span>
                                </div>
                                {selectedRun?.type === 'fancy' &&
                                  selectedRun?.index === index && (
                                    <div className='mt-2 bg-green-100 p-3'>
                                      <div className='grid grid-cols-4 gap-2'>
                                        <button
                                          className='col-span-2 rounded-sm border border-black bg-white px-3 py-1 md:col-span-1'
                                          onClick={() =>
                                            handleSelect(null, null)
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

                                        <input
                                          type='number'
                                          value={betAmount || ''}
                                          onChange={(e) =>
                                            setBetAmount(Number(e.target.value))
                                          }
                                          placeholder='0'
                                          className='col-span-2 w-full bg-white p-2 text-black md:col-span-1'
                                        />

                                        <button
                                          onClick={() =>
                                            placefancyBet(
                                              activeSubTab,
                                              team,
                                              max
                                            )
                                          }
                                          disabled={loading}
                                          className={`bg-blue col-span-2 flex items-center justify-center gap-2 rounded-sm px-3 py-1 text-white transition-all duration-300 md:col-span-1 ${
                                            loading
                                              ? 'cursor-not-allowed opacity-70'
                                              : ''
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
                                          100, 200, 500, 1000, 2000, 3000, 5000,
                                          10000,
                                        ].map((amt) => (
                                          <button
                                            key={amt}
                                            onClick={() => setBetAmount(amt)}
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
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className='py-4 text-center text-gray-500'
                            >
                              No betting options available for this category
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
                            <span className='font-medium'>{item.method}</span>
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
      )}
    </div>
  );
}
