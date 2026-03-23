'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdmin } from '../redux/reducer/authReducer';
import { FaRegEdit } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import {
  changePasswordBySelf,
  getTranstionHistory,
  setCurrentPage,
} from '../redux/reducer/authReducer';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyAccount() {
  const {
    userInfo,
    successMessage,
    errorMessage,
    currentPage,
    totalPages,
    totalRecords,
    loading,
    LoginData,
    transtionHistoryData,
  } = useSelector((state) => state.auth);
  // console.log(userInfo, " userInfo");
  console.log('transtionHistoryData', transtionHistoryData);

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState('profile');
  const [isOpen, setIsOpen] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [limit, setLimit] = useState(10);
  const fiveMonthAgo = new Date();
  fiveMonthAgo.setMonth(currentDate.getMonth() - 12);
  const [startDate, setStartDate] = useState(formatDate(fiveMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [selectedOption, setSelectedOption] = useState('ALL');
  const dispatch = useDispatch();

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };
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
      setEndDate(formatDate(twoDaysAgo));
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
    dispatch(getAdmin());
  }, [dispatch]);

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Password not match.');
      return;
    }
    if (oldPassword === newPassword) {
      toast.error("Old password and new password can't be the same.");
      return;
    }
    dispatch(changePasswordBySelf({ oldPassword, newPassword }));
    if (successMessage) {
      toast.success(successMessage);
      setShowPopup(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(errorMessage);
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

  const fetchHistory = () => {
    dispatch(
      getTranstionHistory({ page: currentPage, limit, startDate, endDate })
    );
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage, limit, startDate, endDate]);

  const filteredData =
    transtionHistoryData?.filter((item) => {
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      return (
        item?.deposite?.toString().toLowerCase().includes(searchLower) ||
        item?.withdrawl?.toString().toLowerCase().includes(searchLower) ||
        item?.amount?.toString().toLowerCase().includes(searchLower) ||
        item?.remark?.toLowerCase().includes(searchLower) ||
        item?.from?.toLowerCase().includes(searchLower) ||
        item?.to?.toLowerCase().includes(searchLower)
      );
    }) || [];

  const updateDate = (isoDateString) => {
    const date = new Date(isoDateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return isoDateString || 'Invalid Date';
    }

    // Use Indian timezone for proper time display
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
                className={`w-full border border-[#ccc] px-2.5 py-[5px] md:text-left ${
                  activeTab === 'profile'
                    ? 'bg-[#d1ddef]'
                    : 'bg-white hover:bg-[#e6efd1]'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                My Profile
              </button>
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
                className={`w-full px-2.5 py-[5px] md:text-left ${
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
                      {userInfo?.name || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Commission
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      {userInfo?.commition || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Rolling Commission
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      <span>{userInfo?.rollingCommission || 'Nan'}</span>
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
                      {userInfo?.partnership || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] font-bold md:w-1/4'>
                      Mobile Number
                    </div>
                    <div className='mb-[15px] w-full border-b border-gray-300 px-[12px] pb-[15px] md:w-3/4'>
                      {userInfo?.phone || 'Nan'}
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
                          className='h-4 w-4'
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
              <div>
                {/* Filter Section */}
                <div className='mb-6 rounded-sm border border-gray-900 bg-[#e0e6e6] pt-2.5 pb-4 text-[13px]'>
                  <div className='grid grid-cols-2 items-center md:grid-cols-4'>
                    <div className='col-span-1 w-full px-3'>
                      <label className='block'>Data Source</label>
                      <select
                        value={selectedOption}
                        onChange={handleOptionChange}
                        className='w-full rounded-[4px] bg-white px-[10px] py-[8px] text-[14px] text-[#5c6873]'
                      >
                        <option>OLD DATA</option>
                        <option>LIVE DATA</option>
                        <option>BACKUP DATA</option>
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
                        Get Statement
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statement Table */}
                <div className='rounded-sm border border-gray-300 bg-white'>
                  <div className='bg-dark rounded-t-sm px-2.5 py-[5px] text-[15px] text-white'>
                    <h2 className='font-bold'>Account Statement</h2>
                  </div>
                  {loading && (
                    <div className='mt-4 p-4 text-center'>
                      <p>Loading data...</p>
                      {/* You can add a spinner here if you want */}
                    </div>
                  )}
                  {!loading && (
                    <div className='m-5 overflow-x-auto'>
                      <div className='mb-4 flex flex-col items-center justify-between text-[13px] md:flex-row'>
                        <div className='mt-2 flex items-center gap-1 p-2 font-[500]'>
                          <span className=''>Show</span>
                          <select
                            className='rounded border border-gray-300 px-2 py-1'
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
                              <div className='relative flex items-center justify-between text-[13px]'>
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
                          {filteredData?.length > 0 ? (
                            filteredData?.map((item, i) => (
                              <tr key={i} className='cursor-pointer'>
                                <td className='border border-gray-300 px-4 py-2 text-center'>
                                  {updateDate(item.date)}
                                </td>
                                <td className='border border-gray-300 px-4 py-2 text-center'>
                                  {item?.deposite || '-'}
                                </td>
                                <td className='border border-gray-300 px-4 py-2 text-center'>
                                  {item?.withdrawl || '-'}
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
                                colSpan='6'
                                className='border border-gray-300 px-4 py-2 text-center'
                              >
                                {searchQuery
                                  ? 'No matching records found'
                                  : 'No data available'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      <div className='mt-4 flex flex-col justify-between gap-3 text-[13px] md:flex-row md:items-center'>
                        <div className='text-sm text-gray-600'>
                          Showing {currentPage} to {totalPages} of{' '}
                          {totalRecords ?? 0} entries
                        </div>

                        <div className='flex gap-2'>
                          <button
                            className='border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage <= 1}
                          >
                            First
                          </button>

                          <button
                            className='border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                          >
                            Previous
                          </button>

                          {(() => {
                            const totalPgs = totalPages || 0;
                            let startPage = Math.max(1, currentPage - 1);
                            let endPage = Math.min(totalPgs, startPage + 2);
                            if (endPage - startPage < 2) {
                              startPage = Math.max(1, endPage - 2);
                            }
                            return [...Array(endPage - startPage + 1)].map(
                              (_, i) => {
                                const pageNum = startPage + i;
                                return (
                                  <button
                                    key={pageNum}
                                    className={`ml-[2px] rounded-[2px] border border-gray-400 px-[13px] py-[6.5px] leading-none ${
                                      currentPage === pageNum
                                        ? 'bg-gray-200 font-medium'
                                        : 'bg-white hover:bg-gray-50'
                                    }`}
                                    onClick={() => handlePageChange(pageNum)}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              }
                            );
                          })()}

                          <button
                            className='border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= (totalPages || 1)}
                          >
                            Next
                          </button>

                          <button
                            className='border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                            onClick={() => handlePageChange(totalPages || 1)}
                            disabled={currentPage >= (totalPages || 1)}
                          >
                            Last
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                          Login Date / Time
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
                    <tbody className=''>
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
          <div className='absolute inset-0 flex items-center justify-center bg-[#0000007e] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='max-w-lg rounded-lg bg-white shadow-lg'
            >
              <h2 className='bg-blue-one mb-4 px-2 py-1 font-semibold text-white'>
                Change Password
              </h2>
              <div className='p-2'>
                <input
                  type='password'
                  placeholder='Old Password'
                  className='mb-2 w-full rounded border p-2'
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <input
                  type='password'
                  placeholder='New Password'
                  className='mb-2 w-full rounded border p-2'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type='password'
                  placeholder='Confirm Password'
                  className='mb-4 w-full rounded border p-2'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
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
