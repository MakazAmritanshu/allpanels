import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getDownLinefilterData } from '../redux/reducer/downlineReducer';
import Spinner2 from '../components/Spinner2';
import { formatGameName } from '../utils/formatGameName';

const UserProfitLossByEvent = () => {
  const { gameName, id } = useParams();
  const [searchParams] = useSearchParams();
  console.log('🔍 UserProfitLossByEvent - Route params:', { gameName, id });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get filter from URL query params
  const filterFromUrl = searchParams.get('filter') || 'LIVE DATA';
  const startDateFromUrl = searchParams.get('startDate');
  const endDateFromUrl = searchParams.get('endDate');

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Calculate dates based on filter option
  const getDatesFromFilter = (filterOption) => {
    const currentDate = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(currentDate.getDate() - 1);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    const fiveMonthAgo = new Date();
    fiveMonthAgo.setMonth(currentDate.getMonth() - 12);

    if (filterOption === 'LIVE DATA') {
      return {
        startDate: formatDate(currentDate),
        endDate: formatDate(currentDate),
      };
    } else if (filterOption === 'BACKUP DATA') {
      return {
        startDate: formatDate(oneMonthAgo),
        endDate: formatDate(currentDate),
      };
    } else if (filterOption === 'OLD DATA') {
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

  // Use dates from URL or calculate from filter
  const initialDates =
    startDateFromUrl && endDateFromUrl
      ? { startDate: startDateFromUrl, endDate: endDateFromUrl }
      : getDatesFromFilter(filterFromUrl);

  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);
  const [activeTab, setActiveTab] = useState('PL');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState(filterFromUrl);

  // Update state when URL params change
  useEffect(() => {
    if (filterFromUrl) {
      setSelectedOption(filterFromUrl);
    }
    if (startDateFromUrl && endDateFromUrl) {
      setStartDate(startDateFromUrl);
      setEndDate(endDateFromUrl);
    } else if (filterFromUrl) {
      const calculatedDates = getDatesFromFilter(filterFromUrl);
      setStartDate(calculatedDates.startDate);
      setEndDate(calculatedDates.endDate);
    }
  }, [filterFromUrl, startDateFromUrl, endDateFromUrl]);

  const { dlfilter, loading, betHistory } = useSelector(
    (state) => state.downline
  );

  console.log('🔍 UserProfitLossByEvent - dlfilter:', dlfilter);
  console.log(
    '🔍 UserProfitLossByEvent - dlfilter.reports:',
    dlfilter?.reports
  );
  console.log('🔍 UserProfitLossByEvent - dlfilter.bets:', dlfilter?.bets);
  console.log('🔍 UserProfitLossByEvent - reportType:', dlfilter?.reportType);

  const PLdata =
    dlfilter?.reportType === 'grouped'
      ? dlfilter?.reports
      : dlfilter?.bets || dlfilter?.reports;

  console.log('🔍 UserProfitLossByEvent - PLdata:', PLdata);
  console.log('🔍 UserProfitLossByEvent - PLdata length:', PLdata?.length);

  // Update dates when selectedOption changes (if user manually changes filter)
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
    }
  }, [selectedOption]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handelnavigate = (item) => {
    navigate(`/online-user/${id}`, { state: { mystate: item } });
  };

  useEffect(() => {
    console.log('🔍 UserProfitLossByEvent - useEffect triggered:', {
      startDate,
      endDate,
      id,
      gameName,
      hasAllParams: !!(startDate && endDate && id),
    });

    if (startDate && endDate && id) {
      const apiParams = {
        page,
        limit,
        startDate,
        endDate,
        gameName: gameName || '',
        eventName: '',
        marketName: '',
        userName: '',
        targetUserId: id,
      };

      console.log('🔍 UserProfitLossByEvent - API call params:', apiParams);
      console.log('🔍 DATE CHECK - Dates verification:', {
        startDate,
        endDate,
        today: formatDate(new Date()),
        isToday:
          startDate === formatDate(new Date()) &&
          endDate === formatDate(new Date()),
        dateRange: selectedOption === 'LIVE DATA' ? 'Today only' : 'Range',
      });

      dispatch(getDownLinefilterData(apiParams));
    } else {
      console.warn(
        '⚠️ UserProfitLossByEvent - API call skipped - missing params:',
        {
          startDate: !!startDate,
          endDate: !!endDate,
          id: !!id,
        }
      );
    }
  }, [dispatch, page, limit, startDate, endDate, id, gameName]);

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
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => handelnavigate('profile')}
              >
                My Profile
              </button>
              <button
                className={`w-full border-b border-[#ccc] px-2.5 py-[5px] md:text-left ${
                  activeTab === 'BH'
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => handelnavigate('BH')}
              >
                Bet History
              </button>
              <button
                className={`w-full border-b border-[#ccc] px-2.5 py-[5px] md:text-left ${
                  activeTab === 'PL'
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => handelnavigate('PL')}
              >
                Profit & Loss
              </button>
              <button
                className={`w-full border-b border-[#ccc] px-2.5 py-[5px] md:text-left ${
                  activeTab === 'statement'
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => handelnavigate('statement')}
              >
                Account Statement
              </button>
              <button
                className={`w-full border-b border-[#ccc] px-2.5 py-[5px] md:text-left ${
                  activeTab === 'activity'
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => handelnavigate('activity')}
              >
                Activity Log
              </button>
            </div>
          </div>

          {/* Statement Table */}
          <div className='md:col-span-3 md:px-2.5'>
            <div className='border border-gray-300 bg-white'>
              <div className='bg-dark px-2.5 py-[5px] text-white'>
                <h2 className='text-[15px] font-bold'>Profit & Loss Events</h2>
              </div>

              <div className='p-5'>
                <div className='mb-4 flex items-center gap-1 p-2 font-[500]'>
                  <span>Show</span>
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
                        <th className='border border-gray-300 p-2 text-center'>
                          <div className='relative flex items-center justify-center text-[13px]'>
                            Event Name
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
                        <th className='border border-gray-300 p-2 text-center'>
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

                        <th className='border border-gray-300 p-2 text-center'>
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
                        <th className='border border-gray-300 p-2 text-center'>
                          <div className='flex items-center justify-center text-[13px]'>
                            Total P&L
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td
                            colSpan={6}
                            className='border border-gray-300 p-4 text-center'
                          >
                            <div className='fixed top-52 left-[40%] py-4 text-center'>
                              <Spinner2 />
                            </div>
                          </td>
                        </tr>
                      )}
                      {!loading && PLdata?.length > 0 ? (
                        PLdata.map((item, index) => (
                          <tr
                            key={index}
                            className='text-center hover:bg-gray-100'
                          >
                            <td className='border border-gray-300 p-2 font-[400]'>
                              {formatGameName(item.gameName)}
                            </td>
                            <td
                              className='cursor-pointer border border-gray-300 p-2 text-[#2789ce] uppercase'
                              onClick={() => {
                                const params = new URLSearchParams({
                                  gameName: item.gameName || gameName || '',
                                  filter: selectedOption,
                                  startDate: startDate,
                                  endDate: endDate,
                                });
                                navigate(
                                  `/userplbymarket/${item.name}/${id}?${params.toString()}`
                                );
                              }}
                            >
                              {formatGameName(item.name)}
                            </td>
                            <td
                              className={`border border-gray-300 p-2 ${item.myProfit > 0 ? 'text-green-500' : 'text-red-500'}`}
                            >
                              {formatNumber(item.myProfit)}
                            </td>

                            <td className='border border-gray-300 p-2'>0</td>
                            <td
                              className={`border border-gray-300 p-2 ${item.myProfit > 0 ? 'text-green-500' : 'text-red-500'}`}
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

                <div className='mt-4 flex justify-end gap-4'>
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
        </div>
      </div>
    </>
  );
};

export default UserProfitLossByEvent;
