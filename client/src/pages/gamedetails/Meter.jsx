import React, { useMemo } from 'react';
import { FaArrowRight } from 'react-icons/fa';

function Meter({ onBetSelect, meterData, pendingBetAmounts, selectedBet }) {
  // Helper function to format max value
  const formatMax = (max) => {
    if (typeof max === 'string') return max;
    if (max >= 100000) return `${(max / 100000).toFixed(0)}L`;
    if (max >= 1000) return `${(max / 1000).toFixed(0)}k`;
    return max;
  };

  // Transform API data to component format
  const transformedData = useMemo(() => {
    if (!meterData || meterData.length === 0) {
      return [];
    }

    return meterData.map((item, index) => {
      // Get back and lay odds
      const backOdd = item.odds?.find((odd) => odd.otype === 'back');
      const layOdd = item.odds?.find((odd) => odd.otype === 'lay');

      return {
        id: index + 1,
        label: item.team || `Item ${index + 1}`,
        no:
          backOdd && backOdd.odds > 0
            ? {
                rate: backOdd.odds,
                size: backOdd.size || 0,
              }
            : { rate: null, size: null },
        yes:
          layOdd && layOdd.odds > 0
            ? {
                rate: layOdd.odds,
                size: layOdd.size || 0,
              }
            : { rate: null, size: null },
        min: item.min || 0,
        max: formatMax(item.max || 0),
        sid: item.sid,
        status: item.status, // Status from API
      };
    });
  }, [meterData]);

  // Split data into left and right columns
  const mid = Math.ceil(transformedData.length / 2);
  const leftData = transformedData.slice(0, mid);
  const rightData = transformedData.slice(mid);

  // Get bet details from pending bets
  const getBetDetails = (team) => {
    const matchedBet = pendingBetAmounts?.find(
      (item) =>
        item.gameType === 'meter' &&
        item.teamName?.toLowerCase() === team?.toLowerCase()
    );

    return {
      otype: matchedBet?.otype || '',
      totalBetAmount: matchedBet?.totalBetAmount || '',
      totalPrice: matchedBet?.totalPrice || '',
      teamName: matchedBet?.teamName || '',
    };
  };

  const handleOddsClick = (team, rate, type, sid, min, max, size) => {
    if (onBetSelect && rate) {
      onBetSelect({
        team: team,
        odds: rate.toString(),
        type: type,
        stake: '',
        //sid: sid,
        teams: [team],
        marketName: team,
        gameType: 'meter',
        maxAmount: max || 0,
        minAmount: min || 0,
        size: size || 0, // Size/price value (the number in parentheses)
      });
    }
  };

  return (
    <div>
      <div className='text-secondary mt-1 flex items-center justify-between bg-[#2C3E50D9] p-1'>
        <span className='text-[15px] font-bold'>Meter</span>
      </div>
      <div className='grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-2'>
        <div className=''>
          <div className='grid grid-cols-[1fr_60px_60px] border-b border-b-[#c7c8ca] lg:grid-cols-[1fr_60px_60px_60px]'>
            <div></div>
            <div className='flex items-center justify-center bg-[#72bbef] p-[2px] font-[16px] font-bold text-[#333]'>
              Back
            </div>
            <div className='flex items-center justify-center bg-[#faa9ba] p-[2px] font-[16px] font-bold text-[#333]'>
              Lay
            </div>
            <div className='hidden lg:block'></div>
          </div>
          {leftData.length > 0 ? (
            leftData.map((item) => {
              const hasStatus = item.status && item.status.trim() !== '';

              return (
                <div
                  key={item.id}
                  className='grid grid-cols-[1fr_60px_60px] border-b border-b-[#c7c8ca] hover:bg-[#f7f7f7] lg:grid-cols-[1fr_60px_60px_60px]'
                >
                  <div className='ml-2 text-[13px] font-[400] text-[#333]'>
                    <div>{item.label}</div>
                    {(() => {
                      const { otype, totalBetAmount, totalPrice, teamName } =
                        getBetDetails(item.label);
                      const existingBet =
                        (otype && totalBetAmount) || (totalPrice && teamName);

                      if (existingBet) {
                        const displayValue =
                          otype === 'back' ? totalBetAmount : totalPrice;
                        return (
                          <div className='flex gap-1 text-[11px]'>
                            {displayValue && (
                              <span className='flex items-center gap-0.5 text-red-500'>
                                <FaArrowRight />
                                {displayValue}
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {hasStatus ? (
                    <div className='col-span-2 flex min-h-[30px] items-center justify-center bg-[#4b4b4b] lg:col-span-3'>
                      <span className='text-[14px] font-bold tracking-wide text-red-600 lg:text-[16px]'>
                        {item.status}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`flex min-h-[30px] flex-col items-center justify-center bg-[#72bbef] ${item.no.rate ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                        onClick={() =>
                          item.no.rate &&
                          handleOddsClick(
                            item.label,
                            item.no.rate,
                            'back',
                            item.sid,
                            item.min,
                            item.max,
                            item.no.size
                          )
                        }
                      >
                        {item.no.rate ? (
                          <>
                            <span className='text-[16px] font-bold'>
                              {item.no.rate}
                            </span>
                            <span className='text-[12px]'>{item.no.size}</span>
                          </>
                        ) : (
                          <span className='text-[16px] font-bold'>-</span>
                        )}
                      </div>

                      <div
                        className={`flex min-h-[30px] flex-col items-center justify-center bg-[#faa9ba] ${item.yes.rate ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                        onClick={() =>
                          item.yes.rate &&
                          handleOddsClick(
                            item.label,
                            item.yes.rate,
                            'lay',
                            item.sid,
                            item.min,
                            item.max,
                            item.yes.size
                          )
                        }
                      >
                        {item.yes.rate ? (
                          <>
                            <span className='text-[16px] font-bold'>
                              {item.yes.rate}
                            </span>
                            <span className='text-[12px]'>{item.yes.size}</span>
                          </>
                        ) : (
                          <span className='text-[16px] font-bold'>-</span>
                        )}
                      </div>

                      <div className='hidden flex-col items-center justify-center lg:flex'>
                        <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                          Min:{item.min}
                        </span>
                        <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                          Max:{item.max}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className='py-4 text-center text-gray-500'>
              No data available
            </div>
          )}
        </div>
        <div className=''>
          <div className='grid grid-cols-[1fr_60px_60px] border-b border-b-[#c7c8ca] lg:grid-cols-[1fr_60px_60px_60px]'>
            <div></div>
            <div className='hidden items-center justify-center bg-[#72bbef] p-[2px] font-[16px] font-bold text-[#333] lg:flex'>
              Back
            </div>
            <div className='hidden items-center justify-center bg-[#faa9ba] p-[2px] font-[16px] font-bold text-[#333] lg:flex'>
              Lay
            </div>
            <div></div>
          </div>
          {rightData.length > 0 ? (
            rightData.map((item) => {
              const hasStatus = item.status && item.status.trim() !== '';

              return (
                <div
                  key={item.id}
                  className='grid grid-cols-[1fr_60px_60px] border-b border-b-[#c7c8ca] hover:bg-[#f7f7f7] lg:grid-cols-[1fr_60px_60px_60px]'
                >
                  <div className='ml-2 text-[13px] font-[400] text-[#333]'>
                    <div>{item.label}</div>
                    {(() => {
                      const { otype, totalBetAmount, totalPrice, teamName } =
                        getBetDetails(item.label);
                      const existingBet =
                        (otype && totalBetAmount) || (totalPrice && teamName);

                      if (existingBet) {
                        const displayValue =
                          otype === 'back' ? totalBetAmount : totalPrice;
                        return (
                          <div className='flex gap-1 text-[11px]'>
                            {displayValue && (
                              <span className='flex items-center gap-0.5 text-red-500'>
                                <FaArrowRight />
                                {displayValue}
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {hasStatus ? (
                    <div className='col-span-2 flex min-h-[30px] items-center justify-center bg-[#4b4b4b] lg:col-span-3'>
                      <span className='text-[14px] font-bold tracking-wide text-red-600 lg:text-[16px]'>
                        {item.status}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`flex min-h-[30px] flex-col items-center justify-center bg-[#72bbef] ${item.no.rate ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                        onClick={() =>
                          item.no.rate &&
                          handleOddsClick(
                            item.label,
                            item.no.rate,
                            'back',
                            item.sid,
                            item.min,
                            item.max,
                            item.no.size
                          )
                        }
                      >
                        {item.no.rate ? (
                          <>
                            <span className='text-[16px] font-bold'>
                              {item.no.rate}
                            </span>
                            <span className='text-[12px]'>{item.no.size}</span>
                          </>
                        ) : (
                          <span className='text-[16px] font-bold'>-</span>
                        )}
                      </div>

                      <div
                        className={`flex min-h-[30px] flex-col items-center justify-center bg-[#faa9ba] ${item.yes.rate ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                        onClick={() =>
                          item.yes.rate &&
                          handleOddsClick(
                            item.label,
                            item.yes.rate,
                            'lay',
                            item.sid,
                            item.min,
                            item.max,
                            item.yes.size
                          )
                        }
                      >
                        {item.yes.rate ? (
                          <>
                            <span className='text-[16px] font-bold'>
                              {item.yes.rate}
                            </span>
                            <span className='text-[12px]'>{item.yes.size}</span>
                          </>
                        ) : (
                          <span className='text-[16px] font-bold'>-</span>
                        )}
                      </div>

                      <div className='hidden flex-col items-center justify-center lg:flex'>
                        <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                          Min:{item.min}
                        </span>
                        <span className='text-[10px] leading-4 font-bold text-[#097c93]'>
                          Max:{item.max}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Meter;
