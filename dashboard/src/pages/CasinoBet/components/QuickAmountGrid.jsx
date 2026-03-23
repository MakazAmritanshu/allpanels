import React, { memo } from 'react';
import { QUICK_AMOUNTS } from '../constants';
import { formatToK } from '../utils/bettingUtils';

/**
 * QuickAmountGrid - Grid of chip buttons for quick bet amount selection
 * Visual chip-style interface for selecting bet amounts
 */
const QuickAmountGrid = memo(function QuickAmountGrid({
  betAmount,
  onAmountSelect,
  variant = 'chips', // 'chips' | 'buttons'
  selectedIncrement,
  onIncrementSelect,
}) {
  if (variant === 'buttons') {
    return (
      <div className='mt-1 grid grid-cols-4 gap-1 lg:grid-cols-6 xl:grid-cols-8'>
        {QUICK_AMOUNTS.map((val) => (
          <button
            key={val.amt}
            className={`h-[30px] rounded-sm border border-[#333] text-[13px] transition-colors md:text-[14px] ${
              betAmount === val.amt
                ? 'bg-[#1a8ee1] text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => {
              onIncrementSelect?.(val.amt);
              onAmountSelect(val.amt);
            }}
          >
            {formatToK(val.amt)}
          </button>
        ))}
      </div>
    );
  }

  // Chips variant (default)
  return (
    <div className='flex flex-wrap justify-center gap-1 space-y-5 px-5 pt-8 pb-4'>
      {QUICK_AMOUNTS.map((val) => (
        <div
          key={val.amt}
          className={`relative w-18 cursor-pointer transition hover:scale-105 ${
            betAmount === val.amt ? '-translate-y-4 scale-105' : ''
          }`}
          onClick={() => onAmountSelect(val.amt, true)}
        >
          <img
            src={`/coins/${val.img}`}
            className='block drop-shadow-[0_0_.25rem_#fd8f3b]'
            alt={`${val.amt} chip`}
          />
          <p className='absolute inset-y-1/5 flex w-full justify-center text-black'>
            {formatToK(val.amt)}
          </p>
        </div>
      ))}
    </div>
  );
});

export default QuickAmountGrid;
