import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getDownLinefilterData,
  getMyRepostsDataByEvents,
} from '../redux/reducer/downlineReducer';
import Spinner2 from '../components/Spinner2';

// import getMyRepostsDataByEvents

const DownPL = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dlfilter, loading } = useSelector((state) => state.downline);
  // console.log("object", dlfilter, "downline");
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState('BACKUP DATA');

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
      setStartDate(formatDate(fiveMonthAgo)); // Or set a very old date if needed
      setEndDate(formatDate(currentDate));
    }
  }, [selectedOption]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    // setStartDate(event.target.value)
  };
  console.log('DLFILTER', dlfilter);

  const PLdata = dlfilter?.downlineProfitReport;
  console.log('PLDATA', PLdata);

  const filteredData =
    PLdata?.filter((item) => {
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      return item?.userName?.toString().toLowerCase().includes(searchLower);
    }) || [];

  // Debug: Check userId type and structure
  useEffect(() => {
    if (PLdata && PLdata.length > 0) {
      const firstItem = PLdata[0];
      console.log('🔍 STEP 1 DEBUG - First item in PLdata:', firstItem);
      console.log('🔍 STEP 1 DEBUG - userId value:', firstItem.userId);
      console.log('🔍 STEP 1 DEBUG - userId type:', typeof firstItem.userId);
      console.log(
        '🔍 STEP 1 DEBUG - userId constructor:',
        firstItem.userId?.constructor?.name
      );

      // Check if it has toString method
      if (firstItem.userId && typeof firstItem.userId === 'object') {
        console.log(
          '🔍 STEP 1 DEBUG - userId.toString():',
          firstItem.userId.toString()
        );
      }

      // Check String conversion
      console.log(
        '🔍 STEP 1 DEBUG - String(userId):',
        String(firstItem.userId)
      );

      // Check all items
      console.log(
        '🔍 STEP 1 DEBUG - All userIds in PLdata:',
        PLdata.map((item) => ({
          userId: item.userId,
          type: typeof item.userId,
          userName: item.userName,
        }))
      );
    }
  }, [PLdata]);

  const Totaldata = dlfilter?.overallProfit;
  console.log('TOTALDATA', Totaldata);

  // console.log(dlfilter, "myReportseventData");

  useEffect(() => {
    dispatch(
      getDownLinefilterData({
        page,
        limit,
        startDate,
        endDate,
        gameName: '',
        eventName: '',
        marketName: '',
        userName: '',
        targetUserId: '',
      })
    );
  }, [dispatch, page, limit, startDate, endDate]);

  // const handelnavigate = (item) => {
  //   console.log(item, 'item');
  //   if (item.role === 'user') {
  //     // User → Navigate to user profile with P&L tab
  //     navigate(`/online-user/${item.userId}`, { state: { activeTab: 'PL' } });
  //   } else {
  //     // Admin → Navigate to downplteam to see their downlines
  //     navigate(`/downplteam/${item.userId}`);
  //   }
  // };

  const handelnavigate = (item) => {
    console.log('🔍 STEP 2 - Navigation triggered');
    console.log('🔍 STEP 2 - Full item object:', item);
    console.log('🔍 STEP 2 - item.userId:', item.userId);
    console.log('🔍 STEP 2 - item.role:', item.role);
    console.log('🔍 STEP 2 - item.userName:', item.userName);

    // Validate userId
    if (!item.userId) {
      console.error('❌ STEP 2 ERROR - userId is missing!', item);
      alert(
        'Error: User ID is missing. Please refresh the page and try again.'
      );
      return;
    }

    // Ensure userId is a string (should already be, but double-check)
    const userId = String(item.userId).trim();

    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('❌ STEP 2 ERROR - Invalid userId:', userId);
      alert('Error: Invalid User ID. Please refresh the page and try again.');
      return;
    }

    console.log('🔍 STEP 2 - Final userId to navigate:', userId);

    // Build query string with filter parameters
    const queryParams = `?filter=${selectedOption}&startDate=${startDate}&endDate=${endDate}`;

    try {
      if (item.role === 'user') {
        // User → Navigate to user profile with P&L tab
        const targetUrl = `/online-user/${userId}${queryParams}`;
        console.log('✅ STEP 2 - Navigating to user profile:', targetUrl);
        console.log('✅ STEP 2 - Navigation state:', { activeTab: 'PL' });

        navigate(targetUrl, {
          state: {
            activeTab: 'PL',
            filter: selectedOption,
            startDate: startDate,
            endDate: endDate,
          },
        });
      } else {
        // Admin → Navigate to downplteam to see their downlines
        const targetUrl = `/downplteam/${userId}${queryParams}`;
        console.log('✅ STEP 2 - Navigating to downline team:', targetUrl);

        navigate(targetUrl);
      }
    } catch (error) {
      console.error('❌ STEP 2 ERROR - Navigation exception:', error);
      alert('Error navigating to user page: ' + error.message);
    }
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
      <div className='px-[15px] md:px-[30px]'>
        {/* Filter Section */}
        <div className='mb-[24px] rounded-sm border border-gray-900 bg-[#e0e6e6] p-2.5'>
          <div className='mb-[6px] flex flex-col items-end gap-4 md:flex-row'>
            <div className='w-full md:w-1/7'>
              <label className='block'>Data Source</label>
              <select
                value={selectedOption}
                onChange={handleOptionChange}
                className='col-span-1 w-full rounded-sm border border-gray-300 bg-white p-2 text-sm text-[#5c6873] outline-0'
              >
                <option>LIVE DATA</option>
                <option>BACKUP DATA</option>
                <option>OLD DATA</option>
              </select>
            </div>
            <div className='w-full md:w-1/7'>
              <label className='block'>From</label>
              <div className='relative'>
                <input
                  type='date'
                  className='w-full rounded border border-gray-400/50 p-2'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className='w-full md:w-1/7'>
              <label className='block'>To</label>
              <div className='relative'>
                <input
                  type='date'
                  className='w-full rounded border border-gray-400/50 p-2'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div>
              <button className='bg-dark rounded px-4 py-2 font-bold text-white'>
                Get P&L
              </button>
            </div>
          </div>
        </div>

        {/* Statement Table */}
        <div className='border border-gray-300 bg-white'>
          <div className='bg-dark rounded-t-sm px-2.5 py-[5px] text-white'>
            <h2 className='text-[15px] font-bold'>Profit Loss</h2>
          </div>

          <div className='p-5'>
            <div className='mb-4 flex flex-col items-center text-[13px] md:flex-row md:justify-between'>
              <div className='my-2 flex items-center gap-1 font-[500]'>
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
              <div className='flex items-center'>
                <span className='mr-2'>Search:</span>
                <input
                  type='text'
                  className='rounded border border-gray-300 px-2 py-1'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border-2 border-gray-300'>
                <thead>
                  <tr className='bg-[#e0e6e6] text-center'>
                    <th className='border border-gray-300 p-2 text-left'>
                      <div className='relative flex items-center justify-center text-[13px]'>
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
                      <div className='relative flex items-center justify-center text-[13px]'>
                        Upline Profit / Loss
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
                        Downline Profit / Loss
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
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className='border-2 border-gray-300 p-4 text-center'
                      >
                        <div className='fixed top-52 left-[40%] py-4 text-center'>
                          <Spinner2 />
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && filteredData?.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr key={index} className='text-center hover:bg-gray-100'>
                        <td
                          className='cursor-pointer border-2 border-gray-300 p-2 text-[#2789ce] lowercase'
                          onClick={() => handelnavigate(item)}
                        >
                          {item.userName}
                        </td>
                        <td
                          className={`border-2 border-gray-300 p-2 font-semibold ${
                            item.directBettingPL > 0
                              ? 'text-red-500'
                              : 'text-green-500'
                          }`}
                        >
                          {/* {formatNumber(item?.uplineBettingProfitLoss)} */}
                          {formatNumber(item?.netProfit)}
                        </td>
                        <td
                          className={`border-2 border-gray-300 p-2 font-semibold ${
                            item.directBettingPL > 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {formatNumber(item?.netProfit)}
                        </td>
                        <td className='border-2 border-gray-300 p-2'>0</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className='border border-gray-300 p-4 text-center'
                      >
                        No data available in table
                      </td>
                    </tr>
                  )}
                  {!loading && filteredData?.length > 0 && (
                    <tr className='text-center font-semibold'>
                      <td className='border border-gray-300 p-2'>Total</td>
                      <td className={`border border-gray-300 p-2`}>
                        {formatNumber(Totaldata?.netProfit)}
                      </td>
                      <td className={`border border-gray-300 p-2`}>
                        {formatNumber(Totaldata?.netProfit)}
                      </td>
                      <td className='border border-gray-300 p-2'>0</td>
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
    </>
  );
};

export default DownPL;
