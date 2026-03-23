import React, { memo } from 'react';
import { distributeCards } from './utils';

/**
 * CardsDisplay - Displays cards for the current round
 * Shows cards for different players based on game type
 */
const CardsDisplay = memo(function CardsDisplay({ bettingData }) {
  if (!bettingData?.card) return null;

  const cards = bettingData.card.split(',');
  const gameType = bettingData.gtype;
  const distributedCards = distributeCards(cards, bettingData.gtype, gameType);

  if (!distributedCards) return null;

  const isBaccaratGame = gameType === 'baccarat' || gameType === 'baccarat2';
  const isCard32Game = gameType === 'card32' || gameType === 'card32eu';
  const isLuckyCard =
    gameType === 'lucky7' ||
    gameType === 'lucky7eu' ||
    gameType === 'lucky7eu2';
  // Build a generic list of player entries from the distributed cards
  const playerEntries = [];

  if (isCard32Game) {
    ['player8', 'player9', 'player10', 'player11'].forEach((key, idx) => {
      if (distributedCards[key]?.length > 0) {
        playerEntries.push({
          key,
          label: bettingData?.sub?.[idx]?.nat || key.toUpperCase(),
          cards: distributedCards[key],
        });
      }
    });
  } else if (isLuckyCard) {
    ['card'].forEach((key) => {
      if (distributedCards[key]?.length > 0) {
        playerEntries.push({
          key,
          label: 'card',
          cards: distributedCards[key],
        });
      }
    });
  } else {
    // Default: playerA/player and playerB/banker
    const playerACards = distributedCards.playerA || distributedCards.player;
    const playerBCards = distributedCards.playerB || distributedCards.banker;
    if (playerACards) {
      playerEntries.push({
        key: 'playerA',
        label: bettingData?.sub?.[0]?.nat,
        cards: playerACards,
      });
    }
    if (playerBCards) {
      playerEntries.push({
        key: 'playerB',
        label: bettingData?.sub?.[1]?.nat,
        cards: playerBCards,
      });
    }
  }
  return (
    <div>
      <div className='text-[10px] font-bold text-white'>
        RID: {bettingData.mid}
      </div>

      {/* Poison Cards */}
      {distributedCards.poison && distributedCards.poison.length > 0 && (
        <div className='mb-1'>
          <h4 className='text-xs font-bold text-white'>POISON</h4>
          <div className='flex gap-1'>
            {distributedCards.poison.map((card, index) => (
              <img
                key={`poison-${index}`}
                src={`/cards/${card}.jpg`}
                alt={card}
                className='h-8 w-auto rounded shadow-sm'
              />
            ))}
          </div>
        </div>
      )}

      {/* Board Cards */}
      {distributedCards.board && distributedCards.board.length > 0 && (
        <div className='mb-1'>
          <h4 className='text-xs font-bold text-white'>BOARD</h4>
          <div className='flex gap-1'>
            {distributedCards.board.map((card, index) => (
              <img
                key={`board-${index}`}
                src={`/cards/${card}.jpg`}
                alt={card}
                className='h-8 w-auto rounded shadow-sm'
              />
            ))}
          </div>
        </div>
      )}

      {playerEntries.map((entry) => (
        <div key={entry.key} className='mb-1'>
          <h4 className='text-xs font-bold text-white uppercase'>
            {entry.label}
          </h4>
          <div className='flex gap-1'>
            {entry.cards.map((card, index) => {
              const isFirstCard = index === 0;
              const isLastCard = index === entry.cards.length - 1;
              const shouldRotateFirst =
                isBaccaratGame && entry.key === 'playerA' && isFirstCard;
              const shouldRotateLast =
                isBaccaratGame && entry.key === 'playerB' && isLastCard;
              if (shouldRotateFirst && card === '1') return null;
              if (shouldRotateLast && card === '1') return null;
              return (
                <img
                  key={`${entry.key}-${index}`}
                  src={`/cards/${card}.jpg`}
                  alt={card}
                  className={`h-8 w-auto rounded shadow-sm ${shouldRotateFirst ? 'mr-1 rotate-90' : ''} ${shouldRotateLast ? 'ml-1 rotate-90' : ''}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

export default CardsDisplay;
