import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUser,
  getLoginHistory,
  passwordHistory,
} from '../../redux/reducer/authReducer';

function ActivityLog() {
  const dispatch = useDispatch();
  const { LoginData, passwordData, loading, pagination } = useSelector(
    (state) => state.auth
  );
  const { userInfo } = useSelector((state) => state.auth);

  // Date setup - default to last 4 months
  const currentDate = new Date();
  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(currentDate.getMonth() - 4);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const [logType, setLogType] = useState('login');
  const [startDate, setStartDate] = useState(formatDate(fourMonthsAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [goToPage, setGoToPage] = useState(1);

  // Fetch login history
  const fetchLoginHistory = useCallback(() => {
    if (userInfo?._id) {
      dispatch(getLoginHistory(userInfo._id));
    }
  }, [dispatch, userInfo?._id]);

  // Fetch password history
  const fetchPasswordHistory = useCallback(() => {
    dispatch(passwordHistory({ page, limit }));
  }, [dispatch, page, limit]);

  // Fetch user info on mount
  useEffect(() => {
    if (!userInfo) {
      dispatch(getUser());
    }
  }, [dispatch, userInfo]);

  // Fetch data based on log type
  useEffect(() => {
    if (logType === 'login' && userInfo?._id) {
      fetchLoginHistory();
    } else if (logType === 'change-password') {
      fetchPasswordHistory();
    }
  }, [logType, fetchLoginHistory, fetchPasswordHistory, userInfo?._id]);

  // Re-fetch password history when page or limit changes
  useEffect(() => {
    if (logType === 'change-password') {
      fetchPasswordHistory();
    }
  }, [page, limit, logType, fetchPasswordHistory]);

  // Update goToPage when page changes
  useEffect(() => {
    setGoToPage(page);
  }, [page]);

  // Get current data based on log type
  const currentData =
    logType === 'login' ? LoginData || [] : passwordData || [];

  // Filter data by search term (client-side for login, server-side for password)
  const filteredData =
    logType === 'login'
      ? currentData.filter((item) => {
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return (
            item.userName?.toLowerCase().includes(searchLower) ||
            item.ip?.toLowerCase().includes(searchLower) ||
            item.dateTime?.toLowerCase().includes(searchLower)
          );
        })
      : currentData.filter((item) => {
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return (
            item.userName?.toLowerCase().includes(searchLower) ||
            item.remark?.toLowerCase().includes(searchLower) ||
            (item.createdAt &&
              new Date(item.createdAt)
                .toLocaleString()
                .toLowerCase()
                .includes(searchLower))
          );
        });

  // Calculate pagination for login history (client-side)
  const loginTotalPages =
    logType === 'login' ? Math.ceil(filteredData.length / limit) || 1 : 1;

  // Get paginated data for login history
  const paginatedLoginData =
    logType === 'login'
      ? filteredData.slice((page - 1) * limit, page * limit)
      : filteredData;

  // Get pagination info
  const paginationInfo =
    logType === 'change-password'
      ? { pages: pagination?.pages || 1, total: pagination?.total || 0 }
      : { pages: loginTotalPages, total: filteredData.length };

  // Use paginated data for display
  const displayData = logType === 'login' ? paginatedLoginData : filteredData;

  const handleSubmit = () => {
    if (logType === 'login') {
      fetchLoginHistory();
    } else if (logType === 'change-password') {
      setPage(1);
      setGoToPage(1);
      fetchPasswordHistory();
    }
  };

  return (
    <div className='w-full overflow-x-auto p-0.5'>
      <div className='w-full border border-[#00000020] bg-[#fff] shadow-[0_0_5px_#a4a4a4]'>
        <div className='bg-secondary text-secondary p-2'>
          <h4 className='text-[16px] font-[400]'>Activity Log</h4>
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
              value={logType}
              onChange={(e) => {
                setLogType(e.target.value);
                setPage(1);
                setGoToPage(1);
              }}
            >
              <option value='login'>Login</option>
              <option value='change-password'>Change Password</option>
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
            <table className='w-full min-w-[600px] border border-gray-300'>
              <thead>
                <tr className='bg-[#e0e6e6]'>
                  {logType === 'login' ? (
                    <>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Username
                      </th>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Date
                      </th>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        IP Address
                      </th>
                    </>
                  ) : (
                    <>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Username
                      </th>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Date
                      </th>
                      <th className='h-8 border border-gray-300 p-2 text-left text-sm font-semibold whitespace-nowrap'>
                        Remark
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={logType === 'login' ? '3' : '3'}
                      className='h-8 border border-gray-300 p-2 text-center'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : displayData.length > 0 ? (
                  displayData.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      {logType === 'login' ? (
                        <>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.userName || '-'}
                          </td>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.dateTime || '-'}
                          </td>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.ip || '-'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.userName || '-'}
                          </td>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : '-'}
                          </td>
                          <td className='h-8 border border-gray-300 p-2 text-left text-sm'>
                            {item.remark || '-'}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={logType === 'login' ? '3' : '3'}
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
          {!loading && displayData.length > 0 && paginationInfo.pages > 1 && (
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
                      if (value >= 1 && value <= (paginationInfo.pages || 1)) {
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

export default ActivityLog;
