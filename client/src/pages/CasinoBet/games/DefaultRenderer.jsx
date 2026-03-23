import React, { memo } from 'react';
import BetControlPanel from '../components/BetControlPanel';
import { TEEN20_SIDE_BETS } from '../constants';
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
  7: A,
  8: two,
  9: three,
  10: four,
  11: five,
  12: six,
  13: seven,
  14: eight,
  15: nine,
  16: ten,
  17: J,
  18: Q,
  19: K,
};

const GAME_RENDERER_CONFIG = {
  // Games with Lay (Back + Lay buttons)
  poison20: { withLay: true },
  joker20: { withLay: true },
  poison: { withLay: true },
  teen62: { withLay: true },
  teen41: { withLay: true },
  teen42: { withLay: true },
  teen33: { withLay: true },
  teen32: { withLay: true },
  teen: { withLay: true },
  poker: { withLay: true },
  teen6: { withLay: true },
  patti2: { withLay: true },
  teen3: { withLay: true },
  card32eu: { withLay: true },
  card32: { withLay: true },

  // Games without Lay (Card style, back only)
  teen20: { withLay: false, hasSideBets: true },
  teen9: { withLay: false },
  teen20c: { withLay: false },
  teen20b: { withLay: false },
  lucky7: { withLay: false },
};

const groupLucky7Data = (sub) => {
  if (!Array.isArray(sub)) return {};

  return {
    winner: sub.filter((item) => [1, 2].includes(item.sid)),
    oddEven: sub.filter((item) => [3, 4].includes(item.sid)),
    cardColor: sub.filter((item) => [5, 6].includes(item.sid)),
    cardSuit: sub.filter((item) => [20, 21, 22, 23].includes(item.sid)),
    luckyCard: sub.filter((item) => item.sid >= 7 && item.sid <= 19),
  };
};
/* Helper to check if game should use lay renderer */
const shouldUseLayRenderer = (gameid, bettingData) => {
  if (gameid && GAME_RENDERER_CONFIG[gameid]) {
    return GAME_RENDERER_CONFIG[gameid].withLay;
  }
  if (bettingData?.sub) {
    return bettingData.sub.some((item) => item.l > 0 || item.ls);
  }
  return false;
};

/* Helper to check if game has side bets */
const hasSideBets = (gameid) => {
  return gameid && GAME_RENDERER_CONFIG[gameid]?.hasSideBets === true;
};

