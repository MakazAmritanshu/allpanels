import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { QUICK_AMOUNTS } from '../constants';
import { formatToK } from '../utils/bettingUtils';

const QuickAmountGrid = memo(function QuickAmountGrid({
  betAmount,
  onAmountSelect,
  variant = 'chips',
  selectedIncrement,
  onIncrementSelect,
}) {
  const { userInfo } = useSelector((state) => state.auth);
  const amounts = (() => {
    const saved = userInfo?.casinoQuickStakes;
    if (!saved?.length) return QUICK_AMOUNTS;
    return QUICK_AMOUNTS.map((def, i) => {
      const item = saved[i];
      if (!item) return def;
      if (typeof item === 'object' && item.label && item.value) {
        return { amt: item.value, label: item.label, img: def.img };
      }
      if (typeof item === 'number' && item > 0) {
        return { amt: item, label: def.label, img: def.img };
      }
      return def;
    });
  })();

  if (variant === 'buttons') {
    return (
      <div className='mt-1 grid grid-cols-4 gap-1 lg:grid-cols-6 xl:grid-cols-8'>
        {amounts.map((val) => (
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
            {val.label || formatToK(val.amt)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-wrap justify-center gap-1 space-y-5 px-5 pt-8 pb-4'>
      {amounts.map((val) => (
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
            {val.label || formatToK(val.amt)}
          </p>
        </div>
      ))}
    </div>
  );
});

export default QuickAmountGrid;
