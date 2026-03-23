import React, { memo } from 'react';
import { FaLock } from 'react-icons/fa';
import BetControlPanel from '../components/BetControlPanel';
import { PLDisplay } from './DefaultRenderer';
import { getBetDetails } from '../utils/bettingUtils';

// Sids for each betting group - PL only shows within same group
const MAIN_GROUP_NATS = ['Dragon', 'Tiger'];
const PAIR_NAT = 'Pair';
const DRAGON_SIDE_NATS = ['Dragon Even', 'Dragon Odd'];
const TIGER_SIDE_NATS = ['Tiger Red', 'Tiger Black'];

const isBetControlInGroup = (betControl, groupNats) =>
  betControl?.nat && groupNats.includes(betControl.nat);

const SuspendedOverlay = memo(function SuspendedOverlay({
  status,
  className = '',
}) {
  if (status !== 'SUSPENDED') return null;
  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center bg-gray-900/60 ${className}`}
    >
      <FaLock className='text-xl text-white' />
    </div>
  );
});

const MainBetSection = memo(function MainBetSection({
  dragon,
  tiger,
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
  const renderBetButtons = (option, side) => {
    if (!option) return null;

    const isBackSelected =
      betControl?.sid === option.sid && betControl?.type === 'back';
    const isLaySelected =
      betControl?.sid === option.sid && betControl?.type === 'lay';

    const handleClick = (type, odds) => {
      if (odds > 0 && option.gstatus !== 'SUSPENDED') {
        setBetControl({ ...option, type, odds });
        setSelectedTeamSubtype(option.subtype);
        setValue(odds, option.nat, type);
      }
    };

    return (
      <div className={`flex-1 ${side === 'dragon' ? '' : 'flex justify-end'}`}>
        <div className='flex'>
          {/* Back Button */}
          <div
            className={`relative grid w-[66px] cursor-pointer justify-items-center rounded-l-full bg-[#72bbef] p-4 ${
              isBackSelected
                ? 'shadow-[1px_0px_9px_2px_rgba(8,108,184,.76)]'
                : ''
            }`}
            onClick={() => handleClick('back', option.b)}
          >
            <div className='text-sm font-bold'>{option.b}</div>
            <div className='text-xs'>{option.bs}</div>
            <SuspendedOverlay
              status={option.gstatus}
              className='rounded-l-full'
            />
          </div>

          {/* Lay Button */}
          <div
            className={`relative grid w-[66px] cursor-pointer justify-items-center rounded-r-full bg-[#f9c9d4] p-4 ${
              isLaySelected
                ? 'shadow-[1px_0px_9px_2px_rgba(255,70,142,0.75)]'
                : ''
            }`}
            onClick={() => handleClick('lay', option.l)}
          >
            <div className='text-sm font-bold'>{option.l}</div>
            <div className='text-xs'>{option.ls}</div>
            <SuspendedOverlay
              status={option.gstatus}
              className='rounded-r-full'
            />
          </div>
        </div>
      </div>
    );
  };

  const dragonBetDetails = getBetDetails(
    pendingBetAmounts,
    dragon?.nat,
    dragon?.sid
  );
  const tigerBetDetails = getBetDetails(
    pendingBetAmounts,
    tiger?.nat,
    tiger?.sid
  );
  const dragonSubTypeMatch = selectedTeamSubtype === dragon?.subtype;
  const tigerSubTypeMatch = selectedTeamSubtype === tiger?.subtype;
  const dragonHasPendingBet = dragonBetDetails !== null;
  const tigerHasPendingBet = tigerBetDetails !== null;
  const dragonIsCurrentlySelected = betControl?.sid === dragon?.sid;
  const tigerIsCurrentlySelected = betControl?.sid === tiger?.sid;
  const dragonIsSelected = dragonIsCurrentlySelected || dragonHasPendingBet;
  const tigerIsSelected = tigerIsCurrentlySelected || tigerHasPendingBet;
  const amount = betAmount || 0;

  const showMainPL =
    dragonHasPendingBet ||
    tigerHasPendingBet ||
    isBetControlInGroup(betControl, MAIN_GROUP_NATS);

  // Opposite bet for L display after bet placed
  const dragonGroupOpposite =
    !dragonHasPendingBet &&
    pendingBetAmounts?.find(
      (b) =>
        MAIN_GROUP_NATS.some(
          (n) => n?.toLowerCase() === b.teamName?.toLowerCase()
        ) && b.teamName?.toLowerCase() !== dragon?.nat?.toLowerCase()
    );
  const tigerGroupOpposite =
    !tigerHasPendingBet &&
    pendingBetAmounts?.find(
      (b) =>
        MAIN_GROUP_NATS.some(
          (n) => n?.toLowerCase() === b.teamName?.toLowerCase()
        ) && b.teamName?.toLowerCase() !== tiger?.nat?.toLowerCase()
    );

  return (
    <div className='p-2'>
      {/* Headers with PLDisplay */}
      <div className='mb-1 flex justify-between px-10'>
        <div className='flex flex-col gap-0.5'>
          <div className='text-sm font-bold text-gray-800'>DRAGON</div>
          {dragon && showMainPL && (
            <PLDisplay
              hasPendingBet={dragonHasPendingBet}
              isSelected={dragonIsSelected}
              betDetails={dragonBetDetails}
              pendingBetAmounts={pendingBetAmounts}
              isCurrentlySelected={dragonIsCurrentlySelected}
              betControl={betControl}
              amount={amount}
              betOdds={betOdds}
              subTypeMatch={dragonSubTypeMatch}
              hasLay={true}
              groupPendingBetDetails={dragonGroupOpposite || null}
            />
          )}
        </div>
        <div className='flex flex-col items-end gap-0.5'>
          <div className='text-sm font-bold text-gray-800'>TIGER</div>
          {tiger && showMainPL && (
            <PLDisplay
              hasPendingBet={tigerHasPendingBet}
              isSelected={tigerIsSelected}
              betDetails={tigerBetDetails}
              pendingBetAmounts={pendingBetAmounts}
              isCurrentlySelected={tigerIsCurrentlySelected}
              betControl={betControl}
              amount={amount}
              betOdds={betOdds}
              subTypeMatch={tigerSubTypeMatch}
              hasLay={true}
              groupPendingBetDetails={tigerGroupOpposite || null}
            />
          )}
        </div>
      </div>

      {/* Bet Buttons */}
      <div
        className='flex justify-between gap-4 rounded-full bg-white/70'
        style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 4px 12px' }}
      >
        {renderBetButtons(dragon, 'dragon')}
        {renderBetButtons(tiger, 'tiger')}
      </div>

      {(betControl?.sid === dragon?.sid || betControl?.sid === tiger?.sid) && (
        <div className='mt-2'>
          <BetControlPanel
            betControl={betControl}
            betOdds={betOdds}
            setBetOdds={setBetOdds}
            betAmount={betAmount}
            updateAmount={updateAmount}
            loading={loading}
            onCancel={resetBettingState}
            onPlaceBet={placeBet}
            isVisible={
              !hasPendingBetForControl && betControl?.gstatus !== 'SUSPENDED'
            }
          />
        </div>
      )}
    </div>
  );
});

const PairBetSection = memo(function PairBetSection({
  option,
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
  if (!option) return null;

  const betDetails = getBetDetails(pendingBetAmounts, option.nat, option.sid);
  const subTypeMatch = selectedTeamSubtype === option.subtype;
  const hasPendingBet = betDetails !== null;
  const isCurrentlySelected = betControl?.sid === option.sid;
  const isSelected = isCurrentlySelected || hasPendingBet;
  const amount = betAmount || 0;

  const showPairPL =
    hasPendingBet || isBetControlInGroup(betControl, [PAIR_NAT]);

  const handleClick = () => {
    if (option.b > 0 && option.gstatus !== 'SUSPENDED') {
      setBetControl({ ...option, type: 'back', odds: option.b });
      setSelectedTeamSubtype(option.subtype);
      setValue(option.b, option.nat, 'back');
    }
  };

  return (
    <div className='bg-[#f1f5f8] p-2'>
      <div
        className={`relative flex items-center justify-between rounded-2xl bg-[#1a5a4a] px-10 py-4 text-[14px] ${isCurrentlySelected ? 'shadow-[1px_0px_9px_2px_rgba(8,108,184,.76)]' : ''}`}
        onClick={handleClick}
      >
        <div className='flex flex-col gap-0.5'>
          <span>PAIR (TIE)</span>
          {showPairPL && (
            <PLDisplay
              hasPendingBet={hasPendingBet}
              isSelected={isSelected}
              betDetails={betDetails}
              pendingBetAmounts={pendingBetAmounts}
              isCurrentlySelected={isCurrentlySelected}
              betControl={betControl}
              amount={amount}
              betOdds={betOdds}
              subTypeMatch={subTypeMatch}
              hasLay={false}
            />
          )}
        </div>
        <span className='text-[16px] font-bold'>{option.b}</span>
        <SuspendedOverlay status={option.gstatus} className='rounded-2xl' />
      </div>

      <div className='mt-1 text-right'>
        Min:{option.min} Max:{option.max}
      </div>

      {isCurrentlySelected && (
        <BetControlPanel
          betControl={betControl}
          betOdds={betOdds}
          setBetOdds={setBetOdds}
          betAmount={betAmount}
          updateAmount={updateAmount}
          loading={loading}
          onCancel={resetBettingState}
          onPlaceBet={placeBet}
          isVisible={!hasPendingBetForControl && option.gstatus !== 'SUSPENDED'}
        />
      )}
    </div>
  );
});

