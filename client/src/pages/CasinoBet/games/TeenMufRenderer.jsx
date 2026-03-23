import React, { memo } from 'react';
import { FaLock } from 'react-icons/fa';
import QuickAmountGrid from '../components/QuickAmountGrid';

/**
 * TeenMufRenderer - Renders the betting UI for Teen Muf game
 * Simple two-player layout with rounded buttons
 */
const TeenMufRenderer = memo(function TeenMufRenderer({
  displayData,
  bettingData,
  betControl,
  setBetControl,
  setValue,
  betAmount,
  betOdds,
  updateAmount,
  placeBet,
}) {
  return (
    <>
      <div className='flex flex-1/2 justify-evenly gap-2 py-2'></div>

      {Object.entries(displayData).map(([nat, team], index) => (
        <div key={`${nat}-${index}`}>
          <div className='flex gap-4 rounded-br-sm rounded-bl-sm px-3 py-2'>
            {team.map((p, i) => {
              const isSelected = betControl?.sid === p.sid;
              const amount = betAmount || 0;
              return (
                <div
                  key={p.sid}
                  className='relative flex-1/2 justify-center text-center text-black'
                >
                  <div
                    onClick={async () => {
                      if (p.b > 0) {
                        setBetControl({ ...p, type: 'back', odds: p.b });
                        setValue(p.b, p.nat, 'back');
                      }
                      const betType = betControl?.type;
                      const teamName = betControl?.nat;
                      const maxAmount = betControl?.max || 100000;
                      const oddsValue = betControl?.odds || betOdds;
                      await placeBet(betType, teamName, maxAmount, oddsValue);
                    }}
                    className={`${
                      betControl?.sid === p.sid
                        ? 'bg-[#000000]'
                        : 'bg-[#1a1919]'
                    } grid w-full gap-1 py-2 leading-none text-white shadow-[0_2px_7px_1px_#67828be6] ${
                      i === 0 ? 'rounded-l-3xl' : ''
                    } ${i === 1 ? 'rounded-r-3xl' : ''}`}
                  >
                    <span className='text-xl font-bold'>{p.nat}</span>
                    <span className='text-xl font-bold'>{p.b}</span>
                    {isSelected && betControl && amount > 0 && (
                      <div>
                        <span className='font-bold text-green-600'>
                          P: {(amount * (betOdds - 1)).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {!isSelected && betControl && amount > 0 && (
                      <div>
                        <span className='font-bold text-red-600'>
                          L: {amount}
                        </span>
                      </div>
                    )}
                  </div>
                  {bettingData.sub[0].gstatus === 'SUSPENDED' && (
                    <div
                      className={`absolute top-0 left-0 z-20 flex h-full w-full items-center justify-center bg-black/70 text-white ${
                        i === 0 ? 'rounded-l-3xl' : ''
                      } ${i === 1 ? 'rounded-r-3xl' : ''}`}
                    >
                      <FaLock />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <QuickAmountGrid
        betAmount={betAmount}
        onAmountSelect={updateAmount}
        variant='chips'
      />
    </>
  );
});

export default TeenMufRenderer;
