// import React from "react";

// function MatchedBet({ pendingBetAmounts }) {
//   console.log("pendingBetAmounts", pendingBetAmounts);

//   if (!pendingBetAmounts || !Array.isArray(pendingBetAmounts) || pendingBetAmounts.length === 0) {
//     return null;
//   }

//   return (
//     <div className="bg-[#f7f7f7]">
//       {/* Table Headers */}
//       <div className="bg-white grid grid-cols-3 gap-px">
//         <div className="h-8 flex items-center text-sm font-semibold p-1 text-left">
//           Matched Bet
//         </div>
//         <div className="h-8 flex items-center text-sm font-semibold p-1 text-left">
//           Odds
//         </div>
//         <div className="h-8 flex items-center text-sm font-semibold p-1 text-left">
//           Stake
//         </div>
//       </div>

//       {/* Table Rows */}
//       {pendingBetAmounts.map((item, index) => (
//         <div
//           key={index}
//           className={`grid grid-cols-3 gap-px ${item?.otype === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}
//         >
//           <div className="h-8 flex items-center text-sm font-semibold p-1 text-left text-gray-800">
//             {item?.teamName || 'N/A'}
//           </div>
//           <div className="h-8 flex items-center text-sm font-semibold p-1 text-right text-gray-800">
//             {item?.totalBetAmount || '0'}
//           </div>
//           <div className="h-8 flex items-center text-sm font-semibold p-1 text-right text-gray-800">
//             {(item?.totalPrice).toFixed(2) || '0'}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default MatchedBet;

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBetHistory } from '../../redux/reducer/betReducer';
function MatchedBet({ gameid }) {
  const dispatch = useDispatch();
  const { betHistory, loading, pagination } = useSelector((state) => state.bet);
  useEffect(() => {
    dispatch(
      getBetHistory({
        gameid,
        page: 1,
        limit: 10,
        selectedVoid: 'unsettel',
      })
    );
  }, [dispatch, gameid]);
  console.log('betHistory', betHistory);
  const filteredBetHistory = betHistory.filter((bet) => bet.gameId === gameid);
  console.log('filteredBetHistory', filteredBetHistory);

  // Format number with commas
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className='bg-[#f7f7f7]'>
      {/* Table Headers */}
      <div className='grid grid-cols-4 border-b border-gray-300 bg-white'>
        <div className='col-span-2 flex h-8 items-center px-2 py-1 text-left text-sm font-semibold'>
          Matched Bet
        </div>
        <div className='flex h-8 items-center px-2 py-1 text-right text-sm font-semibold'>
          Odds
        </div>
        <div className='flex h-8 items-center px-2 py-1 text-right text-sm font-semibold'>
          Stake
        </div>
      </div>

      {/* Table Rows */}
      {filteredBetHistory.length > 0 ? (
        filteredBetHistory.map((item, index) => (
          <div
            key={index}
            className={`grid grid-cols-4 border-b border-gray-200 ${item?.otype === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}
          >
            <div className='col-span-2 flex h-8 items-center truncate px-2 py-1 text-left text-sm font-semibold text-gray-800'>
              {item?.teamName || 'N/A'}
              {item?.fancyScore ? `/${item?.xValue}` : ''}
            </div>
            <div className='flex h-8 items-center px-2 py-1 text-right text-sm font-semibold text-gray-800'>
              {item?.fancyScore || item?.xValue || '0'}
            </div>
            <div className='flex h-8 items-center px-2 py-1 text-right text-sm font-semibold text-gray-800'>
              {formatNumber(
                item?.otype === 'back' ? item.price : item.betAmount
              )}
            </div>
          </div>
        ))
      ) : (
        <div className='flex h-8 items-center justify-center bg-white px-2 py-1 text-sm text-gray-500'></div>
      )}
    </div>
  );
}

export default MatchedBet;
