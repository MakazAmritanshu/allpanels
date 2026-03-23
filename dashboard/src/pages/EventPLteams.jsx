import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  getMyRepostsDataByEvents,
  getPLfilterData,
} from '../redux/reducer/downlineReducer';
import { formatGameName } from '../utils/formatGameName';
import Spinner2 from '../components/Spinner2';

const EventPLteams = () => {
  const { gameName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { plfilter, loading } = useSelector((state) => state.downline);

  // Get filter from URL query params
  const filterFromUrl = searchParams.get('filter') || 'BACKUP DATA';
  const startDateFromUrl = searchParams.get('startDate');
  const endDateFromUrl = searchParams.get('endDate');

  // Calculate dates based on filter option
  const getDatesFromFilter = (filterOption) => {
    const currentDate = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(currentDate.getDate() - 1);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    const fiveMonthAgo = new Date();
    fiveMonthAgo.setMonth(currentDate.getMonth() - 12);

    const formatDate = (date) => date.toISOString();

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
  const dates =
    startDateFromUrl && endDateFromUrl
      ? { startDate: startDateFromUrl, endDate: endDateFromUrl }
      : getDatesFromFilter(filterFromUrl);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState(filterFromUrl);

  // Update selectedOption when URL param changes
  useEffect(() => {
    if (filterFromUrl) {
      setSelectedOption(filterFromUrl);
    }
  }, [filterFromUrl]);

  // Use state for dates, but initialize from URL
  const [startDate, setStartDate] = useState(dates.startDate);
  const [endDate, setEndDate] = useState(dates.endDate);

  // Update dates when URL params change
  useEffect(() => {
    if (startDateFromUrl && endDateFromUrl) {
      setStartDate(startDateFromUrl);
      setEndDate(endDateFromUrl);
    } else {
      const calculatedDates = getDatesFromFilter(filterFromUrl);
      setStartDate(calculatedDates.startDate);
      setEndDate(calculatedDates.endDate);
    }
  }, [startDateFromUrl, endDateFromUrl, filterFromUrl]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const PLdata = plfilter?.report;

  console.log(plfilter, 'plfilter');

  useEffect(() => {
    dispatch(
      getPLfilterData({
        page,
        limit,
        startDate,
        endDate,
        gameName,
        eventName: '',
        marketName: '',
        userName: '',
      })
    );
  }, [dispatch, page, limit, startDate, endDate, gameName]);

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
      <div className='px-3.5 md:px-7.5'>
        {/* Filter Section */}

        {/* Statement Table */}
        <div className='border border-gray-300 bg-white'>
          <div className='bg-dark px-2.5 py-[5px] text-white'>
            <h2 className='text-base text-[15px] font-bold'>
              Profit & Loss Events
            </h2>
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
              <table className='w-full'>
                <thead>
                  <tr className='bg-gray-300/70 text-center'>
                    <th className='border border-gray-300 p-2.5 text-center'>
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
                    <th className='border border-gray-300 p-2.5 text-center'>
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
                    <th className='border border-gray-300 p-2.5 text-center'>
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
                    <th className='border border-gray-300 p-2.5 text-center'>
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
                    <th className='border border-gray-300 p-2.5 text-center'>
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
                      <tr key={index} className='text-center hover:bg-gray-100'>
                        <td className='border border-gray-300 p-2 font-[400]'>
                          {formatGameName(item.gameName)}
                        </td>
                        <td
                          className='cursor-pointer border border-gray-300 p-2 text-[#2789ce] uppercase'
                          onClick={() =>
                            navigate(
                              `/eventplmaster/${item.name}?filter=${selectedOption}&startDate=${startDate}&endDate=${endDate}`,
                              { state: { gameName: item.gameName } }
                            )
                          }
                        >
                          {formatGameName(item.name)}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 font-bold ${item.myProfit > 0 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {formatNumber(item.myProfit)}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 font-bold ${item.myProfit > 0 ? 'text-green-500' : 'text-red-600'}`}
                        >
                          {formatNumber(item.myProfit)}
                        </td>
                        <td className='border border-gray-300 p-2'>0</td>
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
    </>
  );
};

export default EventPLteams;
