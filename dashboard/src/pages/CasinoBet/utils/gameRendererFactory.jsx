import React from 'react';
import TeenMufRenderer from '../games/TeenMufRenderer';
import Poker20Renderer from '../games/Poker20Renderer';
import BaccaratRenderer from '../games/BaccaratRenderer';
import DragonTigerRenderer from '../games/DragonTigerRenderer';
import DragonTigerRenderer2 from '../games/DragonTigerRenderer2';
import DefaultRenderer from '../games/DefaultRenderer';

/**
 * Factory function to get the appropriate game renderer based on game ID
 */
export const getGameRenderer = (gameid) => {
  switch (gameid) {
    case 'teenmuf':
      return TeenMufRenderer;
    case 'poker20':
    case 'teensin':
      return Poker20Renderer;
    case 'baccarat':
    case 'baccarat2':
      return BaccaratRenderer;
    case 'dt202':
      return DragonTigerRenderer;
    case 'dt6':
      return DragonTigerRenderer2;
    default:
      return DefaultRenderer;
  }
};

/**
 * Render the appropriate game UI based on game ID
 */
export const renderGameUI = ({
  gameid,
  displayData,
  bettingData,
  resultData,
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
}) => {
  const Renderer = getGameRenderer(gameid);

  return (
    <Renderer
      displayData={displayData}
      bettingData={bettingData}
      resultData={resultData}
      gameid={gameid}
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
};

export default renderGameUI;
