'use client';
import {
  CurrencyIcon,
  ArrowSwapIcon,
  MenuClockIcon,
  GearIcon,
  UserIcon,
  BadgeLockIcon,
  TrashBinIcon,
} from '../assets/svgIcon';
import { useEffect, useState } from 'react';
import {
  FaBan,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRegEdit,
  FaUnlock,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; //eslint-disable-line
import {
  addAdmin,
  getAdmin,
  deleteSubAdmin,
  setCurrentPage,
  updateCreditReference,
  getAllOnlyUserAndDownline,
  withdrawalAndDeposite,
  userSetting,
  getCreditRefHistory,
  updateExploserLimit,
} from '../redux/reducer/authReducer';
import { toast } from 'react-toastify';
import { IoMdSettings } from 'react-icons/io';
import { PiArrowsDownUpBold } from 'react-icons/pi';
import { TbCoinRupeeFilled } from 'react-icons/tb';
import { MdDelete } from 'react-icons/md';
import { LuListCheck } from 'react-icons/lu';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { updateGameLock } from '../redux/reducer/downlineReducer';

export default function AgentLIst() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    userInfo,
    currentPage,
    totalPages,
    loading,
    onlyusers,
    crediteHistory,
  } = useSelector((state) => state.auth);
  const { gamelock } = useSelector((state) => state.downline);
  // console.log("userInfo", userInfo);

  const [entries, setEntries] = useState(10);
  const [creditEntries, setCreditEntries] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);
  const [creditPopup, setCreditPopup] = useState(false);
  const [patnerPopup, setPatnerPopup] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [balancePopup, setBalancePopup] = useState(false);
  const [settingPopup, setSettingPopup] = useState(false);
  const [sportsPopup, setSportsPopup] = useState(false);
  const [currentUser, setcurrentUser] = useState(null);
  const [isFetchingAllUsers, setIsFetchingAllUsers] = useState(null);
  const [gameLockData, setGameLockData] = useState([]);

  // const [totalBalance, setTotalBalance] = useState(0);

  const [type, setType] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  useEffect(() => {
    if (isEdit) {
      document.body.classList.add('modalOpen');
    } else {
      document.body.classList.remove('modalOpen');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modalOpen');
    };
  }, [isEdit]);

  // const allowedRoles = roleHierarchy[userInfo?.role] || [];

  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    accountType: 'user',
    commition: '',
    balance: null,
    exposureLimit: null,
    creditReference: null,
    rollingCommission: null,
    partnership: null,
    phone: null,
    password: '',
    masterPassword: '',
    status: 'active',
    confirmPassword: '',
  });

  useEffect(() => {});

  // sport popup checkbox
  const handleToggle = async (game, currentLock) => {
    try {
      dispatch(
        updateGameLock({ userId: currentUser?._id, game, lock: !currentLock })
      ).then((res) => {
        if (res.payload.success) {
          console.log('res.payload111', res.payload);
          setGameLockData(res.payload?.gamelock);

          dispatch(
            getAllOnlyUserAndDownline({
              page: currentPage,
              limit: entries,
              searchQuery,
            })
          );
          toast.success(res.payload.message);
        } else {
          toast.error(res.payload.message);
        }
      });
    } catch (err) {
      console.error('Failed to update game lock:', err);
    }
  };

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password and Confirm Password do not match');
      return;
    }
    if (userInfo) {
      try {
        const result = await dispatch(addAdmin(formData)).unwrap();
        toast.success(result.message);
        dispatch(
          getAllOnlyUserAndDownline({
            page: currentPage,
            limit: entries,
            searchQuery,
          })
        );
        dispatch(getAdmin());
        setIsEdit(false);
      } catch (error) {
        // console.log("root error", error);
        toast.error(error);
      }
    } else {
      navigate('/login');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  const handleWithdwalDeposite = async (e) => {
    e.preventDefault();
    try {
      const data = await dispatch(
        withdrawalAndDeposite({ formData, userId: currentUser._id, type })
      ).unwrap();
      toast.success(data.message);
      dispatch(
        getAllOnlyUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
      dispatch(getAdmin());
      setBalancePopup(false); // Optional: close the popup on success
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSetting = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        userSetting({
          userId: currentUser._id,
          status: formData.status,
          masterPassword: formData.masterPassword,
        })
      ).unwrap();
      toast.success(result.message);
      setSettingPopup(false);
      dispatch(
        getAllOnlyUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const deleteUser = await dispatch(deleteSubAdmin(id)).unwrap();

      toast.success(deleteUser.message);
      dispatch(
        getAllOnlyUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const handleUpdateCredit = async (e) => {
    e.preventDefault();
    try {
      const data = await dispatch(
        updateCreditReference({ formData, userId: currentUser._id })
      ).unwrap();
      toast.success(data.message);
      setCreditPopup(false);
      dispatch(
        getAllOnlyUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const handleUpdateExploserLimit = async (e) => {
    e.preventDefault();
    try {
      const data = await dispatch(
        updateExploserLimit({ formData, userId: currentUser._id })
      ).unwrap();
      toast.success(data.message);
      setPatnerPopup(false);
      dispatch(
        getAllOnlyUserAndDownline({
          page: currentPage,
          limit: entries,
          searchQuery,
        })
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const handleCreditRefHistory = (userId) => {
    setSelectedUserId(userId);
    setIsOpen(true);
  };
  useEffect(() => {
    if (isOpen && selectedUserId) {
      dispatch(
        getCreditRefHistory({
          userId: selectedUserId,
          page: currentPage,
          limit: creditEntries,
          searchQuery,
        })
      );
    }
  }, [
    dispatch,
    currentPage,
    creditEntries,
    searchQuery,
    selectedUserId,
    isOpen,
  ]);

  useEffect(() => {
    setIsFetchingAllUsers(true);
    dispatch(
      getAllOnlyUserAndDownline({
        page: currentPage,
        limit: entries,
        searchQuery,
      })
    );
  }, [dispatch, currentPage, entries, searchQuery]);

  // useEffect(() => {
  //   const total = onlyusers.reduce((sum, row) => sum + row.balance, 0);
  //   setTotalBalance(total);
  // }, [onlyusers]);

  // const allBalance = totalBalance + userInfo?.balance;
  // const formatNumber = (value) => {
  //   if (value == null || isNaN(value)) return 0;       // fallback
  //   const num = Number(value);
  //   // If integer → show as-is; else → show up to 2 decimals
  //   return Number.isInteger(num) ? num : num.toFixed(2);
  // };
  const formatNumber = (v) => {
    const num = Math.abs(Number(v));
    if (isNaN(num)) return 0;
    return Number.isInteger(num)
      ? num
      : num.toFixed(v.toString().split('.')[1]?.length === 1 ? 1 : 2);
  };
  const reloadPage = () => {
    window.location.reload();
  };
  return (
    <>
      <Navbar />
      <div className='min-h-screen p-1 px-[15px] md:px-7.5'>
        <div className='my-[13px] flex justify-end gap-2'>
          <button
            className='flex items-center gap-1 rounded border border-gray-300 bg-white px-[15px] text-[12px] leading-[30px] font-bold'
            onClick={() => setIsEdit(true)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path d='M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z' />
              <path d='M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z' />
            </svg>
            Add User
          </button>
          <button
            className='flex w-[30px] items-center justify-center rounded border border-gray-300 bg-white leading-[30px] text-gray-500'
            onClick={reloadPage}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>

        {/* Financial metrics summary */}
        <div className='mb-4 flex flex-wrap border-b border-[#7e97a7] bg-white pt-[7px] md:pb-[5px]'>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Total Balance
            </div>
            <div className='text-[15px] font-semibold'>
              INR {formatNumber(userInfo?.totalBalance)}
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Total Exposure
            </div>
            <div className='text-[15px] font-semibold'>
              INR{' '}
              <span className='text-red-600'>
                ({formatNumber(userInfo?.exposure)})
              </span>
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Available Balance
            </div>
            <div className='text-[15px] font-semibold'>
              INR {formatNumber(userInfo?.agentAvbalance)}
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Balance
            </div>
            <div className='text-[15px] font-semibold'>
              INR {formatNumber(userInfo?.avbalance || 0)}
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Total Avail. bal.
            </div>
            <div className='text-[15px] font-semibold'>
              INR {formatNumber(userInfo?.totalAvbalance)}
            </div>
          </div>
          <div className='w-full border-b border-gray-300 px-[20px] py-[7px] md:w-[14.96815%] md:border-r md:border-b-0 md:px-[10px] md:py-0'>
            <div className='mb-[5px] text-[12px] font-semibold text-[#9b9b9b]'>
              Upline P/L
            </div>
            <div className='text-[15px] font-semibold'>
              INR{' '}
              <span
                className={`${
                  userInfo.uplineBettingProfitLoss <= 0
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}
              >
                ({formatNumber(userInfo?.uplineBettingProfitLoss)})
              </span>
            </div>
          </div>
        </div>
        {/* Main content area with table */}
        <div className='rounded border border-gray-300 bg-white p-5'>
          {/* Table controls */}
          <div className='mb-4 flex flex-col justify-between text-[13px] md:flex-row'>
            <div className='mb-2 flex items-center justify-center text-[#333] md:mb-0'>
              <span className='mr-2'>Show</span>
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
              <span className='ml-2'>entries</span>
            </div>
            <div className='flex items-center justify-center'>
              <span className='mr-2'>Search</span>
              <input
                type='text'
                className='rounded border border-gray-300 px-2 py-1'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className='overflow-x-auto text-[13px]'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-[#e0e6e6] whitespace-nowrap text-black'>
                  <th className='border border-gray-300 px-[10px] py-[9px] text-left'>
                    Username
                  </th>
                  <th className='border border-gray-300 px-[10px] py-[9px] text-left'>
                    Credit Ref.
                  </th>
                  <th className='border border-gray-300 px-[10px] py-[9px] text-left'>
                    Balance
                  </th>
                  <th className='border border-gray-300 px-[10px] py-[9px] text-left'>
                    Exposure
                  </th>
                  <th className='border border-gray-300 px-[10px] py-[9px] text-left'>
                    Exposure Limit
                  </th>
                  <th className='border border-gray-300 px-[10px] py-[9px] text-left'>
                    Avail. Bal.
                  </th>
                  <th className='border border-gray-300 px-[10px] py-[9px] text-left'>
                    Ref. P/L
                  </th>
                  <th className='border border-gray-300 px-[10px] py-[9px] text-left'>
                    Status
                  </th>
                  <th className='border border-gray-300 px-[10px] py-[9px] text-left'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan='9'>
                      <div className='flex w-full justify-center'>
                        <Loader />
                      </div>
                    </td>
                  </tr>
                ) : (
                  onlyusers.map((user) => (
                    <tr key={user._id} className='font-bold hover:bg-gray-100'>
                      <td
                        // onClick={() => handleLoadNextLevel(user.code)}
                        className='cursor-pointer border border-gray-300 px-[10px] py-[9px]'
                      >
                        <div className='flex items-center gap-1 lowercase'>
                          {' '}
                          <span className='inline-block h-fit rounded-sm border border-[#4dbd74] bg-[#4dbd74] px-1 py-0.5 text-[11px] leading-none text-white uppercase'>
                            {user.role}
                          </span>
                          {user.userName}
                        </div>
                      </td>
                      <td className='border border-gray-300 px-[10px] py-[9px]'>
                        <div className='flex items-center gap-x-2'>
                          {formatNumber(user.creditReference)}
                          <span
                            className='text-blue2'
                            onClick={() => {
                              setCreditPopup(true);
                              setcurrentUser(user);
                            }}
                          >
                            <FaRegEdit />
                          </span>
                          <span
                            className='text-blue2'
                            onClick={() => {
                              handleCreditRefHistory(user._id);
                              setcurrentUser(user);
                            }}
                          >
                            <FaEye />
                          </span>
                        </div>
                      </td>
                      <td className='border border-gray-300 px-[10px] py-[9px]'>
                        <div className='flex items-center gap-x-2'>
                          <span>{formatNumber(user.balance || 0)}</span>
                        </div>
                      </td>
                      <td
                        className={`border border-gray-300 px-[10px] py-[9px] text-red-500`}
                      >
                        ({formatNumber(user.exposure)})
                      </td>
                      <td className='border border-gray-300 px-[10px] py-[9px]'>
                        <div className='flex items-center gap-1'>
                          {formatNumber(user?.exposureLimit || 0)}
                          {isFetchingAllUsers == true ? (
                            <span
                              className='text-blue2'
                              onClick={() => {
                                setPatnerPopup(true);
                                setcurrentUser(user);
                              }}
                            >
                              <FaRegEdit />
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className='border border-gray-300 px-[10px] py-[9px]'>
                        {/* BALANCE AND AVBALANCE HAS TO BE SAME  */}
                        {formatNumber(user.avbalance || 0)}
                      </td>
                      <td
                        className={`border border-gray-300 px-[10px] py-[9px] ${
                          user.creditReferenceProfitLoss +
                            user.bettingProfitLoss <
                          0
                            ? 'text-red-500'
                            : 'text-green-500'
                        }`}
                      >
                        {/* {user.profitLoss || 0} */}
                        {formatNumber(
                          Number(user.bettingProfitLoss) +
                            Number(user.creditReferenceProfitLoss)
                        )}
                      </td>
                      <td className='border border-gray-300 px-[10px] py-[9px] text-[12px]'>
                        <span
                          className={`rounded-sm border px-[5px] py-[3px] text-[11px] ${
                            user.status === 'active'
                              ? 'border-[#bedca7] bg-[#e5f1dc] text-[#508d0e]'
                              : ''
                          } ${
                            user.status === 'suspend'
                              ? 'border-red-200 bg-red-100 text-red-700'
                              : ''
                          } ${
                            user.status === 'locked'
                              ? 'border-gray-300 bg-gray-200 text-gray-800'
                              : ''
                          } `}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className='border border-gray-300 px-[10px] py-[9px]'>
                        <div className='flex items-center'>
                          {isFetchingAllUsers == true ? (
                            <>
                              <span
                                onClick={() => {
                                  setBalancePopup(true);
                                  setcurrentUser(user);
                                }}
                                className='flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-sm border border-[#bbbbbb] bg-[#f3f3f3] text-[#3c3c3ce3] md:ml-[12px]'
                              >
                                <CurrencyIcon />
                              </span>

                              <div
                                onClick={() =>
                                  navigate(`/online-user/${user._id}`, {
                                    state: { activeTab: 'PL' },
                                  })
                                }
                                className='ml-[12px] flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-sm border border-[#bbbbbb] bg-[#f3f3f3] text-[#3c3c3ce3]'
                              >
                                <span>
                                  <ArrowSwapIcon />
                                </span>
                              </div>

                              <div
                                onClick={() =>
                                  navigate(`/online-user/${user._id}`, {
                                    state: { activeTab: 'BH' },
                                  })
                                }
                                className='ml-[12px] flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-sm border border-[#bbbbbb] bg-[#f3f3f3] text-[#3c3c3ce3]'
                              >
                                <span>
                                  <MenuClockIcon />
                                </span>
                              </div>
                              <span
                                onClick={() => {
                                  setSettingPopup(true);
                                  setcurrentUser(user);
                                }}
                                className='ml-[12px] flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-sm border border-[#bbbbbb] bg-[#f3f3f3] text-[#3c3c3ce3]'
                              >
                                <GearIcon />
                              </span>
                            </>
                          ) : null}
                          <div className='ml-[12px] flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-sm border border-[#bbbbbb] bg-[#f3f3f3] text-[#3c3c3ce3]'>
                            <Link to={`/online-user/${user._id}`} className=''>
                              <span>
                                <UserIcon />
                              </span>
                            </Link>
                          </div>
                          <span
                            onClick={() => {
                              setSportsPopup(true);
                              setGameLockData(user?.gamelock);
                              setcurrentUser(user);
                            }}
                            className='ml-[12px] flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-sm border border-[#bbbbbb] bg-[#f3f3f3] text-[#3c3c3ce3]'
                          >
                            <BadgeLockIcon />
                          </span>
                          {isFetchingAllUsers == true ? (
                            <span
                              className='ml-[12px] flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-sm border border-[#bbbbbb] bg-[#f3f3f3] text-[#3c3c3ce3]'
                              onClick={() => handleDelete(user._id)}
                            >
                              <TrashBinIcon />
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='mt-4 flex flex-col justify-between gap-3 text-[13px] md:flex-row md:items-center'>
            <div>
              Showing {currentPage} to {totalPages} of {onlyusers?.length}{' '}
              entries
            </div>
            <div className='flex flex-wrap'>
              {/* First Button */}
              <button
                className='pgBtn px-[13px] py-[6.5px]'
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                First
              </button>

              {/* Previous Button */}
              <button
                className='pgBtn ml-[2px] px-[13px] py-[6.5px]'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`ml-[2px] rounded-[2px] border border-gray-400 px-[13px] py-[6.5px] leading-none ${
                    currentPage === i + 1 ? 'bg-gray-200' : 'pgBtn'
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next Button */}
              <button
                className='pgBtn ml-[2px] px-[13px] py-[6.5px]'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>

              {/* Last Button */}
              <button
                className='pgBtn ml-[2px] px-[13px] py-[6.5px]'
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </button>
            </div>
          </div>
        </div>
        {isEdit && (
          <div className='fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-[#00000074] p-2 md:p-4'>
            <div className='absolute top-0 w-full max-w-[500px]'>
              <div className='my-[28px]'>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className='rounded-lg bg-white shadow-lg'
                >
                  {/* Header */}
                  <div className='bg-blue flex justify-between rounded-t-lg px-[7px] py-[5px] font-bold text-white'>
                    <span className='text-[15px]'>Add User</span>
                    <button
                      onClick={() => setIsEdit(false)}
                      className='text-[21px] leading-none text-white'
                    >
                      ×
                    </button>
                  </div>

                  {/* Commission List */}
                  <form
                    onSubmit={handleSubmit}
                    className='py-3 font-semibold md:p-4'
                  >
                    <div className='flex flex-col items-center px-4 py-1 md:flex-row'>
                      <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                        Username <span className='text-red-500'>*</span>
                      </span>
                      <input
                        type='text'
                        className='col-span-2 mt-1 w-full basis-full rounded-md border border-gray-300 px-1.5 py-2.5 text-xs font-light md:basis-[75%] md:py-1 md:text-sm'
                        onChange={(e) =>
                          setFormData({ ...formData, userName: e.target.value })
                        }
                        value={formData.userName}
                        placeholder='Add here'
                      />
                    </div>
                    <div className='flex flex-col items-center px-4 py-1 md:flex-row'>
                      <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                        Name <span className='text-red-500'>*</span>
                      </span>
                      <input
                        type='text'
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        value={formData.name}
                        className='col-span-2 mt-1 w-full basis-full rounded-md border border-gray-300 px-1.5 py-2.5 text-xs font-light md:basis-[75%] md:py-1 md:text-sm'
                        placeholder='Add here'
                      />
                    </div>

                    <div className='flex flex-col items-center px-4 py-1 md:flex-row'>
                      <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                        Commission(%) <span className='text-red-500'>*</span>
                      </span>
                      <input
                        type='text'
                        className='col-span-2 mt-1 w-full basis-full rounded-md border border-gray-300 px-1.5 py-2.5 text-xs font-light md:basis-[75%] md:py-1 md:text-sm'
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            commition: e.target.value,
                          })
                        }
                        value={formData.commition}
                        placeholder='Add here'
                      />
                    </div>
                    <div className='flex flex-col items-center px-4 py-1 md:flex-row'>
                      <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                        Opening Balance <span className='text-red-500'>*</span>
                      </span>
                      <input
                        type='number'
                        className='col-span-2 mt-1 w-full basis-full rounded-md border border-gray-300 px-1.5 py-2.5 text-xs font-light md:basis-[75%] md:py-1 md:text-sm'
                        onChange={(e) => {
                          const openingValue = e.target.value;
                          if (openingValue.includes('.')) {
                            toast.error('The bank balance must be an integer');
                            return;
                          }
                          setFormData({ ...formData, balance: openingValue });
                        }}
                        value={formData.balance}
                        placeholder='Add here'
                      />
                    </div>
                    <div className='flex flex-col items-center px-4 py-1 md:flex-row'>
                      <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                        Exposure limit <span className='text-red-500'>*</span>
                      </span>
                      <input
                        type='number'
                        className='col-span-2 mt-1 w-full basis-full rounded-md border border-gray-300 px-1.5 py-2.5 text-xs font-light md:basis-[75%] md:py-1 md:text-sm'
                        onChange={(e) => {
                          const exposureValue = e.target.value;
                          if (exposureValue.includes('.')) {
                            return;
                          }
                          setFormData({
                            ...formData,
                            exposureLimit: exposureValue,
                          });
                        }}
                        value={formData.exposureLimit}
                        placeholder='Add here'
                      />
                    </div>

                    <div className='flex flex-col items-center px-4 py-1 md:flex-row'>
                      <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                        Credit Reference <span className='text-red-500'>*</span>
                      </span>
                      <input
                        type='number'
                        className='col-span-2 mt-1 w-full basis-full rounded-md border border-gray-300 px-1.5 py-2.5 text-xs font-light md:basis-[75%] md:py-1 md:text-sm'
                        onChange={(e) => {
                          const crRefValue = e.target.value;
                          let roundedValue = crRefValue;
                          if (crRefValue.includes('.')) {
                            roundedValue = Math.round(
                              parseFloat(crRefValue)
                            ).toString();
                          }
                          setFormData({
                            ...formData,
                            creditReference: roundedValue,
                          });
                        }}
                        value={formData.creditReference}
                        placeholder='Add here'
                      />
                    </div>

                    <div className='flex flex-col items-center px-4 py-1 md:flex-row'>
                      <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                        Mobile Number <span className='text-red-500'>*</span>
                      </span>
                      <input
                        type='text'
                        className='col-span-2 mt-1 w-full basis-full rounded-md border border-gray-300 px-1.5 py-2.5 text-xs font-light md:basis-[75%] md:py-1 md:text-sm'
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        value={formData.phone}
                        placeholder='Add here'
                      />
                    </div>
                    <div className='flex flex-col items-center px-4 py-1 md:flex-row'>
                      <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                        Password<span className='text-red-500'>*</span>
                      </span>
                      <span className='relative w-full basis-full font-light md:basis-[75%]'>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Enter your password...'
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          value={formData.password}
                          className='mt-1 w-full rounded border border-gray-300 px-1.5 py-2.5 pr-10 text-xs md:text-sm'
                        />
                        <button
                          type='button'
                          className='absolute inset-y-0 right-3 flex items-center text-gray-500'
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </span>
                    </div>

                    <div className='flex flex-col items-center px-4 py-1 md:flex-row'>
                      <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                        Confirm Password <span className='text-red-500'>*</span>
                      </span>
                      <span className='relative w-full basis-full font-light md:basis-[75%]'>
                        <input
                          type={showPassword2 ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder='Enter your password...'
                          className='mt-1 w-full rounded border border-gray-300 px-1.5 py-2.5 pr-10 text-xs md:text-sm'
                        />
                        <button
                          type='button'
                          className='absolute inset-y-0 right-3 flex items-center text-gray-500'
                          onClick={() => setShowPassword2(!showPassword2)}
                        >
                          {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </span>
                    </div>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='flex w-full flex-col items-center px-4 py-1 md:flex-row'>
                        <span className='basis-full text-center text-[12px] md:basis-[35%] md:text-left'>
                          Master Password{' '}
                          <span className='text-red-500'>*</span>
                        </span>
                        <span className='relative w-full basis-full font-light md:basis-[75%]'>
                          <input
                            type={showPassword3 ? 'text' : 'password'}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                masterPassword: e.target.value,
                              })
                            }
                            value={formData.masterPassword}
                            placeholder='Enter your password...'
                            className='mt-1 w-full rounded border border-gray-300 px-1.5 py-2.5 pr-10 text-xs md:text-sm'
                          />
                          <button
                            type='button'
                            className='absolute inset-y-0 right-3 flex items-center text-gray-500'
                            onClick={() => setShowPassword3(!showPassword3)}
                          >
                            {showPassword3 ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </span>
                      </div>

                      <button className='bg-blue mt-[16px] w-[140px] rounded-md px-[10px] py-[5px] text-[14px] text-white'>
                        Create
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        )}
        {creditPopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }} // start 20px below
              animate={{ opacity: 1, y: 0 }} // fade in and move to original position
              exit={{ opacity: 0, y: 20 }} // fade out and move down again
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between p-1 px-3 text-white'>
                <h5 className='text-md font-semibold'>
                  Edit Credit Reference - {currentUser.name}
                </h5>
                <button
                  className='text-xl font-bold text-white'
                  onClick={() => setCreditPopup(false)}
                >
                  ×
                </button>
              </div>
              {/* Commission List */}
              <div className='space-y-2'>
                <form onSubmit={handleUpdateCredit} className='space-y-2 p-4'>
                  <div className='grid grid-cols-4 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>Current</span>
                    <input
                      readOnly
                      type='text'
                      className='col-span-3 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:basis-[75%]'
                      value={currentUser.creditReference}
                      placeholder='Add here'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>New </span>
                    <input
                      type='text'
                      className='col-span-3 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:basis-[75%]'
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creditReference: e.target.value,
                        })
                      }
                      value={formData.creditReference}
                      placeholder='Add here'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>Password</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                      value={formData.masterPassword}
                      placeholder='Enter your password...'
                      className='col-span-3 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:basis-[75%]'
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <button
                      // onClick={() => handleUpdateCredit(e)}
                      className='bg-blue rounded-md px-3 py-1 text-white'
                    >
                      Submit
                    </button>
                    <button
                      className='rounded-md bg-gray-300 px-3 py-1'
                      onClick={() => setCreditPopup(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
        {patnerPopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }} // start 20px below
              animate={{ opacity: 1, y: 0 }} // fade in and move to original position
              exit={{ opacity: 0, y: 20 }} // fade out and move down again
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              <div className='bg-blue flex items-center justify-between px-4 py-1 font-bold text-white'>
                <span>Edit Exposure Limit - {currentUser.name}</span>
                <button
                  onClick={() => setPatnerPopup(false)}
                  className='text-xl text-white'
                >
                  ×
                </button>
              </div>

              {/* Commission List */}
              <div className='space-y-2'>
                <form
                  onSubmit={handleUpdateExploserLimit}
                  className='space-y-2 p-4'
                >
                  <div className='grid grid-cols-4 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>
                      Current - {currentUser.exposureLimit}
                    </span>
                    {/* <input
                        readOnly
                        type="text"
                        className="basis-full md:basis-[75%] font-light border border-gray-300 col-span-2 px-2 py-1 rounded-md"
                        value={currentUser.creditReference}
                        placeholder="Add here"
                      /> */}
                  </div>
                  <div className='grid grid-cols-4 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>New </span>
                    <input
                      type='text'
                      className='col-span-3 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:basis-[75%]'
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          exposureLimit: e.target.value,
                        })
                      }
                      value={formData.exposureLimit}
                      placeholder='Add here'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>Password</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                      value={formData.masterPassword}
                      placeholder='Enter your password...'
                      className='col-span-3 basis-full rounded-md border border-gray-300 px-2 py-1 font-light md:basis-[75%]'
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <button
                      // onClick={() => handleUpdateCredit(e)}
                      className='bg-blue rounded-md px-3 py-1 text-white'
                    >
                      Submit
                    </button>
                    <button
                      className='rounded-md bg-gray-300 px-3 py-1'
                      onClick={() => setPatnerPopup(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
        {balancePopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }} // start 20px below
              animate={{ opacity: 1, y: 0 }} // fade in and move to original position
              exit={{ opacity: 0, y: 20 }} // fade out and move down again
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between px-4 py-1 text-[15px] font-bold text-white'>
                <span>Banking - Master Balance : {userInfo.avbalance}</span>
                <button
                  onClick={() => setBalancePopup(false)}
                  className='text-xl text-white'
                >
                  ×
                </button>
              </div>
              <div className='p-4'>
                <div className='flex justify-between pb-4'>
                  <div className='flex items-center gap-1 lowercase'>
                    {' '}
                    <span className='inline-block h-fit rounded-sm border border-[#4dbd74] bg-[#4dbd74] px-1 py-0.5 text-[11px] leading-none text-white uppercase'>
                      {currentUser.role}
                    </span>
                    {currentUser.userName}
                  </div>
                  <div>
                    Client Bal:{' '}
                    <span className='font-semibold'>
                      {currentUser.avbalance}
                    </span>{' '}
                  </div>
                </div>
                <form onSubmit={handleWithdwalDeposite}>
                  <div className='mb-4 grid items-center md:grid-cols-4'>
                    <span className='col-span-1'>Balance</span>
                    <input
                      type='Number'
                      className='col-span-3 mt-1.5 basis-full rounded-md border border-[#e4e7ea] px-3 py-1.5 font-light md:mt-0'
                      onChange={(e) =>
                        setFormData({ ...formData, balance: e.target.value })
                      }
                      value={formData.balance}
                      placeholder='Add here'
                    />
                  </div>
                  <div className='mb-4 grid items-center md:grid-cols-4'>
                    <span className='col-span-1'>Remark</span>
                    <input
                      type='text'
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          remark: e.target.value,
                        })
                      }
                      value={formData.remark}
                      className='col-span-3 mt-1.5 basis-full rounded-md border border-[#e4e7ea] px-3 py-1.5 font-light md:mt-0'
                      placeholder='Add here'
                    />
                  </div>
                  <div className='mb-4 grid items-center md:grid-cols-4'>
                    <span className='col-span-1'>Password</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                      value={formData.masterPassword}
                      placeholder='Enter your password...'
                      className='col-span-3 mt-1.5 basis-full rounded-md border border-[#e4e7ea] px-3 py-1.5 font-light md:mt-0'
                    />
                  </div>
                  <div className='flex justify-end gap-2 pt-4 font-bold'>
                    <button
                      onClick={() => setType('deposite')}
                      className='cursor-pointer rounded-md bg-green-500 px-3 py-2 text-white opacity-40 hover:opacity-100'
                    >
                      Deposit
                    </button>
                    <button
                      className='cursor-pointer rounded-md bg-red-500 px-3 py-2 text-white opacity-40 hover:opacity-100'
                      onClick={() => setType('withdrawal')}
                    >
                      Withdraw
                    </button>
                  </div>
                </form>
              </div>

              {/* Commission List */}
            </motion.div>
          </div>
        )}
        {settingPopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }} // start 20px below
              animate={{ opacity: 1, y: 0 }} // fade in and move to original position
              exit={{ opacity: 0, y: 20 }} // fade out and move down again
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between p-1 px-3 text-white'>
                <h2 className='font-semibold'>Change Status</h2>
                <button
                  className='text-xl text-white'
                  onClick={() => setSettingPopup(false)}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className='p-4'>
                {/* User Info */}
                <div className='mb-4 flex items-center justify-between gap-2 text-[13px]'>
                  <div>
                    <span className='rounded bg-green-500 px-1 py-0.5 text-xs text-[11px] text-white'>
                      {currentUser.role}
                    </span>
                    <span className='ml-2'>{currentUser.name}</span>
                  </div>
                  <span className='rounded bg-green-200 px-2 py-1 text-xs text-green-800'>
                    {currentUser.status}
                  </span>
                </div>

                {/* Status Buttons */}
                <div className='mb-4 grid grid-cols-3 gap-3'>
                  {/* Active Button */}
                  <button
                    onClick={() =>
                      setFormData({ ...formData, status: 'active' })
                    }
                    className={`flex flex-col items-center rounded border p-3 ${
                      formData.status === 'active'
                        ? 'bg-green-500 text-white'
                        : 'border-green-500 text-green-600'
                    }`}
                  >
                    <FaCheckCircle size={20} />
                    <span>Active</span>
                  </button>

                  {/* Suspend Button */}
                  <button
                    onClick={() =>
                      setFormData({ ...formData, status: 'suspend' })
                    }
                    className={`flex flex-col items-center rounded border p-3 ${
                      formData.status === 'suspend'
                        ? 'bg-red-500 text-white'
                        : 'border-red-500 text-red-600'
                    }`}
                  >
                    <FaBan size={20} />
                    <span>Suspend</span>
                  </button>

                  {/* Locked Button */}
                  <button
                    onClick={() =>
                      setFormData({ ...formData, status: 'locked' })
                    }
                    className={`flex flex-col items-center rounded border p-3 ${
                      formData.status === 'locked'
                        ? 'bg-gray-700 text-white'
                        : 'border-gray-400 text-gray-700'
                    }`}
                  >
                    <FaLock size={20} />
                    <span>Locked</span>
                  </button>
                </div>

                <div className='grid grid-cols-2 gap-1'>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Password..'
                      className='w-full rounded border p-1 px-2'
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      className='absolute top-2 right-3 text-gray-500'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {/* Change Button */}
                  <button
                    onClick={handleSetting}
                    className='bg-blue w-full rounded px-2 text-white'
                  >
                    Change
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {sportsPopup && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between p-3 py-1 text-white'>
                <h2 className='font-semibold'>Sports Settings</h2>
                <button
                  className='text-xl text-white'
                  onClick={() => setSportsPopup(false)}
                >
                  ×
                </button>
              </div>

              {/* Table */}
              <div className='max-h-[400px] overflow-y-auto p-4'>
                <table className='w-full border-collapse border text-left'>
                  <thead>
                    <tr className='bg-gray-200'>
                      <th className='border p-2'>Sr.No.</th>
                      <th className='border p-2'>Sport Name</th>
                      <th className='border p-2'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameLockData.map((item, index) => {
                      // Find matching parent (admin/userInfo) gamelock entry
                      const parentGameLock = userInfo?.gamelock?.find(
                        (g) => g.game === item.game
                      );

                      // Is the parent lock ON (true)? Only then allow change
                      const isParentLocked = parentGameLock?.lock === true;

                      return (
                        <tr className='border' key={item.game}>
                          <td className='border p-2'>{index + 1}</td>
                          <td className='border p-2'>{item.game}</td>
                          <td className='border p-2 text-center'>
                            <input
                              type='checkbox'
                              checked={item.lock}
                              disabled={!isParentLocked} // disable checkbox if admin lock is false
                              onChange={() =>
                                isParentLocked &&
                                handleToggle(item.game, item.lock)
                              }
                            />
                            {!isParentLocked && (
                              <div className='text-xs text-red-500'>
                                Locked by Admin
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {isOpen && (
          <div className='fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-[#00000074] text-[13px]'>
            <motion.div
              initial={{ opacity: 0, y: -20 }} // start 20px below
              animate={{ opacity: 1, y: 0 }} // fade in and move to original position
              exit={{ opacity: 0, y: 20 }} // fade out and move down again
              transition={{ duration: 0.4 }}
              className='absolute top-[2%] left-1/2 w-[96%] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-[500px]'
            >
              {/* Header */}
              <div className='bg-blue flex items-center justify-between p-1 px-3 text-white'>
                <h5 className='text-md font-semibold'>
                  Credit Reference Log - {currentUser.name}
                </h5>
                <button
                  className='text-xl font-bold text-white'
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
              </div>

              {/* Body */}

              <div className='p-4'>
                {loading ? (
                  <div className='flex items-center justify-center py-10'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
                  </div>
                ) : (
                  <>
                    <div className='mb-4 flex flex-col justify-between text-[13px] md:flex-row'>
                      <div className='mb-2 flex items-center justify-center text-[#333] md:mb-0'>
                        <span className='mr-2'>Show</span>
                        <select
                          className='rounded border border-gray-300 px-2 py-1'
                          value={creditEntries}
                          onChange={(e) => {
                            setCreditEntries(Number(e.target.value));
                            setCurrentPage(1); // reset to first page on entries change
                          }}
                        >
                          <option value='2'>2</option>
                          <option value='5'>5</option>
                          <option value='10'>10</option>
                        </select>
                        <span className='ml-2'>entries</span>
                      </div>
                      <div className='flex items-center justify-center'>
                        <span className='mr-2'>Search</span>
                        <input
                          type='text'
                          className='rounded border border-gray-300 px-2 py-1'
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <table className='block w-full border-collapse overflow-x-auto border border-gray-300'>
                      <thead className='bg-gray-200'>
                        <tr>
                          <th className='border border-gray-300 px-[10px] py-[9px]'>
                            From Name
                          </th>
                          <th className='border border-gray-300 px-[10px] py-[9px]'>
                            Username
                          </th>
                          <th className='border border-gray-300 px-[10px] py-[9px]'>
                            Old Credit Reference
                          </th>
                          <th className='border border-gray-300 px-[10px] py-[9px]'>
                            New Credit Reference
                          </th>
                          <th className='border border-gray-300 px-[10px] py-[9px]'>
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {crediteHistory.length > 0 ? (
                          crediteHistory.map((item, index) => (
                            <tr key={index} className='text-center'>
                              <td className='border border-gray-300 p-2 text-red-500'>
                                ({item.formName})
                              </td>
                              <td className='border border-gray-300 px-[10px] py-[9px]'>
                                {item.userName}
                              </td>
                              <td className='border border-gray-300 p-2 text-red-500'>
                                ({item.oldamount})
                              </td>
                              <td className='border border-gray-300 px-[10px] py-[9px]'>
                                {item.newamount}
                              </td>
                              <td className='border border-gray-300 px-[10px] py-[9px]'>
                                {new Date(item.createdAt).toLocaleString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true,
                                  }
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan='5'
                              className='border border-gray-300 px-[10px] py-[9px] text-center'
                            >
                              No matching records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
