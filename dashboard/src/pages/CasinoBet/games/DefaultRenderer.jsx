import React, { memo } from 'react';
import BetControlPanel from '../components/BetControlPanel';
import { TEEN20_SIDE_BETS } from '../constants';
import { getBetDetails } from '../utils/bettingUtils';

export const GAME_RENDERER_CONFIG = {
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

  // Games without Lay (Card style, back only)
  teen20: { withLay: false, hasSideBets: true },
  teen9: { withLay: false },
  teen20c: { withLay: false },
  teen20b: { withLay: false },
};

/**
 * Helper to check if game should use lay renderer
 */
export const shouldUseLayRenderer = (gameid, bettingData) => {
  // First check config
  if (gameid && GAME_RENDERER_CONFIG[gameid]) {
    return GAME_RENDERER_CONFIG[gameid].withLay;
  }

  // Fallback: auto-detect from data
  if (bettingData?.sub) {
    return bettingData.sub.some((item) => item.l > 0 || item.ls);
  }

  return false;
};

/**
 * Helper to check if game has side bets
 */
export const hasSideBets = (gameid) => {
  return gameid && GAME_RENDERER_CONFIG[gameid]?.hasSideBets === true;
};

// ============================================================================
// COMMON COMPONENTS (Reusable)
// ============================================================================

/**
 * PLDisplay - Unified Profit/Loss display component
 */
export const PLDisplay = memo(function PLDisplay({
  hasPendingBet,
  isSelected,
  betDetails,
  pendingBetAmounts,
  isCurrentlySelected,
  betControl,
  amount,
  betOdds,
  subTypeMatch,
  hasLay = false,
  playerName = '',
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

    // Guaranteed profit - non-selected team
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

    // Selected team with pending bet (this team has the bet)
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

    // Non-selected team (opposite team) - show loss when there's a bet on other team
    // Check if there are pending bets on OTHER teams (not this one)
    if (
      !hasPendingBet &&
      pendingBetAmounts?.length > 0 &&
      !(pendingBetAmounts?.[0]?.totalPrice < 0)
    ) {
      // Find bet that is NOT on this player
      const otherBet = pendingBetAmounts.find(
        (bet) => bet.teamName?.toLowerCase() !== playerName?.toLowerCase()
      );

      if (otherBet) {
        const isLay = otherBet?.otype === 'lay';
        if (hasLay) {
          const value = isLay
            ? Math.abs(otherBet?.totalBetAmount || 0)
            : otherBet?.totalPrice;
          return {
            type: isLay ? 'P' : 'L',
            value: Math.abs(value),
            color: isLay ? 'green' : 'red',
          };
        } else {
          return {
            type: 'L',
            value: Math.abs(otherBet?.totalPrice || 0),
            color: 'red',
          };
        }
      }
    }

    return null;
  };

  const getCurrentPL = () => {
    if (!betControl || amount <= 0) return null;

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
            className={`font-bold ${plInfo.color === 'green' ? 'text-green-600' : 'text-red-600'}`}
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
            className={`font-bold ${currentPL.color === 'green' ? 'text-green-600' : 'text-red-600'}`}
          >
            {' '}
            {currentPL.value.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
});

/**
 * SuspendedOverlay - Shows suspended status overlay
 */
export const SuspendedOverlay = memo(function SuspendedOverlay({ status }) {
  if (status !== 'SUSPENDED') return null;
  return (
    <div className='absolute top-1/2 left-1/2 z-1 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-br-sm rounded-bl-sm border border-[#ca1010] bg-white text-2xl font-bold text-[#ca1010] opacity-50'>
      {status}
    </div>
  );
});

/**
 * SectionHeader - Common header for betting sections
 */
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
          <div className='flex-3 px-2 py-1'>
            <span className='inline-block rounded-sm bg-[#bed5d8] p-0.5 px-4 text-[10px] font-semibold lg:w-80'>
              min/max: {minMax}
            </span>
          </div>
          <div className='grid flex-1 items-center justify-items-center bg-[#72bbef] text-[14px] font-bold'>
            Back
          </div>
          <div className='grid flex-1 items-center justify-items-center bg-[#f9c9d4] text-[14px] font-bold'>
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
        className={`grid ${width} cursor-pointer justify-items-center gap-1 rounded-md py-2 leading-none shadow-[0_2px_7px_1px_#67828be6] ${
          isCurrentlySelected && betControl?.type === 'back'
            ? 'bg-[#1a8ee1] text-white'
            : 'bg-[#72bbef]'
        }`}
        onClick={handleClick}
      >
        <span className='text-[16px] font-bold'>{player.b}</span>
        <span className='text-[11px] font-normal'>
          {player.bs || player.amount}
        </span>
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
          playerName={player.nat}
        />
      )}
    </div>
  );
});

