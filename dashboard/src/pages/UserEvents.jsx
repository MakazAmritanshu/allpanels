'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdmin } from '../redux/reducer/authReducer';
import { FaRegEdit } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { useParams } from 'react-router-dom';
import {
  changePasswordByDownline,
  getLoginHistory,
  getUserProfule,
  geUserTrantionHistory,
} from '../redux/reducer/authReducer';
import { toast } from 'react-toastify';

export default function UserProfile() {
  const { id } = useParams();

  const {
    user,
    successMessage,
    errorMessage,
    currentPage,
    totalPages,
    loading,
    LoginData,
    transtionHistoryData,
  } = useSelector((state) => state.auth);

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const formatDate = (date) => date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  console.log('transtionHistoryData1111111111111', transtionHistoryData);

  const [activeTab, setActiveTab] = useState('profile');
  const [isOpen, setIsOpen] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));
  const [selectedOption, setSelectedOption] = useState('ALL');
  const dispatch = useDispatch();

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
    dispatch(getUserProfule(id));
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
    // console.log("oldPassword", oldPassword);
    // console.log("newPassword", newPassword);
    dispatch(changePasswordByDownline({ id, oldPassword, newPassword }));
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
  console.log('idddddd', id);

  useEffect(() => {
    dispatch(getLoginHistory(id));
    // dispatch(geUserTrantionHistory({  page: 1, limit: 10 }));
  }, [dispatch, id]);

  const fetchHistory = () => {
    dispatch(
      geUserTrantionHistory({ userId: id, page, limit, startDate, endDate })
    );
  };

  useEffect(() => {
    fetchHistory();
  }, [page, limit, startDate, endDate]);

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gray-100 p-1 md:p-4'>
        <div className='flex flex-col gap-4 md:flex-row'>
          {/* Sidebar */}
          <div className='w-full text-[15px] md:w-80'>
            <div className='bg-dark px-2 py-1 text-white'>
              <h2 className='font-bold'>My Account</h2>
            </div>
            <div className='border border-gray-300'>
              <button
                className={`w-full border-b border-gray-300 px-2 py-1 text-left text-sm ${
                  activeTab === 'profile'
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                My Profile
              </button>
              <button
                className={`w-full border-b border-gray-300 px-2 py-1 text-left text-sm ${
                  activeTab === 'PL'
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('PL')}
              >
                Profit & Loss
              </button>
              <button
                className={`w-full border-b border-gray-300 px-2 py-1 text-left text-sm ${
                  activeTab === 'statement'
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('statement')}
              >
                Account Statement
              </button>
              <button
                className={`w-full px-2 py-1 text-left text-sm ${
                  activeTab === 'activity'
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                Activity Log
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className='flex-1'>
            {activeTab === 'profile' && (
              <div className='border border-gray-300 bg-white'>
                <div className='bg-dark px-2 py-1 text-white'>
                  <h2 className='font-bold'>Account Details</h2>
                </div>
                <div className='divide-y text-sm'>
                  <div className='flex flex-col border-b border-gray-300 md:flex-row'>
                    <div className='w-full p-4 font-medium md:w-1/3'>Name</div>
                    <div className='w-full p-4 md:w-2/3'>
                      {user?.name || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col border-b border-gray-300 md:flex-row'>
                    <div className='w-full p-4 font-medium md:w-1/3'>
                      Commission
                    </div>
                    <div className='w-full p-4 md:w-2/3'>
                      {user?.commition || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col border-b border-gray-300 md:flex-row'>
                    <div className='w-full p-4 font-medium md:w-1/3'>
                      Rolling Commission
                    </div>
                    <div className='flex w-full items-center gap-1 p-4 md:w-2/3'>
                      <span>{user?.rollingCommission || 'Nan'}</span>
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
                  <div className='flex flex-col border-b border-gray-300 md:flex-row'>
                    <div className='w-full p-4 font-medium md:w-1/3'>
                      Agent Rolling Commission
                    </div>
                    <div className='w-full p-4 md:w-2/3'>
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
                  <div className='flex flex-col border-b border-gray-300 md:flex-row'>
                    <div className='w-full p-4 font-medium md:w-1/3'>
                      Currency
                    </div>
                    <div className='w-full p-4 md:w-2/3'>INR</div>
                  </div>
                  <div className='flex flex-col border-b border-gray-300 md:flex-row'>
                    <div className='w-full p-4 font-medium md:w-1/3'>
                      Partnership
                    </div>
                    <div className='w-full p-4 md:w-2/3'>
                      {user?.partnership || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col border-b border-gray-300 md:flex-row'>
                    <div className='w-full p-4 font-medium md:w-1/3'>
                      Mobile Number
                    </div>
                    <div className='w-full p-4 md:w-2/3'>
                      {user?.phone || 'Nan'}
                    </div>
                  </div>
                  <div className='flex flex-col border-b border-gray-300 md:flex-row'>
                    <div className='w-full p-4 font-medium md:w-1/3'>
                      Password
                    </div>
                    <div className='flex w-full items-center p-4 md:w-2/3'>
                      ********
                      <button
                        className='text-blue ml-2'
                        onClick={() => setShowPopup(true)}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row'>
                    <div className='w-full p-4 font-medium md:w-1/3'>
                      Secure Auth Verification
                    </div>
                    <div className='w-full p-4 md:w-2/3'>
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
                <div className='mb-4 rounded-lg border border-gray-900 bg-[#e0e6e6] p-4 text-[13px]'>
                  <div className='grid grid-cols-4 items-end gap-2'>
                    <div className='col-span-1 w-full'>
                      <label className='mb-1 block'>Data Source</label>
                      <select
                        value={selectedOption}
                        onChange={handleOptionChange}
                        className='w-full border bg-white p-2'
                      >
                        <option>ALL</option>
                        <option>LIVE DATA</option>
                        <option>BACKUP DATA</option>
                        <option>OLD DATA</option>
                      </select>
                    </div>
                    <div className='col-span-1 w-full'>
                      <label className='mb-1 block'>From</label>
                      <div className='relative'>
                        <input
                          type='date'
                          className='w-full border bg-white p-2'
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className='col-span-1 w-full'>
                      <label className='mb-1 block'>To</label>
                      <div className='relative'>
                        <input
                          type='date'
                          className='w-full border bg-white p-2'
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div className='col-span-1'>
                      <button className='bg-dark w-full rounded px-4 py-2 font-bold text-white'>
                        Get Statement
                      </button>
                    </div>
                  </div>
                </div>
                {loading && (
                  <div className='mt-4 p-4 text-center'>
                    <p>Loading data...</p>
                    {/* You can add a spinner here if you want */}
                  </div>
                )}

                {/* Statement Table */}
                {!loading && (
                  <div className='border border-gray-300 bg-white text-[13px]'>
                    <div className='bg-dark px-3 py-1 text-white'>
                      <h2 className='font-bold'>Account Statement</h2>
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
                            <tr className='bg-gray-200'>
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='flex items-center justify-between text-[13px]'>
                                  Date & Time
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
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='flex items-center justify-between text-[13px]'>
                                  Deposit
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
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='flex items-center justify-between text-[13px]'>
                                  Withdraw
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
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='flex items-center justify-between text-[13px]'>
                                  Balance
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
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='flex items-center justify-between text-[13px]'>
                                  Remark
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
                              <th className='border border-gray-300 p-2 text-left'>
                                <div className='flex items-center justify-between text-[13px]'>
                                  From / To
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
                            {transtionHistoryData?.length > 0 ? (
                              transtionHistoryData?.map((item, i) => (
                                <tr key={i} className='cursor-pointer'>
                                  <td className='border border-gray-300 px-4 py-2 text-center'>
                                    {item.date}
                                  </td>
                                  <td className='border border-gray-300 px-4 py-2 text-center'>
                                    {item?.deposite}
                                  </td>
                                  <td className='border border-gray-300 px-4 py-2 text-center'>
                                    {item?.withdrawl}
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
                                  colSpan='4'
                                  className='border border-gray-300 px-4 py-2 text-center'
                                >
                                  No data available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className='mt-4 flex flex-col items-center justify-between md:flex-row'>
                        <div className='mb-2 md:mb-0'>
                          Showing {transtionHistoryData.length} entries on page{' '}
                          {page}
                        </div>
                        <div className='mt-4 flex justify-center gap-4'>
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
                )}
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <div className='border border-gray-300 bg-white text-[13px]'>
                <div className='mt-4 overflow-auto'>
                  <div className='bg-dark px-4 py-1 font-semibold text-white'>
                    Password change history
                  </div>
                  <table className='w-full border border-gray-300'>
                    <thead>
                      <tr className='bg-[#e0e6e6]'>
                        <th className='border px-4 py-2 text-center'>
                          Date / Time
                        </th>
                        <th className='border px-4 py-2 text-center'>
                          Login Staus
                        </th>
                        <th className='border px-4 py-2 text-center'>
                          IP Address
                        </th>
                        <th className='border px-4 py-2 text-center'>ISP</th>
                        <th className='border px-4 py-2 text-center'>
                          City/State/Country
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {LoginData.map((item, i) => (
                        <tr key={i}>
                          <td
                            colSpan=''
                            className='border px-4 py-2 text-center'
                          >
                            {item.dateTime}
                          </td>
                          <td
                            colSpan=''
                            className='border px-4 py-2 text-center'
                          >
                            {item.status}
                          </td>
                          <td
                            colSpan=''
                            className='border px-4 py-2 text-center'
                          >
                            {item.ip}
                          </td>
                          <td
                            colSpan=''
                            className='border px-4 py-2 text-center'
                          >
                            {item.isp}
                          </td>
                          <td
                            colSpan=''
                            className='border px-4 py-2 text-center'
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

            {activeTab === 'PL' && (
              <div className='p-2'>
                {/* Filter Section */}
                <div className='mb-4 rounded-lg border border-gray-900 bg-[#e0e6e6] p-4 text-[15px]'>
                  <div className='flex flex-col items-end gap-4 md:flex-row'>
                    <div className='w-full md:w-1/4'>
                      <label className='mb-1 block'>Data Source</label>
                      <select className='w-full rounded border border-gray-300 p-2'>
                        <option>Data Source</option>
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
                    <div className='mb-4 flex items-center'>
                      <span className='mr-2'>Show</span>
                      <select className='rounded border border-gray-300 px-2 py-1'>
                        <option value='50'>50</option>
                        <option value='10'>10</option>
                        <option value='25'>25</option>
                        <option value='100'>100</option>
                      </select>
                      <span className='ml-2'>entries</span>
                    </div>

                    <div className='overflow-x-auto'>
                      <table className='w-full border-collapse'>
                        <thead>
                          <tr className='bg-gray-200 text-center'>
                            <th className='border border-gray-300 p-2 text-left'>
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
                            <th className='border border-gray-300 p-2 text-left'>
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
                            <th className='border border-gray-300 p-2 text-left'>
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
                            <th className='border border-gray-300 p-2 text-left'>
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
                            <th className='border border-gray-300 p-2 text-left'>
                              <div className='flex items-center justify-center text-[13px]'>
                                Total P&L
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
                          {/* {PLdata?.length > 0 ? (
                  PLdata.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100 text-center text-sm font-semibold">
                      <td className="border border-gray-300 p-2 text-[#2789ce] cursor-pointer" onClick={() => navigate(`/eventplteams/${item.name}`)}>
                        {item.name}
                      </td>
                      <td className={`border border-gray-300 p-2 ${item.myProfit > 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(item.myProfit)}
                      </td>
                      <td className={`border border-gray-300 p-2 ${item.myProfit > 0 ? "text-red-500" : "text-green-500"}`}>
                    {Math.abs(item.myProfit)}
                      </td>
                      <td className="border border-gray-300 p-2">
                        0
                      </td>
                    </tr>
                  ))

                ) : (

                  <tr>
                    <td
                      colSpan={6}
                      className="border border-gray-300 p-4 text-center"
                    >
                      No data available in table
                    </td>
                  </tr>
                )} */}
                        </tbody>
                      </table>
                    </div>

                    <div className='mt-4 flex flex-col items-center justify-between md:flex-row'>
                      <div className='mb-2 md:mb-0'>
                        Showing 0 to 0 of 0 entries
                      </div>
                      <div className='flex'>
                        <button className='mx-1 border border-gray-300 px-3 py-1'>
                          First
                        </button>
                        <button className='mx-1 border border-gray-300 px-3 py-1'>
                          Previous
                        </button>
                        <button className='mx-1 border border-gray-300 px-3 py-1'>
                          Next
                        </button>
                        <button className='mx-1 border border-gray-300 px-3 py-1'>
                          Last
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div className='fixed inset-0 flex items-center justify-center bg-[#00000074]'>
            <div className='w-70 rounded-lg bg-white shadow-lg md:w-100'>
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
            </div>
          </div>
        )}
        {isAgent && (
          <div className='fixed inset-0 flex items-center justify-center bg-[#00000074]'>
            <div className='w-70 rounded-lg bg-white shadow-lg md:w-100'>
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
            </div>
          </div>
        )}
        {isEdit && (
          <div className='fixed inset-0 flex items-center justify-center bg-[#00000074]'>
            <div className='w-70 rounded-lg bg-white shadow-lg md:w-100'>
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
            </div>
          </div>
        )}

        {showPopup && (
          <div className='absolute inset-0 flex items-center justify-center bg-[#0000007e] text-[13px]'>
            <div className='max-w-lg rounded-lg bg-white shadow-lg'>
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}
