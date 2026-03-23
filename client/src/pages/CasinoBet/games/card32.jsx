import React, { memo, useMemo } from 'react';
import { BetSection } from './DefaultRenderer';

const groupCard32Data = (sub) => {
  if (!Array.isArray(sub)) return {};

  return {
    players: sub.filter((item) => item.sid >= 1 && item.sid <= 4),
    oddEven: sub.filter((item) => item.sid >= 5 && item.sid <= 12),
    cardColor: sub.filter((item) => [13, 14, 27].includes(item.sid)),
    cardTotal: sub.filter((item) => [25, 26].includes(item.sid)),
    luckyNumber: sub.filter((item) => item.sid >= 15 && item.sid <= 24),
  };
};

const CARD32_SECTIONS = [
  {
    key: 'players',
    title: 'WINNER',
    withLay: true,
    showLay: true,
    showBackLayHeader: false,
  },
  {
    key: 'cardColor',
    title: 'CARD COLOR',
    withLay: true,
    showLay: true,
    showBackLayHeader: false,
  },
  {
    key: 'cardTotal',
    title: 'CARD TOTAL',
    withLay: true,
    showLay: false,
    showBackLayHeader: false,
  },
  {
    key: 'luckyNumber',
    title: 'LUCKY NUMBER',
    withLay: true,
    showLay: false,
    showBackLayHeader: false,
  },
];

const Card32Renderer = memo(function Card32euRenderer({
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
  const sections = useMemo(
    () => groupCard32Data(bettingData?.sub),
    [bettingData?.sub]
  );
  return (
    <>
      {CARD32_SECTIONS.map((section) => {
        const players = sections[section.key];
        if (!players || players.length === 0) return null;

        const minMax = `${players[0].min} - ${players[0].max}`;
        const gstatus = players[0].gstatus;

        return (
          <BetSection
            key={section.key}
            title={section.title}
            minMax={minMax}
            players={players}
            gstatus={gstatus}
            withLay={section.withLay}
            showLay={section.showLay}
            showBackLayHeader={section.showBackLayHeader}
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
          />
        );
      })}
    </>
  );
});

export default Card32Renderer;
