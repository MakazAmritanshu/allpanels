import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Commision() {
  const [activeCommissionTab, setActiveCommissionTab] = useState('fancy');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pastdate, setPastDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const tabs = ['fancy', 'matka', 'casino', 'binary', 'sportbook', 'bookmaker'];

  return (
    <>
      <Navbar />
      <div className='px-3.5 md:px-7.5'>
        <div>
          <div className='mb-4 rounded border border-[#000501] bg-[#e0e6e6] p-4'>
            <div className='flex flex-col items-center gap-4 md:flex-row'>
              <div className='relative'>
                <input
                  type='date'
                  className='rounded border border-gray-300 p-2'
                  value={pastdate}
                  onChange={(e) => setPastDate(e.target.value)}
                />
                <button className='absolute top-2 right-2 text-gray-500'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </div>

              <div className='font-medium'>TO</div>

              <div className='relative'>
                <input
                  type='date'
                  className='rounded border border-gray-300 p-2'
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <button className='absolute top-2 right-2 text-gray-500'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </div>

              <button className='rounded bg-slate-700 px-4 py-2 text-white'>
                Get Commission
              </button>
            </div>
          </div>

          <div className='rounded border border-gray-300 bg-white'>
            <div className='bg-slate-700 p-3 text-white'>
              <h2 className='font-bold'>Agent Commission</h2>
            </div>

            <div className='p-4'>
              {/* Commission Category Tabs */}
              <div className='mb-4 flex flex-wrap border-b'>
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`rounded-md px-4 py-2 text-sm ${
                      activeCommissionTab === tab
                        ? 'border-t-2 border-black bg-white font-bold'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveCommissionTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Commission Table */}
              {activeCommissionTab == 'fancy' && (
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2 text-left'>
                          Agent Name
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Turn Over
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Commission
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className='border border-gray-300 p-4 text-center'
                        >
                          {`No data available for ${activeCommissionTab}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeCommissionTab == 'matka' && (
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2 text-left'>
                          Agent Name
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Turn Over
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Commission
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className='border border-gray-300 p-4 text-center'
                        >
                          {`No data available for ${activeCommissionTab}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeCommissionTab == 'casino' && (
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2 text-left'>
                          Agent Name
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Turn Over
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Commission
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className='border border-gray-300 p-4 text-center'
                        >
                          {`No data available for ${activeCommissionTab}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeCommissionTab == 'binary' && (
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2 text-left'>
                          Agent Name
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Turn Over
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Commission
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className='border border-gray-300 p-4 text-center'
                        >
                          {`No data available for ${activeCommissionTab}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeCommissionTab == 'sportbook' && (
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2 text-left'>
                          Agent Name
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Turn Over
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Commission
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className='border border-gray-300 p-4 text-center'
                        >
                          {`No data available for ${activeCommissionTab}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeCommissionTab == 'bookmaker' && (
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2 text-left'>
                          Agent Name
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Turn Over
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Commission
                        </th>
                        <th className='border border-gray-300 p-2 text-left'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className='border border-gray-300 p-4 text-center'
                        >
                          {`No data available for ${activeCommissionTab}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
