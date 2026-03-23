import React, { memo } from 'react';
import lucky9 from '../../../assets/lucky9.png';
import BetControlPanel from '../components/BetControlPanel';
import { getBetDetails } from '../utils/bettingUtils';

/**
 * PLDisplayPoker - Renders profit/loss display for Poker20 games
 */
const PLDisplayPoker = memo(function PLDisplayPoker({
  hasPendingBet,
  isSelected,
  betDetails,
  pendingBetAmounts,
  isCurrentlySelected,
  betControl,
  amount,
  betOdds,
  subTypeMatch,
}) {
  return (
    <div className='absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-2 text-[12px]'>
      {/* GUARANTEED PROFIT OVERRIDE - Selected Team */}
      {hasPendingBet && isSelected && betDetails?.totalPrice < 0 && (
        <div>
          {' '}
          P:
          <span className='font-bold text-green-600'>
            {' '}
            {betDetails?.otype === 'lay'
              ? Math.abs(betDetails?.totalPrice || 0).toFixed(2)
              : Math.abs(betDetails?.totalBetAmount || 0).toFixed(2)}
          </span>
        </div>
      )}

      {/* GUARANTEED PROFIT OVERRIDE - Non-Selected Team */}
      {!hasPendingBet &&
        pendingBetAmounts?.length > 0 &&
        pendingBetAmounts.some((bet) => bet.totalPrice < 0) &&
        (() => {
          const guaranteedBet = pendingBetAmounts.find(
            (bet) => bet.totalPrice < 0
          );
          return (
            <div>
              {' '}
              P:
              <span className='font-bold text-green-600'>
                {' '}
                {guaranteedBet?.otype === 'lay'
                  ? Math.abs(guaranteedBet?.totalBetAmount || 0).toFixed(2)
                  : Math.abs(guaranteedBet?.totalPrice || 0).toFixed(2)}
              </span>
            </div>
          );
        })()}

      {/* Original display logic - only when NOT guaranteed profit */}
      {hasPendingBet &&
        isSelected &&
        !(betDetails?.totalPrice < 0) &&
        (() => {
          const currentPL = betDetails?.totalBetAmount || 0;
          if (currentPL > 0) {
            return (
              <div>
                {' '}
                P:
                <span className='font-bold text-green-600'>
                  {' '}
                  {Math.abs(currentPL.toFixed(2))}
                </span>
              </div>
            );
          } else {
            return (
              <div>
                {' '}
                L:
                <span className='font-bold text-red-600'>
                  {' '}
                  {Math.abs(currentPL.toFixed(2))}
                </span>
              </div>
            );
          }
        })()}

      {!hasPendingBet &&
        subTypeMatch &&
        !(pendingBetAmounts?.[0]?.totalPrice < 0) &&
        (() => {
          const currentPL = pendingBetAmounts[0]?.totalPrice || 0;
          if (currentPL) {
            return (
              <div>
                L:
                <span className='font-bold text-red-600'>
                  {' '}
                  {Math.abs(currentPL.toFixed(2))}
                </span>
              </div>
            );
          }
        })()}

      {isCurrentlySelected && betControl && amount > 0 && (
        <div>
          {(() => {
            const potentialPL = amount * (betOdds - 1);
            if (potentialPL > 0) {
              return (
                <div>
                  P:
                  <span className='font-bold text-green-600'>
                    {' '}
                    {Math.abs(potentialPL.toFixed(2))}
                  </span>
                </div>
              );
            }
          })()}
        </div>
      )}

      {!isCurrentlySelected && subTypeMatch && betControl && amount > 0 && (
        <div>
          {(() => {
            const potentialLoss = amount;
            if (potentialLoss > 0) {
              return (
                <div>
                  {' '}
                  L:
                  <span className='font-bold text-red-600'>
                    {' '}
                    {Math.abs(potentialLoss.toFixed(2))}
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
});

/**
 * Poker20Renderer - Renders the betting UI for Poker20 and TeenSin games
 * Features skewed box design with back/lay options
 */
const Poker20Renderer = memo(function Poker20Renderer({
  displayData,
  bettingData,
  betControl,
  setBetControl,
  setValue,
  setSelectedTeamSubtype,
  betAmount,
  betOdds,
  setBetOdds,
  updateAmount,
  placeBet,
  loading,
  pendingBetAmounts,
  selectedTeamSubtype,
  resetBettingState,
  hasPendingBetForControl,
}) {
  return (
    <>
      <div className='my-5 flex flex-1/2'>
        <div className='flex w-full justify-center'>
          <div
            className='w-30 rounded-md py-2 text-center font-medium md:w-50 md:py-4 md:text-[16px] md:font-semibold'
            style={{
              background: 'linear-gradient(#A4DC60 0%, #4F9F21 100%)',
            }}
          >
            PLAYER A
          </div>
        </div>
        <div className='flex w-full justify-center'>
          <div
            className='w-30 rounded-md py-2 text-center font-medium md:w-50 md:py-4 md:text-[16px] md:font-semibold'
            style={{
              background: 'linear-gradient(#A4DC60 0%, #4F9F21 100%)',
            }}
          >
            PLAYER B
          </div>
        </div>
      </div>

      {Object.entries(displayData).map(([nat, items], index) => (
        <div key={`${nat}-${index}`}>
          <div className='boxShadow relative my-4 h-[123px] rounded-xl pt-1 pb-4'>
            {nat === 'lucky9' ? (
              <div className='mx-auto flex max-w-[15%] justify-center'>
                <img src={lucky9} className='w-full' alt='Lucky 9' />
              </div>
            ) : (
              <div
                className='mx-3 flex h-[26px] items-center justify-center rounded-tl-full rounded-br-full text-[12px] font-bold uppercase md:mx-auto md:h-[42px] md:w-[34%] md:text-[16px]'
                style={{
                  boxShadow:
                    '#0006 0 2px 4px,#0000004d 0 7px 13px -3px,#0003 0 -3px inset',
                }}
              >
                {nat}
              </div>
            )}

            <div className='flex'>
              {items.map((p) => {
                const betDetails = getBetDetails(
                  pendingBetAmounts,
                  p.nat,
                  p.sid
                );
                const subTypeMatch = selectedTeamSubtype === p.nat;
                const hasPendingBet = betDetails !== null;
                const isCurrentlySelected = betControl?.sid === p.sid;
                const isSelected = isCurrentlySelected || hasPendingBet;
                const amount = betAmount || 0;

                return (
                  <div
                    key={p.sid}
                    className='relative flex w-full justify-evenly pt-1 text-center text-black'
                  >
                    {p.subtype === 'lucky9' ? (
                      <div className='flex/2 flex w-full'>
                        <div className='flex w-full justify-center'>
                          <div
                            className='w-40 rounded-tl-full rounded-br-full text-[16px] md:w-50'
                            style={{
                              boxShadow:
                                '#0006 0 2px 4px,#0000004d 0 7px 13px -3px,#0003 0 -3px inset',
                            }}
                          >
                            <div
                              className='mx-10 bg-[#72bbef]'
                              style={{ transform: 'skew(-30deg)' }}
                            >
                              <div style={{ transform: 'skew(30deg)' }}>
                                <div
                                  className={`justify-item-center grid gap-1 py-2 leading-none ${
                                    betControl?.sid === p.sid &&
                                    betControl?.type === 'back'
                                      ? 'text-white'
                                      : ''
                                  }`}
                                  onClick={() => {
                                    if (p.b > 0) {
                                      setBetControl({
                                        ...p,
                                        type: 'back',
                                        odds: p.b,
                                      });
                                      setValue(p.b, p.nat, 'back');
                                    }
                                  }}
                                >
                                  <span className='text-[16px] font-bold'>
                                    {p.b}
                                  </span>
                                  <span>{p.bs}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='flex w-full justify-center'>
                          <div
                            className='w-40 rounded-tl-full rounded-br-full text-[16px] md:w-50'
                            style={{
                              boxShadow:
                                '#0006 0 2px 4px,#0000004d 0 7px 13px -3px,#0003 0 -3px inset',
                            }}
                          >
                            <div
                              className='mx-10 bg-[#f9c9d4]'
                              style={{ transform: 'skew(-30deg)' }}
                            >
                              <div style={{ transform: 'skew(30deg)' }}>
                                <div
                                  className={`justify-item-center grid gap-1 py-2 leading-none ${
                                    betControl?.sid === p.sid &&
                                    betControl?.type === 'lay'
                                      ? 'text-white'
                                      : ''
                                  }`}
                                  onClick={() => {
                                    if (p.b > 0) {
                                      setBetControl({
                                        ...p,
                                        type: 'lay',
                                        odds: p.l,
                                      });
                                      setValue(p.l, p.nat, 'lay');
                                    }
                                  }}
                                >
                                  <span className='text-[16px] font-bold'>
                                    {p.l}
                                  </span>
                                  <span>{p.ls}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className='w-40 rounded-tl-full rounded-br-full text-[16px] md:w-50'
                          style={{
                            boxShadow:
                              '#0006 0 2px 4px,#0000004d 0 7px 13px -3px,#0003 0 -3px inset',
                          }}
                        >
                          <div
                            className='mx-10'
                            style={{
                              background:
                                'linear-gradient(#A4DC60 0%, #4F9F21 100%)',
                              transform: 'skew(-30deg)',
                            }}
                          >
                            <div style={{ transform: 'skew(30deg)' }}>
                              <div
                                className={`justify-item-center grid gap-1 py-2 leading-none ${
                                  betControl?.sid === p.sid &&
                                  betControl?.type === 'back'
                                    ? 'text-white'
                                    : ''
                                }`}
                                onClick={() => {
                                  if (p.b > 0) {
                                    setBetControl({
                                      ...p,
                                      type: 'back',
                                      odds: p.b,
                                    });
                                    setSelectedTeamSubtype(p.nat);
                                    setValue(p.b, p.nat, 'back');
                                  }
                                }}
                              >
                                <span className='text-[16px] font-bold'>
                                  {p.b}
                                </span>
                                <span>{p.bs}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <PLDisplayPoker
                          hasPendingBet={hasPendingBet}
                          isSelected={isSelected}
                          betDetails={betDetails}
                          pendingBetAmounts={pendingBetAmounts}
                          isCurrentlySelected={isCurrentlySelected}
                          betControl={betControl}
                          amount={amount}
                          betOdds={betOdds}
                          subTypeMatch={subTypeMatch}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {bettingData.sub[0].gstatus === 'SUSPENDED' && (
              <div className='absolute top-1/2 left-1/2 z-1 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-tl-[60px] rounded-br-[60px] border-2 border-[#ca1010] bg-white text-2xl font-bold text-[#ca1010] opacity-50 md:rounded-tl-[80px] md:rounded-br-[80px]'>
                {bettingData.sub[0].gstatus}
              </div>
            )}
          </div>

          {betControl && items.some((p) => p.sid === betControl.sid) && (
            <BetControlPanel
              betControl={betControl}
              betOdds={betOdds}
              setBetOdds={setBetOdds}
              betAmount={betAmount}
              updateAmount={updateAmount}
              loading={loading}
              onCancel={() => resetBettingState()}
              onPlaceBet={placeBet}
              isVisible={
                !hasPendingBetForControl &&
                bettingData?.sub?.[0]?.gstatus !== 'SUSPENDED'
              }
            />
          )}
        </div>
      ))}
    </>
  );
});

export default Poker20Renderer;
