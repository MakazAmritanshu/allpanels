import React, { memo, useState } from 'react';
import { QUICK_AMOUNTS } from '../constants';
import { formatToK } from '../utils/bettingUtils';

/**
 * BetControlPanel - Panel for controlling bet placement
 * Includes odds control, amount control, and place bet button
 */
const BetControlPanel = memo(function BetControlPanel({
  betControl,
  betOdds,
  setBetOdds,
  betAmount,
  updateAmount,
  loading,
  onCancel,
  onPlaceBet,
  isVisible = true,
}) {
  const [selectedIncrement, setSelectedIncrement] = useState(
    QUICK_AMOUNTS[0].amt
  );

  if (!isVisible || !betControl) return null;

  const handlePlaceBet = async () => {
    const betType = betControl?.type;
    const teamName = betControl?.nat;
    const maxAmount = betControl?.max || 100000;
    const oddsValue = betControl?.odds || betOdds;
    await onPlaceBet(betType, teamName, maxAmount, oddsValue);
  };

  return (
    <div className='w-full rounded-md bg-blue-100 p-1 text-black'>
      {/* Main Controls */}
      <div className='grid grid-cols-2 gap-1 sm:flex sm:flex-row sm:items-center'>
        {/* Cancel */}
        <button
          className='h-[38px] flex-1 rounded-md border border-gray-400 bg-white font-semibold'
          onClick={onCancel}
        >
          Cancel
        </button>

        {/* Odds Control */}
        <div className='flex w-full items-center rounded-md border border-[#333] bg-white sm:w-auto'>
          <button
            className='h-[38px] border-r px-3'
            onClick={() => setBetOdds((prev) => Math.max(1.01, prev - 0.01))}
          >
            -
          </button>
          <input
            type='number'
            step='0.01'
            value={betOdds.toFixed(2)}
            onChange={(e) => setBetOdds(parseFloat(e.target.value) || 1.01)}
            className='h-[38px] w-full text-center outline-none sm:w-20'
          />
          <button
            className='h-[38px] border-l px-3'
            onClick={() => setBetOdds((prev) => prev + 0.01)}
          >
            +
          </button>
        </div>

        {/* Amount Control */}
        <div className='flex w-full items-center rounded-md border border-[#333] bg-white sm:w-auto'>
          <button
            className='h-[38px] border-r px-3'
            onClick={() =>
              updateAmount(Math.max(0, betAmount - selectedIncrement))
            }
          >
            -
          </button>
          <input
            type='number'
            value={betAmount || ''}
            onChange={(e) => updateAmount(parseInt(e.target.value) || 0)}
            className='h-[38px] w-full text-center outline-none sm:w-20'
          />
          <button
            className='h-[38px] border-l px-3'
            onClick={() => updateAmount(betAmount + selectedIncrement)}
          >
            +
          </button>
        </div>

        {/* Place Bet */}
        <button
          disabled={betAmount === 0 || loading}
          className={`h-[38px] flex-1 rounded-md border border-[#333] font-semibold transition-all duration-300 ${
            betAmount === 0
              ? 'cursor-not-allowed bg-gray-300 text-gray-500'
              : 'bg-color hover:bg-color text-white'
          } ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
          onClick={handlePlaceBet}
        >
          {loading ? 'Placing...' : 'Place Bet'}
        </button>
      </div>

      {/* Quick Amounts */}
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
              setSelectedIncrement(val.amt);
              updateAmount(val.amt);
            }}
          >
            {formatToK(val.amt)}
          </button>
        ))}
      </div>
    </div>
  );
});

export default BetControlPanel;
