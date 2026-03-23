'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { getBetHistory } from "../redux/reducer/authReducer";
import { FaRegEdit, FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  changePasswordByDownline,
  getLoginHistory,
  getUserProfule,
  geUserTrantionHistory,
} from '../redux/reducer/authReducer';
import { toast } from 'react-toastify';
import { formatGameName } from '../utils/formatGameName';
import {
  getDownLinefilterData,
  getBetHistory,
} from '../redux/reducer/downlineReducer';
import { motion } from 'framer-motion'; //eslint-disable-line

export default function UserProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  // console.log("iiiiiiiiiiiii", id)
  const location = useLocation();
  const navigate = useNavigate();
  const { dlfilter, betHistory } = useSelector((state) => state.downline);
  const filterFromUrl =
    searchParams.get('filter') || location.state?.filter || 'ALL';
  const startDateFromUrl =
    searchParams.get('startDate') || location.state?.startDate;
  const endDateFromUrl = searchParams.get('endDate') || location.state?.endDate;
  // console.log("dlfilter111", dlfilter)
  const PLdata = dlfilter?.reports;
  // console.log("PLdata", PLdata)
  const Totaldata = dlfilter?.overallProfit;

  // Debug: Check what data we received
  useEffect(() => {
    console.log('🔍 STEP 4 - dlfilter state changed');
    console.log('🔍 STEP 4 - dlfilter:', dlfilter);
    console.log('🔍 STEP 4 - PLdata (reports):', PLdata);
    console.log('🔍 STEP 4 - Totaldata (overallProfit):', Totaldata);
    console.log('🔍 STEP 4 - PLdata length:', PLdata?.length);
    console.log('🔍 STEP 4 - PLdata is array?', Array.isArray(PLdata));
  }, [dlfilter, PLdata, Totaldata]);

  // const { mystate } = location.state || {};
  const { activeTab: passedActiveTab } = location.state || {};
  const { user, loading, LoginData, transtionHistoryData } = useSelector(
    (state) => state.auth
  );
  // const { dlfilter } = useSelector((state) => state.downline);

  // console.log("betHistory", betHistory);

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  // const [activeTab, setActiveTab] = useState(mystate?.activeTab || "profile");
  const [activeTab, setActiveTab] = useState(passedActiveTab || 'profile');
  const [isOpen, setIsOpen] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  // const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  // const [endDate, setEndDate] = useState(formatDate(currentDate));
  // const [selectedOption, setSelectedOption] = useState('ALL');
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedVoid, setSelectedVoid] = useState('');
  const dispatch = useDispatch();

  const getDatesFromFilter = (filterOption) => {
    const currentDate = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(currentDate.getDate() - 1);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    const fiveMonthAgo = new Date();
    fiveMonthAgo.setMonth(currentDate.getMonth() - 12);

    const formatDate = (date) => date.toISOString().split('T')[0];

    if (filterOption === 'LIVE DATA') {
      return {
        startDate: formatDate(currentDate),
        endDate: formatDate(currentDate),
      };
    } else if (filterOption === 'BACKUP DATA') {
      return {
        startDate: formatDate(oneMonthAgo),
        endDate: formatDate(twoDaysAgo),
      };
    } else if (filterOption === 'OLD DATA') {
      return {
        startDate: formatDate(fiveMonthAgo),
        endDate: formatDate(currentDate),
      };
    } else if (filterOption === 'ALL') {
      return {
        startDate: formatDate(fiveMonthAgo),
        endDate: formatDate(currentDate),
      };
    }
    return {
      startDate: formatDate(oneMonthAgo),
      endDate: formatDate(currentDate),
    };
  };

  // Use dates from URL/state or calculate from filter
  const initialDates =
    startDateFromUrl && endDateFromUrl
      ? { startDate: startDateFromUrl, endDate: endDateFromUrl }
      : getDatesFromFilter(filterFromUrl);

  // Update state initialization (replace lines 69-71):
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);
  const [selectedOption, setSelectedOption] = useState(filterFromUrl);

  // Add useEffect to update dates when URL params change (after line 80):
  useEffect(() => {
    const filterParam = searchParams.get('filter') || location.state?.filter;
    const startDateParam =
      searchParams.get('startDate') || location.state?.startDate;
    const endDateParam = searchParams.get('endDate') || location.state?.endDate;

    if (filterParam) {
      setSelectedOption(filterParam);
    }

    if (startDateParam && endDateParam) {
      setStartDate(startDateParam);
      setEndDate(endDateParam);
    } else if (filterParam) {
      const calculatedDates = getDatesFromFilter(filterParam);
      setStartDate(calculatedDates.startDate);
      setEndDate(calculatedDates.endDate);
    }
  }, [searchParams, location.state]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  // useEffect(() => {
  //   if (mystate) {
  //     setActiveTab(mystate);
  //   }
  // }, []);

  useEffect(() => {
    console.log('🔍 STEP 4 - UserProfile useEffect triggered');
    console.log('🔍 STEP 4 - id from useParams():', id);
    console.log('🔍 STEP 4 - id type:', typeof id);
    console.log('🔍 STEP 4 - id is truthy?', !!id);

    if (!id) {
      console.warn('⚠️ STEP 4 - No id found, skipping API call');
      return;
    }

    const apiParams = {
      page,
      limit,
      startDate,
      endDate,
      gameName: '',
      eventName: '',
      marketName: '',
      userName: '',
      targetUserId: id,
    };

    console.log('🔍 STEP 4 - API call parameters:', apiParams);
    console.log('🔍 STEP 4 - Making API call to getDownLinefilterData');

    dispatch(getDownLinefilterData(apiParams)).then((result) => {
      console.log('🔍 STEP 4 - API call result:', result);
      if (result.type === 'agent/getdownlinefilterData/fulfilled') {
        console.log('✅ STEP 4 - API call successful');
        console.log('🔍 STEP 4 - Response data:', result.payload);
      } else if (result.type === 'agent/getdownlinefilterData/rejected') {
        console.error('❌ STEP 4 - API call failed:', result.payload);
      }
    });
  }, [dispatch, page, limit, startDate, endDate, id]);

  useEffect(() => {
    const currentDate = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(currentDate.getDate() - 1);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    const fiveMonthAgo = new Date();
    fiveMonthAgo.setMonth(currentDate.getMonth() - 12);

    if (selectedOption === 'LIVE DATA') {
      setStartDate(formatDate(currentDate));
      setEndDate(formatDate(currentDate));
    } else if (selectedOption === 'BACKUP DATA') {
      setStartDate(formatDate(oneMonthAgo));
      setEndDate(formatDate(currentDate));
    } else if (selectedOption === 'OLD DATA') {
      setStartDate(formatDate(fiveMonthAgo));
      setEndDate(formatDate(currentDate));
    } else if (selectedOption === 'ALL') {
      setStartDate(formatDate(fiveMonthAgo));
      setEndDate(formatDate(currentDate));
    }
  }, [selectedOption]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    dispatch(getUserProfule(id));
  }, [dispatch]);

  const handleChangePassword = async () => {
    // console.log("sdfghjk")
    if (newPassword !== confirmPassword) {
      toast.error('Password not match.');
      return;
    }
    // if (oldPassword === newPassword) {
    //   toast.error("Old password and new password can't be the same.");
    //   return;
    // }
    try {
      const result = await dispatch(
        changePasswordByDownline({ id, oldPassword, newPassword })
      ).unwrap();
      toast.success(result.message);
      setShowPopup(false);
    } catch (error) {
      toast.error(error);
    }
  };

  const commissions = [
    { name: 'Fancy', value: 0 },
    { name: 'Matka', value: 0 },
    { name: 'Casino', value: 0 },
    { name: 'Binary', value: 0 },
    { name: 'Sportbook', value: 0 },
    { name: 'Bookmaker', value: 0 },
  ];

  useEffect(() => {
    dispatch(getLoginHistory(id));
    // dispatch(geUserTrantionHistory({  page: 1, limit: 10 }));
  }, [dispatch, id]);

  const fetchHistory = () => {
    dispatch(
      geUserTrantionHistory({ userId: id, page, limit, startDate, endDate })
    );
  };

  const fetchBets = () => {
    if (!startDate || !endDate) return;
    dispatch(
      getBetHistory({
        id,
        startDate,
        endDate,
        page,
        selectedGame,
        selectedVoid,
        // limit: pages,
      })
    );
  };

  useEffect(() => {
    fetchHistory();
    fetchBets();
  }, [page, limit, startDate, endDate, selectedGame, selectedVoid]);

  const updateDate = (isoDateString) => {
    const date = new Date(isoDateString);

    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-based
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    const paddedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${day}/${month}/${year} ${hours}:${paddedMinutes} ${ampm}`;
  };
  const formatNumber = (v) => {
    const num = Math.abs(Number(v));
    if (isNaN(num)) return 0;
    return Number.isInteger(num)
      ? num
      : num.toFixed(v.toString().split('.')[1]?.length === 1 ? 1 : 2);
  };
  return (
    <>
      <Navbar />
      <div className='px-[15px] md:px-7.5'>
        <div className='grid grid-cols-1 px-2 md:grid-cols-4'>
          {/* Sidebar */}
          <div className='mb-[24px] md:col-span-1 md:mb-0 md:px-2.5'>
            <div className='bg-dark px-2.5 py-[5px] text-white'>
              <h2 className='text-[15px] font-bold'>My Account</h2>
            </div>
            <div className='border border-gray-300'>
              <button
                className={`w-full border-b border-[#ccc] px-2.5 py-[5px] md:text-left ${
                  activeTab === 'profile'
                    ? 'bg-[#d1ddef]'
                    : 'bg-white hover:bg-[#e6efd1]'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                My Profile
              </button>
              {user?.role === 'user' && (
                <button
                  className={`w-full border-b border-[#ccc] px-2.5 py-[5px] md:text-left ${
                    activeTab === 'BH'
                      ? 'bg-[#d1ddef]'
                      : 'bg-white hover:bg-[#e6efd1]'
                  }`}
                  onClick={() => setActiveTab('BH')}
                >
                  Bet History
                </button>
              )}
              {user?.role === 'user' && (
                <button
                  className={`w-full border-b border-[#ccc] px-2.5 py-[5px] md:text-left ${
                    activeTab === 'PL'
                      ? 'bg-[#d1ddef]'
                      : 'bg-white hover:bg-[#e6efd1]'
                  }`}
                  onClick={() => setActiveTab('PL')}
                >
                  Profit & Loss
                </button>
              )}

              <button
                className={`w-full border-b border-[#ccc] px-2.5 py-[5px] md:text-left ${
                  activeTab === 'statement'
                    ? 'bg-[#d1ddef]'
                    : 'bg-white hover:bg-[#e6efd1]'
                }`}
                onClick={() => setActiveTab('statement')}
              >
                Account Statement
              </button>
              <button
                className={`w-full border-b border-[#ccc] px-2.5 py-[5px] md:text-left ${
                  activeTab === 'activity'
                    ? 'bg-[#d1ddef]'
                    : 'bg-white hover:bg-[#e6efd1]'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                Activity Log
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className='md:col-span-3 md:px-2.5'>
            {activeTab === 'profile' && (
              <div className='border border-gray-300 bg-white'>
                <div className='bg-dark px-2.5 py-[5px] text-white'>
                  <h2 className='text-[15px] font-bold'>Account Details</h2>
                </div>
                <div className='px-[8px] py-[20px]'>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Name
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      {user?.name || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Commission
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      {user?.commition || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Rolling Commission
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      <span>{user?.rollingCommission || 'Nan'}</span>
                      <button
                        className='text-blue mr-2 text-lg'
                        onClick={() => setIsEdit(true)}
                      >
                        <FaRegEdit />
                      </button>
                      <button
                        className='text-blue'
                        onClick={() => setIsOpen(true)}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                          <path
                            fillRule='evenodd'
                            d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Agent Rolling Commission
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      <button
                        className='text-blue'
                        onClick={() => setIsAgent(true)}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                          <path
                            fillRule='evenodd'
                            d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Currency
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      INR
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Partnership
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      {user?.partnership || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Mobile Number
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      {user?.phone || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Password
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      ********
                      <button
                        className='text-blue ml-2'
                        onClick={() => setShowPopup(true)}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Secure Auth Verification
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      <button className='text-blue flex items-center'>
                        Click Here
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='ml-1 h-5 w-5'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Statement Tab */}
            {activeTab === 'statement' && (
              <>
                {/* Filter Section */}
                <div className='mb-6 rounded-sm border border-gray-900 bg-[#e0e6e6] pt-2.5 pb-4 text-[13px]'>
                  <div className='grid grid-cols-2 items-center md:grid-cols-4'>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-2 block'>Data Source</label>
                      <select
                        value={selectedOption}
                        onChange={handleOptionChange}
                        className='w-full rounded-[4px] bg-white px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                      >
                        <option>ALL</option>
                        <option>LIVE DATA</option>
                        <option>BACKUP DATA</option>
                        <option>OLD DATA</option>
                      </select>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-1 block'>From</label>
                      <div className='relative'>
                        <input
                          type='date'
                          className='w-full rounded-[4px] border border-[#ccc] px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-2 block'>To</label>
                      <div className='relative'>
                        <input
                          type='date'
                          className='w-full rounded-[4px] border border-[#ccc] px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <button className='bg-dark w-fit rounded-md px-2.5 py-[5px] text-[14px] font-extrabold text-white'>
                        Get Statement
                      </button>
                    </div>
                  </div>
                </div>
                {loading && (
                  <div className='mt-4 p-4 text-center'>
                    <p>Loading data...</p>
                    {/* You can add a spinner here if you want */}
                  </div>
                )}

                {/* Statement Table */}
                {!loading && (
                  <div className='rounded-sm border border-gray-300 bg-white'>
                    <div className='bg-dark rounded-t-sm px-2.5 py-[5px] text-[15px] text-white'>
                      <h2 className='font-bold'>Account Statement</h2>
                    </div>

                    <div className='p-5'>
                      <div className='mb-5 flex items-center gap-1 p-2 font-[500]'>
                        <span className=''>Show</span>
                        <select
                          className='border border-gray-300 px-2 py-1'
                          value={limit}
                          onChange={(e) => setLimit(e.target.value)}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className=''>entries</span>
                      </div>

                      <div className='overflow-x-auto'>
                        <table className='w-full border-collapse'>
                          <thead>
                            <tr className='bg-gray-200'>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px]'>
                                  Date & Time
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px]'>
                                  Deposit
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px]'>
                                  Withdraw
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px]'>
                                  Balance
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px]'>
                                  Remark
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px]'>
                                  From / To
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {transtionHistoryData?.length > 0 ? (
                              transtionHistoryData?.map((item, i) => (
                                <tr key={i} className='cursor-pointer'>
                                  <td className='border border-gray-300 px-4 py-2 text-center'>
                                    {updateDate(item.date)}
                                  </td>
                                  <td className='border border-gray-300 px-4 py-2 text-center'>
                                    {item?.deposite}
                                  </td>
                                  <td className='border border-gray-300 px-4 py-2 text-center'>
                                    {item?.withdrawl}
                                  </td>
                                  <td className='border border-gray-300 px-4 py-2 text-center'>
                                    {item?.amount}
                                  </td>
                                  <td className='border border-gray-300 px-4 py-2 text-center'>
                                    {item?.remark}
                                  </td>
                                  <td className='border border-gray-300 px-4 py-2 text-center'>
                                    {item?.from} - {item?.to}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan='4'
                                  className='border border-gray-300 px-4 py-2 text-center'
                                >
                                  No data available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className='mt-4 flex flex-col items-center justify-between md:flex-row'>
                        <div className='mb-2 md:mb-0'>
                          Showing {transtionHistoryData.length} entries on page{' '}
                          {page}
                        </div>
                        <div className='mt-4 flex justify-center gap-4'>
                          <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className='bg-gray-200 px-3 py-1 disabled:opacity-50'
                          >
                            Previous
                          </button>
                          <span className='px-4 py-1'>Page {page}</span>
                          <button
                            onClick={() => setPage((p) => p + 1)}
                            className='bg-gray-200 px-3 py-1'
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <div className='rounded-sm border border-gray-300 bg-white text-[13px]'>
                <div className='bg-dark px-2.5 py-[5px] text-[15px] text-white'>
                  <h2 className='font-bold'>Activity Log</h2>
                </div>
                <div className='overflow-auto p-5'>
                  <table className='w-full border border-gray-300'>
                    <thead>
                      <tr className='bg-[#e0e6e6]'>
                        <th className='border border-gray-300 px-4 py-2 text-center'>
                          Login Date & Time
                        </th>
                        <th className='border border-gray-300 px-4 py-2 text-center'>
                          Login Staus
                        </th>
                        <th className='border border-gray-300 px-4 py-2 text-center'>
                          IP Address
                        </th>
                        <th className='border border-gray-300 px-4 py-2 text-center'>
                          ISP
                        </th>
                        <th className='border border-gray-300 px-4 py-2 text-center'>
                          City/State/Country
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {LoginData.map((item, i) => (
                        <tr
                          key={i}
                          className='not-even:bg-gray-100 has-even:bg-[000000]'
                        >
                          <td
                            colSpan=''
                            className='border border-gray-300 px-4 py-2 text-center'
                          >
                            {item.dateTime}
                          </td>
                          <td
                            colSpan=''
                            className={`border border-gray-300 px-4 py-2 text-center font-bold ${item.status === 'Login Successful' ? 'text-green-700' : 'text-red-700'}`}
                          >
                            {item.status}
                          </td>
                          <td
                            colSpan=''
                            className='border border-gray-300 px-4 py-2 text-center'
                          >
                            {item.ip}
                          </td>
                          <td
                            colSpan=''
                            className='border border-gray-300 px-4 py-2 text-center'
                          >
                            {item.isp}
                          </td>
                          <td
                            colSpan=''
                            className='border border-gray-300 px-4 py-2 text-center'
                          >
                            {item.city}/{item.region}/{item.country}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'PL' && (
              <div>
                {/* Filter Section */}
                <div className='mb-6 rounded-sm border border-gray-900 bg-[#e0e6e6] pt-2.5 pb-4 text-[13px]'>
                  <div className='grid grid-cols-2 items-center md:grid-cols-6'>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-1 block'>Data Source</label>
                      <select
                        value={selectedOption}
                        onChange={handleOptionChange}
                        className='w-full rounded-[4px] bg-white px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                      >
                        <option>ALL</option>
                        <option>LIVE DATA</option>
                        <option>BACKUP DATA</option>
                        <option>OLD DATA</option>
                      </select>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-1 block'>From</label>
                      <div className='relative'>
                        <input
                          type='date'
                          className='w-full rounded-[4px] border border-[#ccc] px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-1 block'>To</label>
                      <div className='relative'>
                        <input
                          type='date'
                          className='w-full rounded-[4px] border border-[#ccc] px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <button className='bg-dark w-fit rounded-md px-2.5 py-[5px] text-[14px] font-extrabold text-white'>
                        Get P&L
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statement Table */}
                <div className='rounded-sm border border-gray-300 bg-white'>
                  <div className='bg-dark rounded-t-sm px-2.5 py-[5px] text-[15px] text-white'>
                    <h2 className='font-bold'>Profit Loss</h2>
                  </div>

                  <div className='p-5'>
                    <div className='mb-4 flex items-center gap-1 p-2 font-[500]'>
                      <span>Show</span>
                      <select className='border border-gray-300 px-2 py-1'>
                        <option value='50'>50</option>
                        <option value='10'>10</option>
                        <option value='25'>25</option>
                        <option value='100'>100</option>
                      </select>
                      <span>entries</span>
                    </div>

                    <div className='overflow-x-auto'>
                      <table className='w-full border-collapse border-2 border-gray-300'>
                        <thead>
                          <tr className='bg-gray-200'>
                            <th className='border border-gray-300 p-2 text-left'>
                              <div className='relative flex items-center justify-center text-[13px]'>
                                Sports Name
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                  />
                                </svg>
                              </div>
                            </th>
                            <th className='border border-gray-300 p-2 text-left'>
                              <div className='relative flex items-center justify-center text-[13px]'>
                                Profit & Loss
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                  />
                                </svg>
                              </div>
                            </th>
                            <th className='border border-gray-300 p-2 text-left'>
                              <div className='relative flex items-center justify-center text-[13px]'>
                                Commission
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                  />
                                </svg>
                              </div>
                            </th>
                            <th className='border border-gray-300 p-2 text-left'>
                              <div className='relative flex items-center justify-center text-[13px]'>
                                Total P&L
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                  />
                                </svg>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {PLdata?.length > 0 ? (
                            PLdata.map((item, index) => (
                              <tr
                                key={index}
                                className='text-center hover:bg-gray-100'
                              >
                                <td
                                  className='cursor-pointer border border-gray-300 p-2 text-[#2789ce]'
                                  onClick={() =>
                                    navigate(
                                      `/userplyevent/${item.name}/${id}?filter=${selectedOption}&startDate=${startDate}&endDate=${endDate}`
                                    )
                                  }
                                >
                                  {formatGameName(item.name)}
                                </td>
                                <td
                                  className={`border border-gray-300 p-2 ${item.myProfit.toFixed(2) > 0 ? 'text-green-500' : 'text-red-500'}`}
                                >
                                  {formatNumber(item.myProfit)}
                                </td>
                                <td className={`border border-gray-300 p-2`}>
                                  0
                                </td>
                                {/* <td className="border border-gray-300 p-2">
                                  {(item.myProfit).toFixed(2)}
                                </td> */}
                                <td
                                  className={`border border-gray-300 p-2 ${item.myProfit.toFixed(2) > 0 ? 'text-green-500' : 'text-red-500'}`}
                                >
                                  {formatNumber(item.myProfit)}
                                </td>
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

                    <div className='mt-4 flex flex-col items-center justify-between md:flex-row'>
                      <div className='mb-2 md:mb-0'>
                        Showing 0 to 0 of 0 entries
                      </div>
                      <div className='flex'>
                        <button className='mx-1 border border-gray-300 px-3 py-1'>
                          First
                        </button>
                        <button className='mx-1 border border-gray-300 px-3 py-1'>
                          Previous
                        </button>
                        <button className='mx-1 border border-gray-300 px-3 py-1'>
                          Next
                        </button>
                        <button className='mx-1 border border-gray-300 px-3 py-1'>
                          Last
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'BH' && (
              <div>
                {/* Filter Section */}
                <div className='mb-6 rounded-sm border border-gray-900 bg-[#e0e6e6] pt-2.5 pb-4 text-[13px]'>
                  <div className='grid grid-cols-2 items-center md:grid-cols-6'>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-1 block'>Choose Type</label>
                      <select
                        value={selectedVoid}
                        onChange={(e) => setSelectedVoid(e.target.value)}
                        className='w-full rounded-[4px] bg-white px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                      >
                        <option value='settel'>Settel</option>
                        <option value='unsettel'>Unsettel</option>
                        <option value='void'>Void</option>
                      </select>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-1 block'>Choose Sports</label>
                      <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className='w-full rounded-[4px] bg-white px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                      >
                        <option value=''>All</option>
                        <option value='Cricket Game'>Cricket</option>
                        <option value='Tennis Game'>Tennis</option>
                        <option value='Soccer Game'>Soccer</option>
                        <option value='Casino'>Casino</option>
                        <option value='Horse Racing Game'>Horse Racing</option>
                        <option value='Greyhound Racing Game'>
                          Greyhound Racing
                        </option>
                        <option value='Basket Ball Game'>Basket Ball</option>
                        <option value='Lottery Game'>Lottery</option>
                      </select>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-1 block'>From</label>
                      <div className='relative'>
                        <input
                          type='date'
                          className='w-full rounded-[4px] border border-[#ccc] px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <label className='mb-1 block'>To</label>
                      <div className='relative'>
                        <input
                          type='date'
                          className='w-full rounded-[4px] border border-[#ccc] px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className='col-span-1 w-full px-3'>
                      <button className='bg-dark w-fit rounded-md px-2.5 py-[5px] text-[14px] font-extrabold text-white'>
                        Get History
                      </button>
                    </div>
                  </div>
                </div>
                {loading && (
                  <div className='mt-4 p-4 text-center'>
                    <p>Loading data...</p>
                    {/* You can add a spinner here if you want */}
                  </div>
                )}

                {/* Statement Table */}
                {!loading && (
                  <div className='rounded-sm border border-gray-300 bg-white'>
                    <div className='bg-dark rounded-t-sm px-2.5 py-[5px] text-[15px] text-white'>
                      <h2 className='font-bold'>Betting History</h2>
                    </div>

                    <div className='p-5'>
                      <div className='mt-2 flex items-center gap-1 p-2 font-[500]'>
                        <span className='mr-2'>Show</span>
                        <select className='rounded border border-gray-300 px-2 py-1'>
                          <option value='50'>50</option>
                          <option value='10'>10</option>
                          <option value='25'>25</option>
                          <option value='100'>100</option>
                        </select>
                        <span className='ml-2'>entries</span>
                      </div>

                      <div className='overflow-x-auto'>
                        <table className='w-full border-collapse'>
                          <thead>
                            <tr className='bg-gray-200'>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px] md:pr-5'>
                                  User Name
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px] md:pr-5'>
                                  SportsName
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px] md:pr-5'>
                                  Event
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px] md:pr-5'>
                                  Market
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px] md:pr-5'>
                                  Selection
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px] md:pr-5'>
                                  Type
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px] md:pr-5'>
                                  odds Req.
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px] md:pr-5'>
                                  Stake
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='relative flex items-center justify-center text-[13px] md:pr-5'>
                                  Place Time
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='ml-1 h-4 w-4 flex-shrink-0 md:absolute md:right-0'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                                    />
                                  </svg>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {betHistory?.length > 0 ? (
                              betHistory.map((item, index) => (
                                <tr
                                  key={index}
                                  className='text-center text-[13px] font-[500] hover:bg-gray-100'
                                >
                                  <td className='border border-gray-300 p-2'>
                                    {item.userName}
                                  </td>
                                  <td className={`border border-gray-300 p-2`}>
                                    {formatGameName(item.gameName)}
                                  </td>
                                  <td
                                    className={`border border-gray-300 p-2 uppercase`}
                                  >
                                    {item.eventName}
                                  </td>
                                  <td className='border border-gray-300 p-2'>
                                    {item.marketName}
                                  </td>
                                  <td className='border border-gray-300 p-2 uppercase'>
                                    {item.teamName}
                                  </td>
                                  <td className='border border-gray-300 p-2 uppercase'>
                                    {item.otype}
                                  </td>
                                  <td className='border border-gray-300 p-2'>
                                    {item.xValue}
                                  </td>
                                  <td className='border border-gray-300 p-2'>
                                    {item.betAmount}
                                  </td>
                                  <td className='border border-gray-300 p-2'>
                                    {new Date(item.createdAt).toLocaleString(
                                      'en-IN'
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={9}
                                  className='border border-gray-300 p-4 text-center'
                                >
                                  No data available in table
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className='mt-4 flex flex-col items-center justify-between md:flex-row'>
                        <div className='mb-2 md:mb-0'>
                          Showing 0 to 0 of 0 entries
                        </div>
                        <div className='flex'>
                          <button className='mx-1 border border-gray-300 px-3 py-1'>
                            First
                          </button>
                          <button className='mx-1 border border-gray-300 px-3 py-1'>
                            Previous
                          </button>
                          <button className='mx-1 border border-gray-300 px-3 py-1'>
                            Next
                          </button>
                          <button className='mx-1 border border-gray-300 px-3 py-1'>
                            Last
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div className='fixed inset-0 flex items-center justify-center bg-[#00000074]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='w-70 rounded-lg bg-white shadow-lg md:w-100'
            >
              {/* Header */}
              <div className='bg-blue flex justify-between px-4 py-1 font-bold text-white'>
                <span>Rooling Commission</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className='text-xl text-white'
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className='space-y-2 p-4'>
                {commissions.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between border px-4 py-2'
                  >
                    <span>{item.name}</span>
                    <span className='font-bold'>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        {isAgent && (
          <div className='fixed inset-0 flex items-center justify-center bg-[#00000074]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='w-70 rounded-lg bg-white shadow-lg md:w-100'
            >
              {/* Header */}
              <div className='bg-blue flex justify-between px-4 py-1 font-bold text-white'>
                <span>Agent Rooling Commission</span>
                <button
                  onClick={() => setIsAgent(false)}
                  className='text-xl text-white'
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className='space-y-2 p-4'>
                {commissions.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between border px-4 py-2'
                  >
                    <span>{item.name}</span>
                    <span className='font-bold'>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        {isEdit && (
          <div className='fixed inset-0 flex items-center justify-center bg-[#00000074]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='w-70 rounded-lg bg-white shadow-lg md:w-100'
            >
              {/* Header */}
              <div className='bg-blue flex justify-between px-4 py-1 font-bold text-white'>
                <span>Edit Commission</span>
                <button
                  onClick={() => setIsEdit(false)}
                  className='text-xl text-white'
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className='space-y-2 p-4'>
                {commissions.map((item, index) => (
                  <div
                    key={index}
                    className='grid grid-cols-3 items-center px-4 py-1'
                  >
                    <span className='col-span-1 text-sm'>{item.name}</span>
                    <input
                      type='text'
                      className='col-span-2 rounded-md border border-gray-300 px-2 py-1'
                      value='0'
                      placeholder='Add here'
                    />
                  </div>
                ))}
                <div className='grid grid-cols-3 items-center px-4 py-1'>
                  <span className='col-span-1 text-sm'>Virtual Sports</span>
                  <input
                    type='text'
                    className='col-span-2 rounded-md border border-gray-300 px-2 py-1'
                    value='0'
                    placeholder='Add here'
                  />
                </div>
                <div className='grid grid-cols-3 items-center px-4 py-1'>
                  <span className='col-span-1 text-sm'>Password</span>
                  <input
                    type='password'
                    className='col-span-2 rounded-md border border-gray-300 px-2 py-1'
                    placeholder='Add here'
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <button className='bg-blue rounded-md px-3 py-1 text-white'>
                    Submit
                  </button>
                  <button
                    className='rounded-md bg-gray-300 px-3 py-1'
                    onClick={() => setIsEdit(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showPopup && (
          <div className='fixed inset-0 flex items-center justify-center bg-[#0000007e] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='w-[90%] max-w-lg rounded-lg bg-white shadow-lg md:w-full'
            >
              <h2 className='bg-blue-one mb-4 px-2 py-1 font-semibold text-white'>
                Change Password
              </h2>
              <div className='p-2'>
                <div className='relative mb-2'>
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder='Your Password'
                    className='w-full rounded border p-2 pr-10'
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* New Password */}
                <div className='relative mb-2'>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder='New Password'
                    className='w-full rounded border p-2 pr-10'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className='relative mb-4'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Confirm Password'
                    className='w-full rounded border p-2 pr-10'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className='flex justify-end gap-2.5'>
                  <button
                    className='bg-blue rounded px-4 py-2 text-white'
                    onClick={handleChangePassword}
                  >
                    Confirm
                  </button>
                  <button
                    className='rounded bg-gray-300 px-4 py-2 text-black'
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