// ============================================================================
// SIDE BET BUTTON (Green rounded rectangle)
// ============================================================================
const SideBetButton = memo(function SideBetButton({
  option,
  label,
  groupNats,
  betControl,
  setBetControl,
  setValue,
  setSelectedTeamSubtype,
  pendingBetAmounts,
  selectedTeamSubtype,
  betAmount,
  betOdds,
  textSize,
  textColor,
}) {
  if (!option) return null;

  const betDetails = getBetDetails(pendingBetAmounts, option.nat, option.sid);
  const subTypeMatch = selectedTeamSubtype === option.subtype;
  const hasPendingBet = betDetails !== null;
  const isCurrentlySelected = betControl?.sid === option.sid;
  const isSelected = isCurrentlySelected || hasPendingBet;
  const amount = betAmount || 0;

  // Bet in same group on another option - for showing L on opposite side after bet placed
  const groupPendingBetDetails =
    !hasPendingBet &&
    pendingBetAmounts?.find(
      (b) =>
        groupNats?.some(
          (n) => n?.toLowerCase() === b.teamName?.toLowerCase()
        ) && b.teamName?.toLowerCase() !== option.nat?.toLowerCase()
    );

  const showSidePL =
    hasPendingBet ||
    isBetControlInGroup(betControl, groupNats || []) ||
    groupPendingBetDetails;

  const handleClick = () => {
    if (option.b > 0 && option.gstatus !== 'SUSPENDED') {
      setBetControl({ ...option, type: 'back', odds: option.b });
      setSelectedTeamSubtype(option.subtype);
      setValue(option.b, option.nat, 'back');
    }
  };

  return (
    <div className='flex flex-1 flex-col items-center'>
      <div className='mb-1 text-sm font-bold'>{option.b}</div>
      <div
        onClick={handleClick}
        className={`relative flex h-14 w-full cursor-pointer items-center justify-center rounded-lg bg-[#1a5a4a] transition-all ${isCurrentlySelected ? 'shadow-[1px_0px_9px_2px_rgba(8,108,184,.76)]' : ''}`}
      >
        <SuspendedOverlay status={option.gstatus} className='rounded-lg' />
        <span className={`${textSize} ${textColor}`}>{label}</span>
      </div>
      {showSidePL && (
        <PLDisplay
          hasPendingBet={hasPendingBet}
          isSelected={isSelected}
          betDetails={betDetails}
          pendingBetAmounts={pendingBetAmounts}
          isCurrentlySelected={isCurrentlySelected}
          betControl={betControl}
          amount={amount}
          betOdds={betOdds}
          subTypeMatch={subTypeMatch}
          hasLay={false}
          groupPendingBetDetails={groupPendingBetDetails || null}
        />
      )}
    </div>
  );
});

