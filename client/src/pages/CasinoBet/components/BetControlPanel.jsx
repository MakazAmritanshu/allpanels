import React, { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { QUICK_AMOUNTS } from '../constants';
import { formatToK } from '../utils/bettingUtils';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { BiPlus, BiMinus } from 'react-icons/bi';
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

  const [selectedIncrement, setSelectedIncrement] = useState(amounts[0].amt);

  if (!isVisible || !betControl) return null;

  const handlePlaceBet = async () => {
    const betType = betControl?.type;
    let teamName = betControl?.nat;
    let subtype = '';

    if (betControl?.subtype === 'poker20') {
      const suffix = betControl?.sid >= 11 && betControl?.sid <= 19 ? 'A' : 'B';
      teamName = suffix === 'A' ? 'Player A' : 'Player B';
      subtype = `${betControl?.nat} ${suffix}`;
    }

    const maxAmount = betControl?.max || 100000;
    const oddsValue = betControl?.odds || betOdds;
    await onPlaceBet(betType, teamName, maxAmount, oddsValue, subtype);
  };

  return (
    <div
      className={`w-full pt-0.5 text-black ${betControl?.type === 'back' ? 'bg-[#beddf4]' : 'bg-[#f3dce2]'}`}
    >
      {/* Main Controls */}
      <div className='grid w-full grid-cols-2 gap-2.5 p-1 text-[14px] md:grid-cols-4'>
        {/* Cancel */}
        <button
          className='w-full rounded-md border border-black bg-white font-semibold'
          onClick={onCancel}
        >
          Cancel
        </button>

        {/* Odds Control */}
        <div className='flex w-full items-center overflow-hidden rounded-md border border-gray-400 bg-white'>
          <button
            className='h-[38px] border-r border-gray-400 bg-gray-100 px-1'
            onClick={() => setBetOdds((prev) => Math.max(1.01, prev - 0.01))}
          >
            <BiMinus className='size-8 text-[#1f72ac]' />
          </button>
          <input
            type='number'
            step='0.01'
            value={betOdds.toFixed(2)}
            onChange={(e) => setBetOdds(parseFloat(e.target.value) || 1.01)}
            className='w-full text-center font-bold outline-none'
          />
          <button
            className='h-[38px] border-l border-gray-400 bg-gray-100 px-1'
            onClick={() => setBetOdds((prev) => prev + 0.01)}
          >
            <BiPlus className='size-8 text-[#1f72ac]' />
          </button>
        </div>

        {/* Amount Control */}
        <div className='flex w-full items-center overflow-hidden rounded-md border border-gray-400 bg-white'>
          <button
            className='h-[38px] w-[38px] border-r border-gray-400 bg-gray-100'
            onClick={() =>
              updateAmount(Math.max(0, betAmount - selectedIncrement))
            }
          >
            <BiMinus className='size-8 text-[#1f72ac]' />
          </button>
          <input
            type='number'
            value={betAmount || ''}
            onChange={(e) => updateAmount(parseInt(e.target.value) || 0)}
            className='w-full text-center outline-none'
            placeholder='0'
          />
          <button
            className='h-[38px] w-[38px] border-l border-gray-400 bg-gray-100'
            onClick={() => updateAmount(betAmount + selectedIncrement)}
          >
            <BiPlus className='size-8 text-[#1f72ac]' />
          </button>
        </div>

        {/* Place Bet */}
        <button
          disabled={betAmount === 0 || loading}
          className={`w-full rounded-md border border-[#333] font-semibold transition-all duration-300 ${
            betAmount === 0
              ? 'cursor-not-allowed bg-[#a4a4a4] text-white'
              : 'bg-primary hover:bg-primary text-white'
          } ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
          onClick={handlePlaceBet}
        >
          {loading ? 'Placing...' : 'Place Bet'}
        </button>
      </div>

      {/* Quick Amounts */}
      <div
        className={`grid grid-cols-4 gap-2.5 border-t p-1 text-[14px] lg:grid-cols-6 xl:grid-cols-8 ${betControl?.type === 'back' ? 'border-[#7dbbe9]' : 'border-[#dfa3b3]'}`}
      >
        {amounts.map((val) => (
          <button
            key={val.amt}
            className={`h-[31px] rounded-sm border border-black px-3 py-1.5 text-[13px] leading-1 transition-colors ${
              betAmount === val.amt
                ? 'bg-[#1a8ee1] text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => {
              setSelectedIncrement(val.amt);
              updateAmount(val.amt);
            }}
          >
            {val.label || formatToK(val.amt)}
          </button>
        ))}
      </div>
    </div>
  );
});

export default BetControlPanel;
