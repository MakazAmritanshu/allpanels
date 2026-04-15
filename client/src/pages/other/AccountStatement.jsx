import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getTransactionHistory,
  getBetHistory,
} from '../../redux/reducer/betReducer';
import ResultInfoPopup from './ResultInfoPopup';

// Format date as DD/MM/YYYY HH:MM:SS
const formatStatementDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${h}:${min}:${sec}`;
};

// Build remark for sports report: "GameName / EventName / GameType/MarketName/Result"
const buildSportsRemark = (row) => {
  const result = row.betResult ?? row.fancyScore ?? '';
  const str = [
    row.gameName || '',
    row.eventName || '',
    [row.gameType, row.marketName, result].filter(Boolean).join('/'),
  ]
    .filter(Boolean)
    .join(' / ');
  return str || '-';
};

function AccountStatement() {
  const dispatch = useDispatch();
  const { transHistory, betHistory, loading, pagination } = useSelector(
    (state) => state.bet
  );

  // Date setup - default to last 4 months
  const currentDate = new Date();
  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(currentDate.getMonth() - 4);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const [reportType, setReportType] = useState('deposits');
  const [startDate, setStartDate] = useState(formatDate(fourMonthsAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [goToPage, setGoToPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ pages: 1, total: 0 });
  const [resultPopupRow, setResultPopupRow] = useState(null);

  // Fetch transaction history (deposits)
  const fetchTransactions = useCallback(() => {
    if (!startDate || !endDate) return;
    if (reportType === 'deposits') {
      dispatch(
        getTransactionHistory({
          startDate,
          endDate,
          page,
          limit,
        })
      ).then((result) => {
        if (result.payload?.success) {
          const total = result.payload?.data?.length || 0;
          const pages = Math.ceil(total / limit) || 1;
          setPaginationInfo({ pages, total });
        }
      });
    }
  }, [dispatch, startDate, endDate, page, limit, reportType]);

  // Fetch bet history (sports report)
  const fetchSportsReport = useCallback(() => {
    if (!startDate || !endDate) return;
    if (reportType === 'sports') {
      dispatch(
        getBetHistory({
          startDate,
          endDate,
          page,
          limit,
          selectedVoid: 'settel',
          selectedGame: 'Sport',
        })
      ).then((result) => {
        const payload = result.payload;
        if (payload?.pagination) {
          setPaginationInfo({
            pages: payload.pagination.pages || 1,
            total: payload.pagination.total || 0,
          });
        } else if (Array.isArray(payload?.data)) {
          setPaginationInfo({
            pages: Math.ceil((payload.data.length || 0) / limit) || 1,
            total: payload.data.length || 0,
          });
        }
      });
    }
  }, [dispatch, startDate, endDate, page, limit, reportType]);

  // Fetch bet history (casino report) – same API as sports with selectedGame: 'Casino'
  const fetchCasinoReport = useCallback(() => {
    if (!startDate || !endDate) return;
    if (reportType === 'casino') {
      dispatch(
        getBetHistory({
          startDate,
          endDate,
          page,
          limit,
          selectedVoid: 'settel',
          selectedGame: 'Casino',
        })
      ).then((result) => {
        const payload = result.payload;
        if (payload?.pagination) {
          setPaginationInfo({
            pages: payload.pagination.pages || 1,
            total: payload.pagination.total || 0,
          });
        } else if (Array.isArray(payload?.data)) {
          setPaginationInfo({
            pages: Math.ceil((payload.data.length || 0) / limit) || 1,
            total: payload.data.length || 0,
          });
        }
      });
    }
  }, [dispatch, startDate, endDate, page, limit, reportType]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (reportType === 'deposits') {
      fetchTransactions();
    } else if (reportType === 'sports') {
      fetchSportsReport();
    } else if (reportType === 'casino') {
      fetchCasinoReport();
    }
  }, [fetchTransactions, fetchSportsReport, fetchCasinoReport, reportType]);

  // Update goToPage when page changes
  useEffect(() => {
    setGoToPage(page);
  }, [page]);

  // Filter transactions by search term (deposits)
  const filteredTransactions =
    transHistory?.filter((transaction) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.remark?.toLowerCase().includes(searchLower) ||
        transaction.userName?.toLowerCase().includes(searchLower) ||
        transaction.amount?.toString().includes(searchLower) ||
        (transaction.date &&
          new Date(transaction.date)
            .toLocaleString()
            .toLowerCase()
            .includes(searchLower))
      );
    }) || [];

  // Filter sports bet history by search term
  const filteredSports =
    betHistory?.filter((row) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const remark = buildSportsRemark(row);
      return (
        remark.toLowerCase().includes(searchLower) ||
        row.eventName?.toLowerCase().includes(searchLower) ||
        row.marketName?.toLowerCase().includes(searchLower) ||
        String(row.profitLossChange ?? '').includes(searchTerm) ||
        (row.date &&
          formatStatementDate(row.date).toLowerCase().includes(searchLower))
      );
    }) || [];

  // Total pages and data to show
  const totalPages =
    reportType === 'deposits'
      ? Math.ceil(filteredTransactions.length / limit) || 1
      : reportType === 'sports' || reportType === 'casino'
        ? paginationInfo.pages || 1
        : 1;

  const paginatedData =
    reportType === 'deposits'
      ? filteredTransactions.slice((page - 1) * limit, page * limit)
      : reportType === 'sports' || reportType === 'casino'
        ? filteredSports
        : [];

  // Update pagination info
  useEffect(() => {
    if (reportType === 'deposits') {
      setPaginationInfo({
        pages: totalPages,
        total: filteredTransactions.length,
      });
    }
  }, [reportType, totalPages, filteredTransactions.length]);

  const handleSubmit = () => {
    setPage(1);
    setGoToPage(1);
    if (reportType === 'deposits') {
      fetchTransactions();
    } else if (reportType === 'sports') {
      fetchSportsReport();
    } else if (reportType === 'casino') {
      fetchCasinoReport();
    }
  };

  return (
    <div className='w-full overflow-x-auto p-0.5'>
      <div className='w-full border border-[#00000020] bg-[#fff] shadow-[0_0_5px_#a4a4a4]'>
        <div className='bg-secondary text-secondary p-2'>
          <h4 className='text-[16px] font-[400]'>Account Statement</h4>
        </div>
        <div className='mb-2 w-full p-2'>
          <div className='flex flex-wrap gap-2'>
            <div className='flex gap-2'>
              <input
                type='date'
                placeholder='Start Date'
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <input
                type='date'
                placeholder='End Date'
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <select
              name='type'
              id='type'
              className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setPage(1);
                setGoToPage(1);
              }}
            >
              <option value='deposits'>Deposite/Withdraw Reports</option>
              <option value='sports'>Sport Reports</option>
              <option value='casino'>Casino Reports</option>
            </select>
            <button
              onClick={handleSubmit}
              className='bg-primary text-primary h-[38px] w-full rounded-xs px-4 py-1 text-[16px] font-[400] lg:w-auto'
            >
              Submit
            </button>
          </div>
          <div className='mt-4 flex items-center justify-between gap-2'>
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
                  setGoToPage(1);
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
            <table className='w-full min-w-[700px] border border-gray-300'>
              <thead>
                <tr className='bg-[#e0e6e6]'>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Date
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Sr no
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Credit
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Debit
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Pts
                  </th>
                  <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan='6'
                      className='h-8 border border-gray-300 p-2 text-center'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : reportType === 'deposits' && paginatedData.length > 0 ? (
                  paginatedData.map((transaction, index) => (
                    <tr
                      key={transaction._id || index}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {transaction.date
                          ? new Date(transaction.date).toLocaleString()
                          : '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {transaction.deposite > 0
                          ? transaction.deposite.toFixed(2)
                          : '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {transaction.withdrawl > 0
                          ? transaction.withdrawl.toFixed(2)
                          : '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {transaction.amount || '-'}
                      </td>
                      <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                        {transaction.remark || '-'}
                      </td>
                    </tr>
                  ))
                ) : (reportType === 'sports' || reportType === 'casino') &&
                  paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => {
                    const pl = Number(row.profitLossChange);
                    const isNegative = pl < 0;
                    const isPositive = pl > 0;
                    const redClass = 'text-red-600';
                    const greenClass = 'text-[#086f3f]';
                    return (
                      <tr
                        key={row._id || index}
                        className={`cursor-pointer ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
                        onClick={() => setResultPopupRow(row)}
                      >
                        <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                          {formatStatementDate(row.date)}
                        </td>
                        <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td
                          className={`h-8 border border-gray-300 p-2 text-left text-sm ${isPositive ? greenClass : ''}`}
                        >
                          {pl >= 0 ? pl : '-'}
                        </td>
                        <td
                          className={`h-8 border border-gray-300 p-2 text-left text-sm ${isNegative ? redClass : ''}`}
                        >
                          {pl < 0 ? pl : '-'}
                        </td>
                        <td
                          className={`h-8 border border-gray-300 p-2 text-left text-sm ${isPositive ? greenClass : ''} ${isNegative ? redClass : ''}`}
                        >
                          {pl}
                        </td>
                        <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                          {buildSportsRemark(row)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan='6'
                      className='h-8 border border-gray-300 p-2 text-center'
                    >
                      {reportType === 'deposits' ||
                      reportType === 'sports' ||
                      reportType === 'casino'
                        ? 'No data found'
                        : 'Coming soon'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading &&
            (reportType === 'deposits' ||
              reportType === 'sports' ||
              reportType === 'casino') &&
            paginatedData.length > 0 &&
            paginationInfo.pages > 1 && (
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
                    disabled={page >= paginationInfo.pages}
                    onClick={() => {
                      setPage((p) => p + 1);
                      setGoToPage((p) => p + 1);
                    }}
                    className='border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white'
                  >
                    Next
                  </button>
                  <button
                    disabled={page >= paginationInfo.pages}
                    onClick={() => {
                      const lastPage = paginationInfo.pages;
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
                    {paginationInfo.pages || 0}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm'>Go to Page</span>
                  <input
                    type='number'
                    min='1'
                    max={paginationInfo.pages || 1}
                    value={goToPage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= (paginationInfo.pages || 1)) {
                        setGoToPage(value);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = parseInt(goToPage);
                        if (
                          value >= 1 &&
                          value <= (paginationInfo.pages || 1)
                        ) {
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

      {resultPopupRow && (
        <ResultInfoPopup
          onClose={() => setResultPopupRow(null)}
          gameName={resultPopupRow.gameName}
          eventName={resultPopupRow.eventName}
          marketName={resultPopupRow.marketName}
          marketId={resultPopupRow.market_id}
          gameType={resultPopupRow.gameType}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}

export default AccountStatement;
