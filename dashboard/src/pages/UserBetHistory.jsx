import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { getPLfilterData } from '../redux/reducer/downlineReducer';
import { formatGameName } from '../utils/formatGameName';

const UserBetHistory = () => {
  const { userName } = useParams();
  const [searchParams] = useSearchParams();
  // Read from location.state (passed from EventPLuser navigation)
  const gameName = searchParams.get('gameName') || '';
  const eventName = searchParams.get('eventName') || '';
  const marketName = searchParams.get('marketName') || '';

  const dispatch = useDispatch();
  const { plfilter, loading } = useSelector((state) => state.downline);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); //eslint-disable-line
  const [pastdate, setPastDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString().split('T')[0]; // ✅ Fix: Use consistent date format

  //  FIX: Initialize dates correctly based on selectedOption
  const defaultSelectedOption = 'LIVE DATA';
  const getInitialDates = (option) => {
    if (option === 'LIVE DATA') {
      return {
        startDate: formatDate(currentDate),
        endDate: formatDate(currentDate),
      };
    } else if (option === 'BACKUP DATA') {
      return {
        startDate: formatDate(oneMonthAgo),
        endDate: formatDate(currentDate),
      };
    } else {
      const fiveMonthAgo = new Date();
      fiveMonthAgo.setMonth(currentDate.getMonth() - 12);
      return {
        startDate: formatDate(fiveMonthAgo),
        endDate: formatDate(currentDate),
      };
    }
  };

  const initialDates = getInitialDates(defaultSelectedOption);
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);
  const [limit, setLimit] = useState(10); //eslint-disable-line
  const [page, setPage] = useState(1); //eslint-disable-line
  const [selectedOption, setSelectedOption] = useState(defaultSelectedOption);

  useEffect(() => {
    const currentDate = new Date();
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

  const PLdata = plfilter?.report;

  console.log(plfilter, 'plfilter');

  useEffect(() => {
    dispatch(
      getPLfilterData({
        page,
        limit,
        startDate,
        endDate,
        eventName,
        gameName,
        marketName,
        userName,
      })
    );
  }, [
    dispatch,
    page,
    limit,
    startDate,
    endDate,
    gameName,
    eventName,
    marketName,
    userName,
  ]);

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
      <div className='w-full overflow-x-hidden'>
        <div className='mx-auto overflow-auto px-[30px] text-[13px]'>
          <div className='mb-2 flex items-center justify-end'>
            <div className='ml-[4px] border bg-[#72bbef] p-[5px]'>Back</div>
            <div className='ml-[4px] border bg-[#faa9ba] p-[5px]'>Lay</div>
            <div className='ml-[4px] border p-[5px]'>Void</div>
          </div>
          <div
            className='w-full px-2.5 py-[5px] text-[15px] font-bold text-white'
            style={{
              background: 'linear-gradient(-180deg, #2E4B5E 0%, #243A48 82%)',
            }}
          >
            Bet History
          </div>
          <div className='overflow-auto rounded-b-sm border border-gray-400/60 bg-white font-semibold'>
            {loading && (
              <div className='mt-4 p-4 text-center'>
                <p>Loading data...</p>
              </div>
            )}
            {!loading && (
              <table className='mb-4 w-full'>
                <thead>
                  <tr className='bg-[#e0e6e6]'>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      Sports Name
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      Event Name
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      Market Name
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      Runner Name
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      Bet Type
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      User price
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      Amount
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      PL
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      Place Date
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center'>
                      Match Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PLdata?.map((event, i) => (
                    <tr
                      key={i}
                      className={`text-[13px] font-[400] ${event.otype === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}
                    >
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {formatGameName(event.gameName)}
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center uppercase'>
                        <span>{event.eventName}</span>
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {' '}
                        <span> {event.marketName}</span>
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center uppercase'>
                        {event.teamName}
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center uppercase'>
                        {event.otype}
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {event.gameType === 'Normal'
                          ? `${event.fancyScore}/`
                          : ''}
                        {event.xValue}
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {event.otype === 'back' ? event.price : event.betAmount}
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {/* <span>{event.price}</span> */}
                        <span
                          className={`${event.status === 2 ? 'text-red-500' : 'text-green-800'}`}
                        >
                          ({formatNumber(event.resultAmount)})
                        </span>
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {new Date(event.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className='border border-gray-300 px-4 py-2 text-center'>
                        {new Date(event.date).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBetHistory;
