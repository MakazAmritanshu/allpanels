import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaBan,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRegEdit,
  FaUnlock,
} from 'react-icons/fa';
import {
  getAllOnlyUserAndDownline,
  setCurrentPage,
  updateCreditReference,
  withdrawalAndDeposite,
} from '../redux/reducer/authReducer';
import { toast } from 'react-toastify';
const Banking = () => {
  const dispatch = useDispatch();

  const { currentPage, totalPages, onlyusers } = useSelector(
    (state) => state.auth
  );

  const [entries, setEntries] = useState(10);
  const [creditPopup, setCreditPopup] = useState(false);
  const [currentUser, setcurrentUser] = useState(null);
  const [type, setType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    creditReference: null,
    masterPassword: '',
    status: 'active',
    userInputs: {},
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateCreditReference({ formData, userId: currentUser._id })).then(
      (res) => {
        if (res?.payload?.success) {
          toast.success(res.payload.message);
          setCreditPopup(false);
          dispatch(
            getAllOnlyUserAndDownline({
              page: currentPage,
              limit: entries,
              searchQuery,
            })
          );
        } else {
          toast.error(res.payload.message);
        }
      }
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  const handleWithdwalDeposite = async (e) => {
    if (!type) return toast.error('Selected Withdrawal or Deposite');
    console.log('type', type);
    if (!currentUser) return toast.error('No user selected');
    try {
      const userInput = formData.userInputs[currentUser._id] || {};

      const finalData = {
        ...formData,
        balance: userInput.balance || '',
        remark: userInput.remark || '',
      };
      const data = await dispatch(
        withdrawalAndDeposite({
          formData: finalData,
          userId: currentUser._id,
          type,
        })
      ).unwrap();
      toast.success(data.message);
      // dispatch(getAdmin());
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

  useEffect(() => {
    dispatch(
      getAllOnlyUserAndDownline({
        page: currentPage,
        limit: entries,
        searchQuery,
      })
    );
  }, [dispatch, currentPage, entries, searchQuery]);
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
        {/* Statement Table */}
        <div className='rounded-sm border border-gray-300 bg-white'>
          <div className='p-5'>
            <div className='mb-4 flex flex-col items-center justify-between text-[#333] md:flex-row'>
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

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border-2 border-gray-300'>
                <thead>
                  <tr className='bg-[#e0e6e6]'>
                    <th className='border border-gray-300 p-2 text-left'>
                      <div className='flex items-center justify-between text-[13px]'>
                        UID
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
                        Available D/W
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
                        Exposure
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
                        Credit Reference
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
                        Reference P/L
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
                        Deposit P/L
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
                  </tr>
                </thead>
                <tbody className='border'>
                  {onlyusers.map((item, i) => (
                    <tr
                      key={i}
                      className='border border-gray-300 font-semibold'
                    >
                      <td className='border border-gray-300 p-2'>
                        {item.userName}
                      </td>
                      <td className='border border-gray-300 p-2'>
                        {formatNumber(item.balance)}
                      </td>
                      <td className='border border-gray-300 p-2'>
                        {formatNumber(item.avbalance)}
                      </td>
                      <td className='border border-gray-300 p-2 text-red-600'>
                        ({formatNumber(item.exposure)})
                      </td>
                      <td className='border border-gray-300 p-2'>
                        <div className='flex items-center gap-x-2'>
                          {formatNumber(item.creditReference)}
                          <span
                            className='text-blue2'
                            onClick={() => {
                              setCreditPopup(true);
                              setcurrentUser(item);
                            }}
                          >
                            <FaRegEdit />
                          </span>
                        </div>
                      </td>
                      <td
                        className={`border border-gray-300 p-2 ${
                          item.bettingProfitLoss <= 0
                            ? 'text-red-600 '
                            : 'text-green-700'
                        }`}
                      >
                        {formatNumber(item.bettingProfitLoss)}
                      </td>
                      <td className='border border-gray-300 p-2'>
                        <div className='flex items-center gap-1'>
                          <button
                            onClick={() => {
                              setType('deposite');
                              setcurrentUser(item);
                            }}
                            className={`rounded border border-gray-900 px-3 py-2 text-xs text-white ${
                              type === 'deposite' &&
                              currentUser?._id === item._id
                                ? 'bg-green-700'
                                : 'bg-gray-300'
                            }`}
                          >
                            D
                          </button>

                          <button
                            onClick={() => {
                              setType('withdrawal');
                              setcurrentUser(item);
                            }}
                            className={`rounded border border-gray-900 px-3 py-2 text-xs text-white ${
                              type === 'withdrawal' &&
                              currentUser?._id === item._id
                                ? 'bg-red-600'
                                : 'bg-gray-300'
                            }`}
                          >
                            W
                          </button>

                          <input
                            type='number'
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                userInputs: {
                                  ...prev.userInputs,
                                  [item._id]: {
                                    ...prev.userInputs[item._id],
                                    balance: e.target.value,
                                  },
                                },
                              }))
                            }
                            value={formData.userInputs[item._id]?.balance || ''}
                            placeholder='Add here'
                            className='mx-1 border border-gray-300 px-3 py-2 text-xs'
                          />

                          <button
                            className={`rounded bg-gray-500 px-3 py-2 text-xs text-white ${type === 'withdrawal' ? 'bg-dark' : 'bg-gray-500'} `}
                          >
                            Full
                          </button>
                        </div>
                      </td>
                      <td className='border border-gray-300 p-2'>
                        <input
                          type='text'
                          placeholder='Remark'
                          className='w-full border border-gray-300 px-3 py-2 text-xs'
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              userInputs: {
                                ...prev.userInputs,
                                [item._id]: {
                                  ...prev.userInputs[item._id],
                                  remark: e.target.value,
                                },
                              },
                            }))
                          }
                          value={formData.userInputs[item._id]?.remark || ''}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='mt-4 flex flex-col items-center justify-between gap-3 md:flex-row'>
              <div>
                Showing {currentPage} to {totalPages} of {onlyusers?.length}{' '}
                entries
              </div>
              <div className='flex'>
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
              </div>
            </div>
            <div className='mt-6 flex flex-wrap'>
              <div className='w-1/2 px-3 md:w-1/4'>
                <button className='w-full rounded-md bg-[#f86c6b] px-2.5 py-[5px] text-[14px] font-bold text-white'>
                  Clear All
                </button>
              </div>
              <div className='w-1/2 px-3 md:w-1/4'>
                <input
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      masterPassword: e.target.value,
                    })
                  }
                  value={formData.masterPassword}
                  placeholder='Password...'
                  className='w-full rounded-md border border-gray-200 px-2.5 py-[5px] text-[14px]'
                />
              </div>
              <div className='w-full px-3 md:w-1/4'>
                <button
                  onClick={handleWithdwalDeposite}
                  className='bg-dark mt-4 w-full rounded-md px-2.5 py-[5px] text-[14px] font-bold text-white md:mt-0'
                >
                  Submit Payment
                </button>
              </div>
            </div>
          </div>
        </div>
        {creditPopup && (
          <div className='fixed inset-0 flex items-center justify-center bg-[#00000074]'>
            <div className='w-70 rounded-lg bg-white shadow-lg md:w-100'>
              {/* Header */}
              <div className='bg-blue flex justify-between px-4 py-1 font-bold text-white'>
                <span>Edit Credit Refernce - {currentUser.name}</span>
                <button
                  onClick={() => setCreditPopup(false)}
                  className='text-xl text-white'
                >
                  X
                </button>
              </div>

              {/* Commission List */}
              <div className='space-y-2 p-4'>
                <form onSubmit={handleUpdate} className='space-y-2 p-4'>
                  <div className='grid grid-cols-3 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>Current</span>
                    <input
                      readOnly
                      type='text'
                      className='col-span-2 rounded-md border border-gray-300 px-2 py-1'
                      value={currentUser.creditReference}
                      placeholder='Add here'
                    />
                  </div>
                  <div className='grid grid-cols-3 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>New </span>
                    <input
                      type='text'
                      className='col-span-2 rounded-md border border-gray-300 px-2 py-1'
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
                  <div className='grid grid-cols-3 items-center px-4 py-1'>
                    <span className='col-span-1 text-sm'>Password</span>
                    <input
                      type='password'
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          masterPassword: e.target.value,
                        })
                      }
                      value={formData.masterPassword}
                      placeholder='Enter your password...'
                      className='col-span-2 rounded-md border border-gray-300 px-2 py-1'
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <button
                      // onClick={() => handleUpdate(e)}
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
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Banking;
