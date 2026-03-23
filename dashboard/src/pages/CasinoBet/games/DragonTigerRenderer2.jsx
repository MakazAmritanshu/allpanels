import React, { memo, useMemo } from 'react';
import { FaLock } from 'react-icons/fa';

const groupDragonTigerData2 = (sub = []) => {
  const byNat = (name) => sub.find((s) => s.nat === name);

  return {
    dragon: byNat('Dragon'),
    tiger: byNat('Tiger'),
    pair: byNat('Pair'),

    dragonEven: byNat('Dragon Even'),
    dragonOdd: byNat('Dragon Odd'),

    tigerRed: byNat('Tiger Red'),
    tigerBlack: byNat('Tiger Black'),
  };
};

const DragonTigerRenderer2 = memo(function DragonTigerRenderer2({
  bettingData,
  betControl,
  setBetControl,
  setValue,
  setSelectedTeamSubtype,
}) {
  const grouped = useMemo(
    () => groupDragonTigerData2(bettingData?.sub),
    [bettingData?.sub]
  );

  const handleSelect = (item) => {
    if (!item || item.b <= 0 || item.gstatus !== 'OPEN') return;

    setBetControl({
      ...item,
      type: 'back',
      odds: item.b,
    });

    setSelectedTeamSubtype(item.subtype);
    setValue(item.b, item.nat, 'back');
  };

  return (
    <div className='space-y-1 p-3'>
      {/* ================= HEADERS ================= */}
      <div className='flex justify-between px-10 text-[14px] font-bold'>
        <span>DRAGON</span>
        <span>TIGER</span>
      </div>
      <div
        className='flex justify-between gap-4 rounded-full bg-white/70'
        style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 4px 12px' }}
      >
        {/* ================= DRAGON ================= */}
        <div className='text-center'>
          <div className='flex'>
            <div className='relative flex max-w-[60px] min-w-[60px] cursor-pointer flex-col items-center justify-between rounded-l-full bg-[#72bbef] px-8 py-3 text-black transition-all duration-150'>
              <div className='text-[12px] font-bold'>{grouped.dragon?.b}</div>
              <div className='text-[12px] font-semibold'>
                {grouped.dragon?.bs}
              </div>
              {grouped.dragon?.gstatus !== 'OPEN' && (
                <div className='absolute inset-0 flex items-center justify-center rounded-l-full bg-black/60 text-xl'>
                  <FaLock className='size-4 text-white' />
                </div>
              )}
            </div>
            <div className='relative flex max-w-[60px] min-w-[60px] cursor-pointer flex-col items-center justify-between rounded-r-full bg-[#f9c9d4] px-8 py-3 text-black transition-all duration-150'>
              <div className='text-[12px] font-bold'>{grouped.dragon?.l}</div>
              <div className='text-[12px] font-semibold'>
                {grouped.dragon?.ls}
              </div>
              {grouped.dragon?.gstatus !== 'OPEN' && (
                <div className='absolute inset-0 flex items-center justify-center rounded-r-full bg-black/60 text-xl'>
                  <FaLock className='size-4 text-white' />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ================= TIGER ================= */}
        <div className='text-center'>
          <div className='flex'>
            <div className='relative flex max-w-[60px] min-w-[60px] cursor-pointer flex-col items-center justify-between rounded-l-full bg-[#72bbef] px-8 py-3 text-black transition-all duration-150'>
              <div className='text-[12px] font-bold'>{grouped.tiger?.b}</div>
              <div className='text-[12px] font-semibold'>
                {grouped.tiger?.bs}
              </div>
              {grouped.tiger?.gstatus !== 'OPEN' && (
                <div className='absolute inset-0 flex items-center justify-center rounded-l-full bg-black/60 text-xl'>
                  <FaLock className='size-4 text-white' />
                </div>
              )}
            </div>
            <div className='relative flex max-w-[60px] min-w-[60px] cursor-pointer flex-col items-center justify-between rounded-r-full bg-[#f9c9d4] px-8 py-3 text-black transition-all duration-150'>
              <div className='text-[12px] font-bold'>{grouped.tiger?.l}</div>
              <div className='text-[12px] font-semibold'>
                {grouped.tiger?.ls}
              </div>
              {grouped.tiger?.gstatus !== 'OPEN' && (
                <div className='absolute inset-0 flex items-center justify-center rounded-r-full bg-black/60 text-xl'>
                  <FaLock className='size-4 text-white' />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAIR (TIE) ================= */}
      <div className='flex flex-col rounded-sm bg-white/40 px-1 py-3'>
        <div
          onClick={() => handleSelect(grouped.pair)}
          className='relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-b from-[#1e7f5c] to-[#0d4d3a] px-6 py-4 text-[14px]'
        >
          <span>PAIR (TIE)</span>
          <span>{grouped.pair?.b}</span>
          {grouped.pair?.gstatus !== 'OPEN' && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/60 text-xl'>
              <FaLock className='size-4' />
            </div>
          )}
        </div>
        <div className='flex justify-end'>
          Min:{grouped.pair?.min} Max:{grouped.pair?.max}
        </div>
      </div>

      {/* ================= HEADERS ================= */}
      <div className='mb-2 grid grid-cols-2 bg-gradient-to-b from-[#1e7f5c] to-[#0d4d3a] px-2 py-2 text-center text-[16px] font-bold'>
        <span>DRAGON</span>
        <span>TIGER</span>
      </div>

      {/* ================= DRAGON EVEN / ODD & TIGER COLOR ================= */}
      <div className='grid grid-cols-2 gap-4'>
        {/* Dragon side */}
        <div className='flex flex-wrap justify-between bg-white/50 px-3 py-2'>
          <div className='w-[calc(100%/2-10px)]'>
            <div className='text-center'>{grouped.dragonEven?.b}</div>
            <div className='relative flex-1 cursor-pointer flex-col items-center justify-between rounded-3xl bg-gradient-to-b from-[#1e7f5c] to-[#0d4d3a] py-5 text-center transition-all duration-150'>
              <div className='text-[14px]'>EVEN</div>
              {grouped.dragonEven?.gstatus !== 'OPEN' && (
                <div className='absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 text-xl'>
                  <FaLock className='size-4 text-white' />
                </div>
              )}
            </div>
          </div>
          <div className='w-[calc(100%/2-10px)]'>
            <div className='text-center'>{grouped.dragonOdd?.b}</div>
            <div className='relative flex-1 cursor-pointer flex-col items-center justify-between rounded-3xl bg-[#f9c9d4] bg-gradient-to-b from-[#1e7f5c] to-[#0d4d3a] py-5 text-center transition-all duration-150'>
              <div className='text-[14px]'>ODD</div>
              {grouped.dragonOdd?.gstatus !== 'OPEN' && (
                <div className='absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 text-xl'>
                  <FaLock className='size-4 text-white' />
                </div>
              )}
            </div>
          </div>
          <div className='w-full pt-1 text-end'>
            Min:{grouped.dragonEven?.min} Max:{grouped.dragonEven?.max}
          </div>
        </div>

        {/* Tiger side */}

        <div className='flex flex-wrap justify-between bg-white/50 px-3 py-2'>
          <div className='w-[calc(100%/2-10px)]'>
            <div className='text-center'>{grouped.tigerRed?.b}</div>
            <div className='relative cursor-pointer flex-col items-center justify-between rounded-3xl bg-gradient-to-b from-[#1e7f5c] to-[#0d4d3a] py-2 text-center text-red-500 transition-all duration-150'>
              <div className='text-[30px] font-bold'>♦ ♥</div>
              {grouped.tigerRed?.gstatus !== 'OPEN' && (
                <div className='absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 text-xl'>
                  <FaLock className='size-4 text-white' />
                </div>
              )}
            </div>
          </div>

          <div className='w-[calc(100%/2-10px)]'>
            <div className='text-center'>{grouped.tigerBlack?.b}</div>
            <div className='relative cursor-pointer flex-col items-center justify-between rounded-3xl bg-[#f9c9d4] bg-gradient-to-b from-[#1e7f5c] to-[#0d4d3a] py-2 text-center text-black transition-all duration-150'>
              <div className='text-[30px] font-bold'>♣ ♠</div>
              {grouped.tigerBlack?.gstatus !== 'OPEN' && (
                <div className='absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 text-xl'>
                  <FaLock className='size-4 text-white' />
                </div>
              )}
            </div>
          </div>

          <div className='w-full pt-1 text-end'>
            Min:{grouped.tigerBlack?.min} Max:{grouped.tigerBlack?.max}
          </div>
        </div>
      </div>
    </div>
  );
});

export default DragonTigerRenderer2;
