import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBetHistory } from '../../redux/reducer/betReducer';

function CurrentBets() {
  const dispatch = useDispatch();
  const { betHistory, loading, pagination } = useSelector((state) => state.bet);

  // Date setup - default to last 4 months
  const currentDate = new Date();
  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(currentDate.getMonth() - 4);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const [betType, setBetType] = useState('all');
  const [startDate, setStartDate] = useState(formatDate(fourMonthsAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedGame, setSelectedGame] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [goToPage, setGoToPage] = useState(1);
  const [selectedVoid, setSelectedVoid] = useState('unsettel');

  // Fetch bets function
  const fetchBets = useCallback(() => {
    if (!startDate || !endDate) return;
    dispatch(
      getBetHistory({
        startDate,
        endDate,
        page,
        selectedGame,
        selectedVoid,
        limit,
      })
    );
  }, [dispatch, startDate, endDate, page, selectedGame, selectedVoid, limit]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  // Update goToPage when page changes
  useEffect(() => {
    setGoToPage(page);
  }, [page]);

  // Filter bets by type (all/back/lay) and search term
  const filteredBets =
    betHistory?.filter((bet) => {
      const matchesType = betType === 'all' || bet.otype === betType;
      const matchesSearch =
        !searchTerm ||
        bet.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.marketName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.gameName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    }) || [];

  // Calculate totals
  const totalBets = filteredBets.length;
  const totalAmount = filteredBets.reduce((sum, bet) => {
    const amount = bet.otype === 'back' ? bet.price : bet.betAmount;
    return sum + (parseFloat(amount) || 0);
  }, 0);

  return (
    <div className='w-full overflow-x-auto p-0.5'>
      <div className='w-full border border-[#00000020] bg-[#fff] shadow-[0_0_5px_#a4a4a4]'>
        <div className='bg-secondary text-secondary p-2'>
          <h4 className='text-[16px] font-[400]'>Current Bets</h4>
        </div>
        <div className='mb-2 w-full p-2'>
          <div className='flex flex-wrap gap-2'>
            <select
              name='type'
              id='type'
              className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
            >
              <option value=''>All Sports</option>
              <option value='Cricket Game'>Cricket</option>
              <option value='Tennis Game'>Tennis</option>
              <option value='Soccer Game'>Soccer</option>
              <option value='Casino'>Casino</option>
              <option value='Horse Racing Game'>Horse Racing</option>
              <option value='Greyhound Racing Game'>Greyhound Racing</option>
              <option value='Basket Ball Game'>Basket Ball</option>
              <option value='Lottery Game'>Lottery</option>
            </select>
            <input
              type='date'
              className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <input
              type='date'
              className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <select
              name='voidType'
              id='voidType'
              className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              value={selectedVoid}
              onChange={(e) => {
                setSelectedVoid(e.target.value);
                setPage(1);
              }}
            >
              <option value='settel'>Settel</option>
              <option value='void'>Void</option>
              <option value='unsettel'>Unsettel</option>
            </select>
            <button
              onClick={fetchBets}
              className='bg-primary text-primary h-[38px] w-full rounded-xs px-4 py-1 text-[16px] font-[400] lg:w-auto'
            >
              Submit
            </button>
          </div>
          <div className='mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            {/* First Row: Show Entries + Radio Buttons */}
            <div className='flex flex-col items-start gap-3 sm:flex-row sm:items-center'>
              <div className='flex items-center gap-2'>
                <span className='text-[16px] font-[400]'>Show</span>
                <select
                  name='entries'
                  id='entries'
                  className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value='10'>10</option>
                  <option value='20'>20</option>
                  <option value='30'>30</option>
                  <option value='40'>40</option>
                  <option value='50'>50</option>
                </select>
                <span className='text-[16px] font-[400]'>Entries</span>
              </div>
              <div className='flex items-center gap-4'>
                <label className='flex cursor-pointer items-center gap-2'>
                  <input
                    type='radio'
                    name='betType'
                    value='all'
                    checked={betType === 'all'}
                    onChange={(e) => setBetType(e.target.value)}
                    className='h-4 w-4 cursor-pointer'
                  />
                  <span className='text-[16px] font-[400]'>All</span>
                </label>
                <label className='flex cursor-pointer items-center gap-2'>
                  <input
                    type='radio'
                    name='betType'
                    value='back'
                    checked={betType === 'back'}
                    onChange={(e) => setBetType(e.target.value)}
                    className='h-4 w-4 cursor-pointer'
                  />
                  <span className='text-[16px] font-[400]'>Back</span>
                </label>
                <label className='flex cursor-pointer items-center gap-2'>
                  <input
                    type='radio'
                    name='betType'
                    value='lay'
                    checked={betType === 'lay'}
                    onChange={(e) => setBetType(e.target.value)}
                    className='h-4 w-4 cursor-pointer'
                  />
                  <span className='text-[16px] font-[400]'>Lay</span>
                </label>
              </div>
            </div>

            {/* Second Row: Total Bets and Total Amount */}
            <div className='flex items-center gap-4 border-l-0 border-[#c7c8ca] pl-0 lg:border-l lg:pl-4'>
              <span className='text-[16px] font-[400]'>
                Total Bets: {totalBets}
              </span>
              <span className='text-[16px] font-[400]'>
                Total Amount: {totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Third Row: Search */}
            <div className='flex items-center gap-2'>
              <span className='text-[16px] font-[400]'>Search:</span>
              <input
                type='text'
                placeholder='Search'
                className='h-[38px] w-[90px] border border-[#dbdbdb] p-1 outline-none lg:w-auto'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className='scrollbar-hide mt-4 overflow-x-auto'>
            <table className='w-full min-w-[800px] border border-gray-300'>
              <thead>
                <tr className='bg-[#e0e6e6]'>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Sports
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Event Name
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Market Name
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Nation
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    User Rate
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Amount
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Place Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan='7'
                      className='h-8 border border-gray-300 p-2 text-center'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredBets.length > 0 ? (
                  filteredBets.map((bet, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {bet.gameName || '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {bet.eventName || '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {bet.marketName || '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {bet.teamName || '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {bet.xValue || '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {bet.otype === 'back'
                          ? bet.price
                          : bet.betAmount || '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {bet.createdAt
                          ? new Date(bet.createdAt).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan='7'
                      className='h-8 border border-gray-300 p-2 text-center'
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && filteredBets.length > 0 && pagination?.pages > 0 && (
            <div className='mt-4 flex flex-col items-center gap-3'>
              <div className='flex items-center gap-2'>
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    setPage(1);
                    setGoToPage(1);
                  }}
                  className='border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white'
                >
                  First
                </button>
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => p - 1);
                    setGoToPage((p) => p - 1);
                  }}
                  className='border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white'
                >
                  Previous
                </button>
                <button
                  disabled={page >= (pagination?.pages || 1)}
                  onClick={() => {
                    setPage((p) => p + 1);
                    setGoToPage((p) => p + 1);
                  }}
                  className='border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white'
                >
                  Next
                </button>
                <button
                  disabled={page >= (pagination?.pages || 1)}
                  onClick={() => {
                    const lastPage = pagination?.pages || 1;
                    setPage(lastPage);
                    setGoToPage(lastPage);
                  }}
                  className='border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white'
                >
                  Last
                </button>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm'>Page</span>
                <span className='text-sm font-semibold'>{page}</span>
                <span className='text-sm'>of</span>
                <span className='text-sm font-semibold'>
                  {pagination?.pages || 0}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm'>Go to Page</span>
                <input
                  type='number'
                  min='1'
                  max={pagination?.pages || 1}
                  value={goToPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= (pagination?.pages || 1)) {
                      setGoToPage(value);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseInt(goToPage);
                      if (value >= 1 && value <= (pagination?.pages || 1)) {
                        setPage(value);
                      }
                    }
                  }}
                  className='w-16 border border-gray-300 px-2 py-1 text-center text-sm'
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurrentBets;
