import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getMyRepostsDataByEvents,
  getPLfilterData,
} from '../redux/reducer/downlineReducer';
import { formatGameName } from '../utils/formatGameName';
import { useLocation } from 'react-router-dom';

// import getMyRepostsDataByEvents

const DownPLmaster = () => {
  const { eventName } = useParams();
  const location = useLocation();
  const { gameName } = location.state || {};
  const dispatch = useDispatch();
  const { plfilter, loading } = useSelector((state) => state.downline);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pastdate, setPastDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const navigate = useNavigate();

  console.log(eventName, 'eventName');
  console.log(gameName, 'gameName');

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString();
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState('LIVE DATA');

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
        eventName: eventName,
        gameName: gameName,
        marketName: '',
        userName: '',
      })
    );
  }, [dispatch, page, limit, startDate, endDate]);

  return (
    <>
      <Navbar />
      <div className='p-2'>
        {/* Filter Section */}
        <div className='mb-4 rounded-lg border border-gray-900 bg-[#e0e6e6] p-4 text-[15px]'>
          <div className='flex flex-col items-end gap-4 md:flex-row'>
            <div className='w-full md:w-1/4'>
              <label className='mb-1 block'>Data Source</label>
              <select
                value={selectedOption}
                onChange={handleOptionChange}
                className='col-span-1 w-full border border-gray-300 bg-[#e0e6e6] p-2 text-sm'
              >
                <option>LIVE DATA</option>
                <option>BACKUP DATA</option>
                <option>OLD DATA</option>
              </select>
            </div>
            <div className='w-full md:w-1/4'>
              <label className='mb-1 block'>From</label>
              <div className='relative'>
                <input
                  type='date'
                  className='w-full rounded border border-gray-300 p-2'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className='w-full md:w-1/4'>
              <label className='mb-1 block'>To</label>
              <div className='relative'>
                <input
                  type='date'
                  className='w-full rounded border border-gray-300 p-2'
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
        <div className='border border-gray-300 bg-white text-[15px]'>
          <div className='bg-dark px-3 py-1 text-white'>
            <h2 className='text-base font-bold'>Profit Loss</h2>
          </div>

          <div className='p-4'>
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

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='bg-gray-200 text-center'>
                    <th className='border border-gray-300 p-2 text-center'>
                      <div className='flex items-center justify-center text-[13px]'>
                        Sports Name
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='ml-1 h-4 w-4'
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
                        Event Name
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='ml-1 h-4 w-4'
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
                        Market Name
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='ml-1 h-4 w-4'
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
                        Result
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='ml-1 h-4 w-4'
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
                        Profit / Loss
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='ml-1 h-4 w-4'
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
                        Commission
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='ml-1 h-4 w-4'
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
                        Setteled Time
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='ml-1 h-4 w-4'
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
                        colSpan={7}
                        className='border border-gray-300 p-4 text-center'
                      >
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loading && PLdata?.length > 0 ? (
                    PLdata.map((item, index) => (
                      <tr
                        key={index}
                        className='text-center text-sm font-semibold hover:bg-gray-100'
                      >
                        <td className='border border-gray-300 p-2 font-[400]'>
                          {formatGameName(item.gameName)}
                        </td>
                        <td className='border border-gray-300 p-2'>
                          {item.eventName}
                        </td>
                        <td
                          className='cursor-pointer border border-gray-300 p-2 text-[#2789ce]'
                          onClick={() =>
                            navigate(`/eventpluser/${item.name}`, {
                              state: {
                                gameName: item.gameName,
                                eventName: item.eventName,
                              },
                            })
                          }
                        >
                          {item.marketName}
                        </td>
                        <td className='border border-gray-300 p-2'>0</td>
                        <td
                          className={`border border-gray-300 p-2 ${item.myProfit > 0 ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {item.myProfit}
                        </td>
                        <td
                          className={`border border-gray-300 p-2 ${item.myProfit > 0 ? 'text-red-500' : 'text-green-500'}`}
                        >
                          0
                        </td>
                        <td className='border border-gray-300 p-2 font-[400]'>
                          {item.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
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

export default DownPLmaster;
