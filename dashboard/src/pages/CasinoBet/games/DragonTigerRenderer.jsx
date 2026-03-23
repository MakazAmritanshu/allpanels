import React, { memo, useMemo } from 'react';
import BetControlPanel from '../components/BetControlPanel';
import { useState } from 'react';
import { getBetDetails } from '../utils/bettingUtils';
import A from '../../../assets/cards/A.jpeg';
import K from '../../../assets/cards/K.jpeg';
import Q from '../../../assets/cards/Q.jpeg';
import J from '../../../assets/cards/J.jpeg';
import ten from '../../../assets/cards/10.jpeg';
import nine from '../../../assets/cards/9.jpeg';
import eight from '../../../assets/cards/8.jpeg';
import seven from '../../../assets/cards/7.jpeg';
import six from '../../../assets/cards/6.jpeg';
import five from '../../../assets/cards/5.jpeg';
import four from '../../../assets/cards/4.jpeg';
import three from '../../../assets/cards/3.jpeg';
import two from '../../../assets/cards/2.jpeg';

const cardImageMap = {
  A: A,
  2: two,
  3: three,
  4: four,
  5: five,
  6: six,
  7: seven,
  8: eight,
  9: nine,
  10: ten,
  J: J,
  Q: Q,
  K: K,
};