// ============================================================================
// BET ROW COMPONENT (Row Style - With Lay)
// ============================================================================

/**
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
  setBetOdds,
  updateAmount,
  placeBet,
  loading,
  pendingBetAmounts,
  selectedTeamSubtype,
  resetBettingState,
  hasPendingBetForControl,
  gstatus,
  showBetPanel = true,
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
    <div>
      <div className='flex w-full border-t border-gray-400 text-black'>
        {/* Player name + P/L */}
        <div className='flex-3 px-2 text-[12px] font-bold uppercase'>
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
            playerName={player.nat}
          />
        </div>

        {/* Back button */}
        <div
          className={`grid flex-1 cursor-pointer items-center justify-items-center py-1 text-[14px] font-bold ${
            isCurrentlySelected && betControl?.type === 'back'
              ? 'bg-[#1a8ee1] text-white shadow-[inset_0_1px_3px_#000000a8]'
              : 'bg-[#72bbef]'
          }`}
          onClick={() => handleBetClick('back', player.b)}
        >
          <span className='text-[12px] font-bold'>{player.b}</span>
          <span className='text-[11px] font-normal'>{player.bs}</span>
        </div>

        {/* Lay button */}
        <div
          className={`grid flex-1 cursor-pointer items-center justify-items-center py-1 text-[14px] font-bold ${
            isCurrentlySelected && betControl?.type === 'lay'
              ? 'bg-[#f4496d] text-white shadow-[inset_0_1px_3px_#000000a8]'
              : 'bg-[#f9c9d4]'
          }`}
          onClick={() => handleBetClick('lay', player.l)}
        >
          <span className='text-[12px] font-bold'>{player.l}</span>
          <span className='text-[11px] font-normal'>{player.ls}</span>
        </div>
      </div>

      {/* Bet control panel */}
      {showBetPanel && isCurrentlySelected && (
        <BetControlPanel
          betControl={betControl}
          betOdds={betOdds}
          setBetOdds={setBetOdds}
          betAmount={betAmount}
          updateAmount={updateAmount}
          loading={loading}
          onCancel={resetBettingState}
          onPlaceBet={placeBet}
          isVisible={!hasPendingBetForControl && gstatus !== 'SUSPENDED'}
        />
      )}
    </div>
  );
});

// ============================================================================
// SECTION COMPONENTS (Higher Level)
// ============================================================================

/**
 * BetSection - A complete betting section with header, cards/rows, and suspended overlay
 * Use this to quickly build any game layout
 */
export const BetSection = memo(function BetSection({
  title,
  minMax,
  players,
  gstatus,
  withLay = false,
  columns = 2,
  children,
  ...betProps
}) {
  return (
    <div className='mb-[2px]'>
      <SectionHeader title={title} minMax={minMax} showBackLay={withLay} />
      <div className='relative'>
        {withLay ? (
          <div className='rounded-br-md rounded-bl-md border border-gray-400'>
            {players.map((player) => (
              <BetRow
                key={player.sid}
                player={player}
                gstatus={gstatus}
                {...betProps}
              />
            ))}
          </div>
        ) : (
          <div
            className={`grid grid-cols-${columns} rounded-br-sm rounded-bl-sm bg-gradient-to-r from-[rgb(151,198,240)] via-[rgb(138,189,216/0.6)] to-[rgb(146,198,246)] pb-3`}
          >
            {players.map((player) => (
              <BetCard key={player.sid} player={player} {...betProps} />
            ))}
          </div>
        )}
        <SuspendedOverlay status={gstatus} />
        {children}
      </div>

      {/* Show bet panel for card style (outside grid) */}
      {!withLay &&
        betProps.betControl &&
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
  bettingData,
  ...betProps
}) {
  const minMax = `${bettingData.sub[0].min} - ${bettingData.sub[0].max}`;
  const gstatus = bettingData.sub[0].gstatus;

  return (
    <>
      {Object.entries(displayData).map(([nat, team], index) => (
        <BetSection
          key={`${nat}-${index}`}
          title={nat}
          minMax={minMax}
          players={team}
          gstatus={gstatus}
          withLay={true}
          {...betProps}
        />
      ))}
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
  const minMax = `${bettingData.sub[0].min} - ${bettingData.sub[0].max}`;
  const gstatus = bettingData.sub[0].gstatus;

  return (
    <>
      {Object.entries(displayData).map(([nat, team], index) => (
        <BetSection
          key={index}
          title={nat}
          minMax={minMax}
          players={team}
          gstatus={gstatus}
          withLay={false}
          {...betProps}
        />
      ))}

      {/* Teen20 Side Bets */}
      {hasSideBets(gameid) && (
        <Teen20SideBets
          bettingData={bettingData}
          gstatus={gstatus}
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
const Teen20SideBets = memo(function Teen20SideBets({
  bettingData,
  gstatus,
  ...betProps
}) {
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