// ============================================================================
// SIDE BETS COLUMN
// ============================================================================
const SideBetsColumn = memo(function SideBetsColumn({
  bets,
  labels,
  groupNats,
  betControl,
  textSize,
  textColor = [],
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
  const currentSelected = bets.find((b) => betControl?.sid === b.sid);

  const minMax = bets[0] ? `Min:${bets[0].min} Max:${bets[0].max}` : '';

  return (
    <div className='flex-1'>
      {/* Bet Buttons */}
      <div className='rounded-b bg-[#f1f5f8] px-4 py-1'>
        <div className='flex gap-4'>
          {bets.map((option, index) => (
            <SideBetButton
              key={option.sid}
              option={option}
              label={labels[index] || option.nat}
              groupNats={groupNats}
              betControl={betControl}
              setBetControl={setBetControl}
              setValue={setValue}
              setSelectedTeamSubtype={setSelectedTeamSubtype}
              pendingBetAmounts={pendingBetAmounts}
              selectedTeamSubtype={selectedTeamSubtype}
              betAmount={betAmount}
              betOdds={betOdds}
              textSize={textSize}
              textColor={textColor[index]}
            />
          ))}
        </div>

        <div className='mt-3 text-end'>{minMax}</div>
      </div>
    </div>
  );
});

// ============================================================================
// MAIN DT6 RENDERER
// ============================================================================
const DragonTigerRenderer2 = memo(function DT6Renderer({
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
  if (!bettingData?.sub) return null;

  // Separate data by type
  const dragon = bettingData.sub.find((s) => s.nat === 'Dragon');
  const tiger = bettingData.sub.find((s) => s.nat === 'Tiger');
  const pair = bettingData.sub.find((s) => s.nat === 'Pair');

  // Dragon: Even and Odd
  const dragonEven = bettingData.sub.find((s) => s.nat === 'Dragon Even');
  const dragonOdd = bettingData.sub.find((s) => s.nat === 'Dragon Odd');
  const dragonSideBets = [dragonEven, dragonOdd].filter(Boolean);

  // Tiger: Red and Black
  const tigerRed = bettingData.sub.find((s) => s.nat === 'Tiger Red');
  const tigerBlack = bettingData.sub.find((s) => s.nat === 'Tiger Black');
  const tigerSideBets = [tigerRed, tigerBlack].filter(Boolean);

  const commonProps = {
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
  };

  return (
    <div>
      {/* Main Dragon vs Tiger */}
      <MainBetSection dragon={dragon} tiger={tiger} {...commonProps} />

      {/* Pair/Tie */}
      <PairBetSection option={pair} {...commonProps} />

      {/* Side Bets - Two Columns */}
      <div className='flex bg-gradient-to-b from-[#14805e] to-[#184438] p-2 font-bold'>
        <div className='flex-1 text-center'>DRAGON</div>
        <div className='flex-1 text-center'>TIGER</div>
      </div>
      <div className='my-2 flex gap-4'>
        <SideBetsColumn
          title='DRAGON'
          bets={dragonSideBets}
          labels={['EVEN', 'ODD']}
          groupNats={DRAGON_SIDE_NATS}
          textSize='text-[14px]'
          {...commonProps}
        />
        <SideBetsColumn
          title='TIGER'
          bets={tigerSideBets}
          labels={['♦♥', '♣♠']}
          groupNats={TIGER_SIDE_NATS}
          textSize='text-[25px]'
          textColor={['text-red-500', 'text-black']}
          {...commonProps}
        />
      </div>

      {/* BetControlPanel for Side Bets - shows when any side bet is selected */}
      {(() => {
        const allSideBets = [...dragonSideBets, ...tigerSideBets];
        const selectedSideBet = allSideBets.find(
          (b) => betControl?.sid === b.sid
        );

        if (selectedSideBet) {
          return (
            <div className='mt-2'>
              <BetControlPanel
                betControl={betControl}
                betOdds={betOdds}
                setBetOdds={setBetOdds}
                betAmount={betAmount}
                updateAmount={updateAmount}
                loading={loading}
                onCancel={resetBettingState}
                onPlaceBet={placeBet}
                isVisible={
                  !hasPendingBetForControl &&
                  selectedSideBet.gstatus !== 'SUSPENDED'
                }
              />
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
});

export default DragonTigerRenderer2;