const PLDisplayNoLay = memo(function PLDisplayNoLay({
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
    <div className='flex gap-2 text-[11px]'>
      {hasPendingBet && isSelected && betDetails?.totalPrice < 0 && (
        <div>
          P:
          <span className='font-bold text-green-600'>
            {Math.abs(betDetails?.totalBetAmount || 0).toFixed(2)}
          </span>
        </div>
      )}

      {!hasPendingBet &&
        Array.isArray(pendingBetAmounts) &&
        pendingBetAmounts.some((bet) => bet.totalPrice < 0) &&
        (() => {
          const guaranteedBet = pendingBetAmounts?.find(
            (bet) => bet.totalPrice < 0
          );
          return (
            <div>
              P:
              <span className='font-bold text-green-600'>
                {Math.abs(guaranteedBet?.totalPrice || 0).toFixed(2)}
              </span>
            </div>
          );
        })()}

      {hasPendingBet &&
        isSelected &&
        !(betDetails?.totalPrice < 0) &&
        (() => {
          const currentPL = betDetails?.totalBetAmount || 0;
          return (
            <div>
              {currentPL > 0 ? 'P:' : 'L:'}
              <span
                className={`font-bold ${currentPL > 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {Math.abs(currentPL).toFixed(2)}
              </span>
            </div>
          );
        })()}

      {!hasPendingBet &&
        subTypeMatch &&
        !(pendingBetAmounts?.[0]?.totalPrice < 0) &&
        pendingBetAmounts?.[0]?.totalPrice && (
          <div>
            L:
            <span className='font-bold text-red-600'>
              {Math.abs(pendingBetAmounts[0].totalPrice).toFixed(2)}
            </span>
          </div>
        )}

      {isCurrentlySelected && betControl && amount > 0 && (
        <div>
          P:
          <span className='font-bold text-green-600'>
            {Math.abs(amount * (betOdds - 1)).toFixed(2)}
          </span>
        </div>
      )}

      {!isCurrentlySelected && subTypeMatch && betControl && amount > 0 && (
        <div>
          L:
          <span className='font-bold text-red-600'>
            {Math.abs(amount).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
});

const groupDragonTigerData = (sub) => {
  if (!Array.isArray(sub)) return {};

  return {
    winner: sub.filter((item) => [1, 2, 3].includes(item.sid)),
    dragonOddEven: sub.filter((item) => [5, 6].includes(item.sid)),
    tigerOddEven: sub.filter((item) => [22, 23].includes(item.sid)),
    dragonColor: sub.filter((item) => [7, 8].includes(item.sid)),
    tigerColor: sub.filter((item) => [24, 25].includes(item.sid)),
    dragonCards: sub.filter((item) => item.sid >= 9 && item.sid <= 21),
    tigerCards: sub.filter((item) => item.sid >= 26 && item.sid <= 38),
  };
};

const DRAGON_TIGER_SECTIONS = [
  { key: 'winner', title: 'WINNER', type: 'winner' },
  { key: 'dragonOddEven', title: 'DRAGON ODD/EVEN', type: 'oddeven' },
  { key: 'tigerOddEven', title: 'TIGER ODD/EVEN', type: 'oddeven' },
  { key: 'dragonColor', title: 'DRAGON CARD COLOR', type: 'color' },
  { key: 'tigerColor', title: 'TIGER CARD COLOR', type: 'color' },
  { key: 'dragonCards', title: 'DRAGON CARD', type: 'card' },
  { key: 'tigerCards', title: 'TIGER CARD', type: 'card' },
];

const getCardValue = (nat) => {
  const match = nat.match(/(Dragon|Tiger) Card (.+)/i);
  return match ? match[2] : nat;
};

const isRedColor = (nat) => {
  return nat.toLowerCase().includes('red');
};

const PlayingCard = memo(function PlayingCard({ value }) {
  console.log('Card value:', value);
  return (
    <div className='flex w-[30px] items-center justify-center overflow-hidden rounded border border-gray-300 bg-white shadow-sm'>
      <img
        src={cardImageMap[value]}
        alt={`Card ${value}`}
        className='h-full w-full object-cover'
      />
    </div>
  );
});

const TableRow = memo(function TableRow({
  item,
  displayContent,
  betControl,
  sectionKey,
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
  isSuspended,
  selectedSection,
  setSelectedSection,
}) {
  const betDetails = getBetDetails(pendingBetAmounts, item.nat, item.sid);
  const subTypeMatch =
    selectedTeamSubtype === item.subtype && selectedSection === sectionKey;
  const hasPendingBet = betDetails !== null;
  const isCurrentlySelected = betControl?.sid === item.sid;
  const isSelected = isCurrentlySelected || hasPendingBet;
  const amount = betAmount || 0;

  return (
    <>
      <div
        className={`flex items-center border-b border-gray-300 bg-white ${
          isCurrentlySelected ? 'bg-blue-50' : ''
        }`}
      >
        {/* Left side - Display content */}
        <div className='flex flex-1 items-center gap-2 px-1.5 py-[3px]'>
          {displayContent}
          <PLDisplayNoLay
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
        </div>

        <div
          className={`flex min-w-[100px] cursor-pointer flex-col items-center justify-center px-4 py-2 ${
            isCurrentlySelected ? 'bg-[#1a8ee1] text-white' : 'bg-[#72bbef]'
          }`}
          onClick={() => {
            if (item.b > 0 && !isSuspended) {
              setBetControl({
                ...item,
                type: 'back',
                odds: item.b,
              });
              setSelectedTeamSubtype(item.subtype);
              setSelectedSection(sectionKey);
              setValue(item.b, item.nat, 'back');
            }
          }}
        >
          <span className='text-[14px] font-bold'>{item.b}</span>
          <span className='text-[11px]'>{item.bs || item.max}</span>
        </div>
        <div className='min-w-[100px]'></div>
      </div>

      {/* Bet Control Panel */}
      {isCurrentlySelected && (
        <BetControlPanel
          betControl={betControl}
          betOdds={betOdds}
          setBetOdds={setBetOdds}
          betAmount={betAmount}
          updateAmount={updateAmount}
          loading={loading}
          onCancel={() => resetBettingState()}
          onPlaceBet={placeBet}
          isVisible={!hasPendingBetForControl && !isSuspended}
        />
      )}
    </>
  );
});

const BettingSection = memo(function BettingSection({
  title,
  items,
  type,
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
  selectedSection,
  setSelectedSection,
}) {
  if (!items || items.length === 0) return null;

  const minMax = `${items[0]?.min || 100} - ${items[0]?.max || 100000}`;
  const isSuspended = items[0]?.gstatus === 'SUSPENDED';

  // Get display content based on section type
  const getDisplayContent = (item) => {
    switch (type) {
      case 'color': {
        const isRed = isRedColor(item.nat);
        return (
          <div className='flex items-center gap-1'>
            <span className='text-[13px] font-bold uppercase'>
              {isRed ? 'RED' : 'BLACK'}
            </span>
            {isRed ? (
              <span className='text-red-600'>♥ ♦</span>
            ) : (
              <span className='text-black'>♠ ♣</span>
            )}
          </div>
        );
      }

      case 'card': {
        const cardValue = getCardValue(item.nat);
        return <PlayingCard value={cardValue} />;
      }

      case 'oddeven': {
        const oddEvenText = item.nat.toUpperCase();
        return (
          <span className='text-[13px] font-bold uppercase'>{oddEvenText}</span>
        );
      }

      case 'winner':
      default:
        return (
          <span className='text-[13px] font-bold uppercase'>{item.nat}</span>
        );
    }
  };

  return (
    <div className='mb-[2px]'>
      {/* Section Header */}
      <div className='flex items-center justify-between bg-gradient-to-t from-[#243A48] to-[#2E4B5E] p-2 text-[12px] font-bold text-white'>
        <div className='uppercase'>{title}</div>
        <div>Min/Max: {minMax}</div>
      </div>

      {/* Section Content */}
      <div className='relative'>
        {items.map((item) => (
          <TableRow
            key={item.sid}
            item={item}
            sectionKey={title}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            displayContent={getDisplayContent(item)}
            betControl={betControl}
            setBetControl={setBetControl}
            setValue={setValue}
            setSelectedTeamSubtype={setSelectedTeamSubtype}
            betAmount={betAmount}
            betOdds={betOdds}
            setBetOdds={setBetOdds}
            updateAmount={updateAmount}
            placeBet={placeBet}
            loading={loading}
            pendingBetAmounts={pendingBetAmounts}
            selectedTeamSubtype={selectedTeamSubtype}
            resetBettingState={resetBettingState}
            hasPendingBetForControl={hasPendingBetForControl}
            isSuspended={isSuspended}
          />
        ))}

        {isSuspended && (
          <div className='absolute top-1/2 left-1/2 z-1 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-br-sm rounded-bl-sm border border-[#ca1010] bg-white text-2xl font-bold text-[#ca1010] opacity-50'>
            SUSPENDED
          </div>
        )}
      </div>
    </div>
  );
});

const DragonTigerRenderer = memo(function DragonTigerRenderer({
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
  const [selectedSection, setSelectedSection] = useState(null);
  const sections = useMemo(
    () => groupDragonTigerData(bettingData?.sub),
    [bettingData?.sub]
  );

  return (
    <>
      {DRAGON_TIGER_SECTIONS.map((section) => (
        <BettingSection
          key={section.key}
          title={section.title}
          items={sections[section.key]}
          type={section.type}
          betControl={betControl}
          setBetControl={setBetControl}
          setValue={setValue}
          setSelectedTeamSubtype={setSelectedTeamSubtype}
          betAmount={betAmount}
          betOdds={betOdds}
          setBetOdds={setBetOdds}
          updateAmount={updateAmount}
          placeBet={placeBet}
          loading={loading}
          pendingBetAmounts={pendingBetAmounts}
          selectedTeamSubtype={selectedTeamSubtype}
          resetBettingState={resetBettingState}
          hasPendingBetForControl={hasPendingBetForControl}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />
      ))}
    </>
  );
});

export default DragonTigerRenderer;