/*  PLDisplay - Unified Profit/Loss display component */
export const PLDisplay = memo(function PLDisplay({
  hasPendingBet,
  isSelected,
  pendingBetAmounts,
  isCurrentlySelected,
  betControl,
  amount,
  betOdds,
  subTypeMatch,
  hasLay = false,
}) {
  const getPLInfo = () => {
    // Guaranteed profit - selected team
    if (hasPendingBet && isSelected && pendingBetAmounts?.[0]?.totalPrice < 0) {
      const bet = pendingBetAmounts[0];
      const value =
        bet?.otype === 'lay'
          ? Math.abs(bet?.totalPrice || 0)
          : Math.abs(bet?.totalBetAmount || 0);
      return { type: 'P', value, color: 'green' };
    }

    if (
      !hasPendingBet &&
      pendingBetAmounts?.some((bet) => bet.totalPrice < 0)
    ) {
      const bet = pendingBetAmounts.find((b) => b.totalPrice < 0);
      const value =
        bet?.otype === 'lay'
          ? Math.abs(bet?.totalBetAmount || 0)
          : Math.abs(bet?.totalPrice || 0);
      return { type: 'P', value, color: 'green' };
    }

    // Selected team with pending bet
    if (
      hasPendingBet &&
      isSelected &&
      !(pendingBetAmounts?.[0]?.totalPrice < 0)
    ) {
      const bet = pendingBetAmounts[0];
      const isLay = bet?.otype === 'lay';

      if (hasLay) {
        const value = isLay
          ? bet?.totalPrice
          : Math.abs(bet?.totalBetAmount || 0);
        return {
          type: isLay || bet?.totalBetAmount < 0 ? 'L' : 'P',
          value: Math.abs(value),
          color: isLay || bet?.totalBetAmount < 0 ? 'red' : 'green',
        };
      } else {
        const value = bet?.totalBetAmount || 0;
        return {
          type: value > 0 ? 'P' : 'L',
          value: Math.abs(value),
          color: value > 0 ? 'green' : 'red',
        };
      }
    }

    // Non-selected team with matching subtype
    if (
      !hasPendingBet &&
      subTypeMatch &&
      !(pendingBetAmounts?.[0]?.totalPrice < 0)
    ) {
      const bet = pendingBetAmounts?.[0];
      if (bet) {
        const isLay = bet?.otype === 'lay';
        if (hasLay) {
          const value = isLay
            ? Math.abs(bet?.totalBetAmount || 0)
            : bet?.totalPrice;
          return {
            type: isLay ? 'P' : 'L',
            value: Math.abs(value),
            color: isLay ? 'green' : 'red',
          };
        } else {
          return {
            type: 'L',
            value: Math.abs(bet?.totalPrice || 0),
            color: 'red',
          };
        }
      }
    }
    return null;
  };

  const getCurrentPL = () => {
    if (!betControl || amount <= 0) {
      return null;
    }
    const potentialPL = amount * (betOdds - 1);
    const isLay = betControl?.type === 'lay';
    if (isCurrentlySelected && potentialPL > 0) {
      return {
        type: hasLay && isLay ? 'L' : 'P',
        value: Math.abs(potentialPL),
        color: hasLay && isLay ? 'red' : 'green',
      };
    }

    if (!isCurrentlySelected && subTypeMatch) {
      if (hasLay) {
        return {
          type: isLay ? 'P' : 'L',
          value: Math.abs(amount),
          color: isLay ? 'green' : 'red',
        };
      } else {
        return { type: 'L', value: Math.abs(amount), color: 'red' };
      }
    }
    return null;
  };
  const plInfo = getPLInfo();
  const currentPL = getCurrentPL();
  return (
    <div className='flex gap-2'>
      {plInfo && (
        <div>
          {plInfo.type}:
          <span
            className={`font-bold ${
              plInfo.color === 'green' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {' '}
            {plInfo.value.toFixed(2)}
          </span>
        </div>
      )}
      {currentPL && (
        <div>
          {currentPL.type}:
          <span
            className={`font-bold ${
              currentPL.color === 'green' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {' '}
            {currentPL.value.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
});

/* SuspendedOverlay - Shows suspended status overlay */
export const SuspendedOverlay = memo(function SuspendedOverlay({ status }) {
  if (status !== 'SUSPENDED') return null;
  return (
    <div className='absolute top-1/2 left-1/2 z-1 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-br-sm rounded-bl-sm border border-[#ca1010] bg-white text-2xl font-bold text-[#ca1010] opacity-50'>
      {status}
    </div>
  );
});

/* SectionHeader - Common header for betting sections */
export const SectionHeader = memo(function SectionHeader({
  title,
  minMax,
  showBackLay = false,
}) {
  return (
    <>
      <div className='flex items-center justify-between rounded-tl-sm rounded-tr-sm bg-gradient-to-t from-[#243A48] to-[#2E4B5E] p-1 text-[12px] font-bold text-white'>
        <div className='uppercase'>{title}</div>
        {!showBackLay && <div>min/max: {minMax}</div>}
      </div>
      {showBackLay && (
        <div className='flex w-full border-t border-gray-400 text-center text-black'>
          <div className='w-[60%] px-2 py-1'>
            <span className='inline-block rounded-sm bg-[#bed5d8] p-0.5 px-4 text-[10px] font-semibold lg:w-80'>
              min/max: {minMax}
            </span>
          </div>
          <div className='w-[20%] items-center justify-items-center bg-[#72bbef] text-[14px] font-bold'>
            Back
          </div>
          <div className='w-[20%] items-center justify-items-center bg-[#f9c9d4] text-[14px] font-bold'>
            Lay
          </div>
        </div>
      )}
    </>
  );
});

// ============================================================================
// BET CARD COMPONENT (Card Style - Without Lay)
// ============================================================================

/**
 * BetCard - Reusable card-style bet button (used in WithoutLay games)
 * Can be used independently in any custom renderer
 */
export const BetCard = memo(function BetCard({
  player,
  betControl,
  setBetControl,
  setValue,
  setSelectedTeamSubtype,
  betAmount,
  betOdds,
  pendingBetAmounts,
  selectedTeamSubtype,
  showPL = true,
  width = 'w-[150px]',
}) {
  const betDetails = getBetDetails(pendingBetAmounts, player.nat, player.sid);
  const subTypeMatch = selectedTeamSubtype === player.subtype;
  const hasPendingBet = betDetails !== null;
  const isCurrentlySelected = betControl?.sid === player.sid;
  const isSelected = isCurrentlySelected || hasPendingBet;
  const amount = betAmount || 0;

  const handleClick = () => {
    if (player.b > 0) {
      setBetControl({ ...player, type: 'back', odds: player.b });
      setSelectedTeamSubtype(player.subtype);
      setValue(player.b, player.nat, 'back');
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <div className='py-1 text-[12px] font-bold uppercase'>{player.nat}</div>
      <div
        className={`grid ${width} relative cursor-pointer justify-items-center gap-1 rounded-md py-2 leading-none shadow-[0_2px_7px_1px_#67828be6] ${
          isCurrentlySelected && betControl?.type === 'back'
            ? 'bg-[#1a8ee1] text-white'
            : 'bg-[#72bbef]'
        }`}
        onClick={handleClick}
      >
        {cardImageMap[player.sid] && (
          <img
            src={cardImageMap[player.sid]}
            alt={cardImageMap[player.sid]}
            className='absolute top-1/2 left-2 h-8 w-6 -translate-y-1/2 object-contain'
          />
        )}
        <span className='text-[16px] font-bold'>{player.b}</span>
        <span className='text-[11px] font-normal'>{player.bs}</span>
      </div>
      {showPL && (
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
  );
});

// ============================================================================
// BET ROW COMPONENT (Row Style - With Lay)
// ============================================================================

/*
 * BetRow - Reusable row-style bet with Back/Lay buttons
 * Can be used independently in any custom renderer
 */
export const BetRow = memo(function BetRow({
  player,
  betControl,
  setBetControl,
  setValue,
  setSelectedTeamSubtype,
  betAmount,
  betOdds,
  pendingBetAmounts,
  selectedTeamSubtype,
  showLay = true,
}) {
  const betDetails = getBetDetails(pendingBetAmounts, player.nat, player.sid);
  const subTypeMatch = selectedTeamSubtype === player.subtype;
  const hasPendingBet = betDetails !== null;
  const isCurrentlySelected = betControl?.sid === player.sid;
  const isSelected = isCurrentlySelected || hasPendingBet;
  const amount = betAmount || 0;

  const handleBetClick = (type, odds) => {
    if (odds > 0) {
      setBetControl({ ...player, type, odds });
      setSelectedTeamSubtype(player.subtype);
      setValue(odds, player.nat, type);
    }
  };

  return (
    <tr className='border-t border-gray-400 text-black'>
      {/* Player name + P/L */}
      <td className='w-[60%] pl-2 text-[12px] font-bold uppercase'>
        {player.nat}
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
          hasLay={true}
        />
      </td>

      {/* Back button */}
      <td
        className={`w-[20%] cursor-pointer py-1 text-center text-[14px] font-bold ${
          isCurrentlySelected && betControl?.type === 'back'
            ? 'bg-[#1a8ee1] text-white shadow-[inset_0_1px_3px_#000000a8]'
            : 'bg-[#72bbef]'
        }`}
        onClick={() => handleBetClick('back', player.b)}
      >
        <span className='block text-[12px] font-bold'>{player.b}</span>
        <span className='block text-[11px] font-normal'>{player.bs}</span>
      </td>

      {/* Lay button */}
      {showLay ? (
        <td
          className={`w-[20%] cursor-pointer py-1 text-center text-[14px] font-bold ${
            isCurrentlySelected && betControl?.type === 'lay'
              ? 'bg-[#f4496d] text-white shadow-[inset_0_1px_3px_#000000a8]'
              : 'bg-[#f9c9d4]'
          }`}
          onClick={() => handleBetClick('lay', player.l)}
        >
          <span className='block text-[12px] font-bold'>{player.l}</span>
          <span className='block text-[11px] font-normal'>{player.ls}</span>
        </td>
      ) : (
        <td className='w-[20%]'></td>
      )}
    </tr>
  );
});

// ============================================================================
// SECTION COMPONENTS (Higher Level)
// ============================================================================

/*
 * BetSection - A complete betting section with header, cards/rows, and suspended overlay
 * Use this to quickly build any game layout
 */
const getGridColsClass = (cols) => {
  if (cols === 1) return 'grid-cols-1';
  if (cols === 2) return 'grid-cols-2';
  if (cols === 3) return 'grid-cols-3';
  if (cols === 4) return 'grid-cols-4';
  return 'grid-cols-2';
};

const getColSpanClass = (cols) => {
  if (cols === 1) return 'col-span-1';
  if (cols === 2) return 'col-span-2';
  if (cols === 3) return 'col-span-3';
  if (cols === 4) return 'col-span-4';
  return 'col-span-2';
};

export const BetSection = memo(function BetSection({
  title,
  minMax,
  players,
  gstatus,
  withLay = false,
  showLay = true,
  showBackLayHeader,
  columns = 2,
  children,
  ...betProps
}) {
  const isSelectionInThisSection =
    !!betProps.betControl &&
    players.some((p) => p.sid === betProps.betControl.sid);

  const hasPendingInThisSection =
    Array.isArray(betProps.pendingBetAmounts) &&
    players.some((p) =>
      getBetDetails(betProps.pendingBetAmounts, p.nat, p.sid)
    );

  const showPLInThisSection =
    isSelectionInThisSection || hasPendingInThisSection;

  return (
    <div className='mb-[2px]'>
      {/* <SectionHeader title={title} minMax={minMax} showBackLay={withLay && showLay} /> */}
      <SectionHeader
        title={title}
        minMax={minMax}
        showBackLay={
          showBackLayHeader !== undefined
            ? showBackLayHeader
            : withLay && showLay
        }
      />
      <div className='relative'>
        {withLay ? (
          <>
            <table className='table w-full rounded-br-md rounded-bl-md border border-gray-400'>
              <tbody>
                {players.map((player) => (
                  <BetRow
                    key={player.sid}
                    player={player}
                    gstatus={gstatus}
                    showLay={showLay}
                    {...betProps}
                  />
                ))}
              </tbody>
            </table>
            {betProps.betControl &&
              players.some((p) => p.sid === betProps.betControl.sid) && (
                <BetControlPanel
                  betControl={betProps.betControl}
                  betOdds={betProps.betOdds}
                  setBetOdds={betProps.setBetOdds}
                  betAmount={betProps.betAmount}
                  updateAmount={betProps.updateAmount}
                  loading={betProps.loading}
                  onCancel={betProps.resetBettingState}
                  onPlaceBet={betProps.placeBet}
                  isVisible={
                    !betProps.hasPendingBetForControl && gstatus !== 'SUSPENDED'
                  }
                />
              )}
          </>
        ) : (
          <div
            className={`grid ${getGridColsClass(columns)} rounded-br-sm rounded-bl-sm bg-gradient-to-r from-[rgb(151,198,240)] via-[rgb(138,189,216/0.6)] to-[rgb(146,198,246)] pb-3`}
          >
            {players.map((player, index) => {
              const selectedIndex = players.findIndex(
                (p) => p.sid === betProps.betControl?.sid
              );

              const selectedRow =
                selectedIndex !== -1 ? Math.floor(selectedIndex / columns) : -1;
              const currentRow = Math.floor(index / columns);
              const isRowEnd = (index + 1) % columns === 0;
              const isLastItem = index === players.length - 1;

              return (
                <React.Fragment key={player.sid}>
                  <BetCard
                    player={player}
                    showPL={showPLInThisSection}
                    {...betProps}
                  />

                  {/* ✅ Show panel after selected row */}
                  {(isRowEnd || isLastItem) &&
                    currentRow === selectedRow &&
                    betProps.betControl && (
                      <div className={getColSpanClass(columns)}>
                        <BetControlPanel
                          betControl={betProps.betControl}
                          betOdds={betProps.betOdds}
                          setBetOdds={betProps.setBetOdds}
                          betAmount={betProps.betAmount}
                          updateAmount={betProps.updateAmount}
                          loading={betProps.loading}
                          onCancel={betProps.resetBettingState}
                          onPlaceBet={betProps.placeBet}
                          isVisible={
                            !betProps.hasPendingBetForControl &&
                            gstatus !== 'SUSPENDED'
                          }
                        />
                      </div>
                    )}
                </React.Fragment>
              );
            })}
          </div>
        )}
        <SuspendedOverlay status={gstatus} />
        {children}
      </div>
    </div>
  );
});

// ============================================================================
// WITH LAY RENDERER
// ============================================================================

/**
 * WithLayRenderer - Renderer for games with Back + Lay options
 */
export const WithLayRenderer = memo(function WithLayRenderer({
  displayData,
  ...betProps
}) {
  return (
    <>
      {Object.entries(displayData).map(([nat, team], index) => {
        if (!team || team.length === 0) return null;

        const sectionMinMax = `${team[0].min} - ${team[0].max}`;
        const sectionStatus = team[0].gstatus;

        return (
          <BetSection
            key={`${nat}-${index}`}
            title={nat}
            minMax={sectionMinMax}
            players={team}
            gstatus={sectionStatus}
            withLay={true}
            {...betProps}
          />
        );
      })}
    </>
  );
});

// ============================================================================
// WITHOUT LAY RENDERER
// ============================================================================

/**
 * WithoutLayRenderer - Renderer for games with only Back option (card style)
 */
export const WithoutLayRenderer = memo(function WithoutLayRenderer({
  displayData,
  bettingData,
  gameid,
  ...betProps
}) {
  if (gameid === 'lucky7' || gameid === 'lucky7eu2') {
    const groupedData = groupLucky7Data(bettingData.sub);

    const Lucky7Section = [
      { key: 'winner', title: 'WINNER' },
      { key: 'oddEven', title: 'LUCKY ODD/EVEN' },
      { key: 'cardColor', title: 'LUCKY COLOR' },
      { key: 'cardSuit', title: 'LUCKY CARD SUIT' },
      { key: 'luckyCard', title: 'LUCKY CARD' },
    ];

    return (
      <>
        {Lucky7Section.map((section, index) => {
          const players = groupedData[section.key];
          if (!players || players.length === 0) return null;

          const sectionMinMax = `${players[0].min} - ${players[0].max}`;
          const sectionStatus = players[0].gstatus;

          return (
            <BetSection
              key={index}
              title={section.title}
              minMax={sectionMinMax}
              players={players}
              gstatus={sectionStatus}
              withLay={false}
              {...betProps}
            />
          );
        })}
      </>
    );
  }
  return (
    <>
      {Object.entries(displayData).map(([nat, team], index) => {
        if (!team || team.length === 0) return null;

        const sectionMinMax = `${team[0].min} - ${team[0].max}`;
        const sectionStatus = team[0].gstatus;

        return (
          <BetSection
            key={index}
            title={nat}
            minMax={sectionMinMax}
            players={team}
            gstatus={sectionStatus}
            withLay={false}
            {...betProps}
          />
        );
      })}

      {hasSideBets(gameid) && (
        <Teen20SideBets
          bettingData={bettingData}
          gstatus={bettingData.sub[0].gstatus}
          {...betProps}
        />
      )}
    </>
  );
});

// ============================================================================
// TEEN20 SIDE BETS
// ============================================================================

/**
 * Teen20SideBets - Side bets section for Teen20 game
 */
const Teen20SideBets = memo(function Teen20SideBets({ gstatus, ...betProps }) {
  return (
    <>
      {TEEN20_SIDE_BETS.map((section, idx) => (
        <BetSection
          key={idx}
          title={`${section.title} ${section.ratio}`}
          minMax='100 - 100000'
          players={section.players}
          gstatus={gstatus}
          withLay={false}
          {...betProps}
        />
      ))}
    </>
  );
});

// ============================================================================
// DEFAULT RENDERER (MAIN EXPORT)
// ============================================================================

/**
 * DefaultRenderer - Smart renderer that chooses layout based on game config
 *
 * Priority:
 * 1. Check GAME_RENDERER_CONFIG for gameid
 * 2. Fallback to auto-detection from data
 */
const DefaultRenderer = memo(function DefaultRenderer(props) {
  const { gameid, bettingData } = props;
  const withLay = shouldUseLayRenderer(gameid, bettingData);

  if (withLay) {
    return <WithLayRenderer {...props} />;
  }

  return <WithoutLayRenderer {...props} />;
});

export default DefaultRenderer;
