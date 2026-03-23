import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getPasswordHistory,
  setCurrentPage,
} from '../redux/reducer/authReducer';
import { FaRegEdit } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const PasswordHistory = () => {
  const dispatch = useDispatch();
  const [entries, setEntries] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentPage, passwordHistoryData, totalPages } = useSelector(
    (state) => state.auth
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  useEffect(() => {
    dispatch(
      getPasswordHistory({
        page: currentPage,
        limit: entries,
      })
    );
  }, [dispatch, currentPage, entries, searchQuery]);

  return (
    <>
      <Navbar />
      <div className='px-3.5 md:px-7.5'>
        <div className='rounded-sm border border-gray-200 bg-white'>
          <div className='bg-dark rounded-t-sm px-2.5 py-[5px] text-[15px] font-bold text-white'>
            Password change history
          </div>
          <div className='p-5'>
            <div className='mb-4 flex flex-col items-center justify-between md:flex-row'>
              <div className='mb-2 flex items-center md:mb-0'>
                <span className='mr-1'>Show</span>
                <select
                  className='rounded border border-gray-300 px-2 py-1'
                  value={entries}
                  onChange={(e) => setEntries(Number(e.target.value))}
                >
                  <option value='10'>10</option>
                  <option value='20'>20</option>
                  <option value='50'>50</option>
                  <option value='100'>100</option>
                  <option value='500'>500</option>
                </select>
                <span className='ml-1'>entries</span>
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

            <table className='w-full border-2 border-gray-300'>
              <thead>
                <tr className='bg-[#e0e6e6]'>
                  <th className='border border-gray-300 px-4 py-2 text-center'>
                    UserName
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-center'>
                    Remarks
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-center'>
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {passwordHistoryData.length > 0 ? (
                  passwordHistoryData.map((user) => (
                    <tr key={user._id}>
                      <td className='border px-4 py-2 text-center'>
                        {user.userName}
                      </td>
                      <td className='border px-4 py-2 text-center'>
                        {user.remark}
                      </td>
                      <td className='border px-4 py-2 text-center'>
                        {(() => {
                          try {
                            const date = new Date(user.createdAt);
                            // Check if date is valid
                            if (isNaN(date.getTime())) {
                              return user.createdAt || 'Invalid Date';
                            }

                            // Debug: Log the original date and converted date
                            console.log('Original createdAt:', user.createdAt);
                            console.log('Parsed date:', date);
                            console.log('UTC time:', date.toUTCString());
                            console.log(
                              'IST time:',
                              date.toLocaleString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                              })
                            );

                            return date.toLocaleString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                              timeZone: 'Asia/Kolkata',
                            });
                          } catch (error) {
                            console.error('Date parsing error:', error);
                            return user.createdAt || 'Invalid Date';
                          }
                        })()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='3' className='border px-4 py-2 text-center'>
                      No data!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className='mt-4 flex flex-col items-center justify-between gap-3 md:flex-row'>
              <div>
                Showing : {currentPage} to {totalPages} of{' '}
                {passwordHistoryData?.length} entries
              </div>
              <div className='flex'>
                <button
                  onClick={() => handlePageChange(1)}
                  className='mx-1 border border-gray-300 px-3 py-1'
                >
                  First
                </button>
                <button
                  className={`rounded-l border border-gray-300 px-3 py-1 ${
                    currentPage === 1
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-white'
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  « Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`border-t border-b border-gray-300 px-3 py-1 ${
                      currentPage === i + 1 ? 'bg-gray-200' : 'bg-white'
                    }`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={`rounded-r border border-gray-300 px-3 py-1 ${
                    currentPage === totalPages
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-white'
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next »
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className='mx-1 border border-gray-300 px-3 py-1'
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordHistory;
