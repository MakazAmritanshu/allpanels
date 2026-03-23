import React, { memo } from 'react';
import { distributeCards } from '../../../utils/utils';

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

      {/* Player A Cards */}
      <div className='mb-1'>
        <h4 className='text-xs font-bold text-white'>PLAYER A</h4>
        <div className='flex gap-1'>
          {(distributedCards.playerA || distributedCards.player)?.map(
            (card, index) => {
              const isFirstCard = index === 0;
              const shouldRotate = isBaccaratGame && isFirstCard;
              if (isBaccaratGame && isFirstCard && card === '1') return null;
              return (
                <img
                  key={`playerA-${index}`}
                  src={`/cards/${card}.jpg`}
                  alt={card}
                  className={`h-8 w-auto rounded shadow-sm ${
                    shouldRotate ? 'mr-1 rotate-90' : ''
                  }`}
                />
              );
            }
          )}
        </div>
      </div>

      {/* Player B Cards */}
      <div>
        <h4 className='text-xs font-bold text-white'>PLAYER B</h4>
        <div className='flex gap-1'>
          {(distributedCards.playerB || distributedCards.banker)?.map(
            (card, index) => {
              const isLastCard = index === 2;
              const shouldRotate = isBaccaratGame && isLastCard;
              if (isBaccaratGame && isLastCard && card === '1') return null;
              return (
                <img
                  key={`playerB-${index}`}
                  src={`/cards/${card}.jpg`}
                  alt={card}
                  className={`h-8 w-auto rounded shadow-sm ${
                    shouldRotate ? 'ml-1 rotate-90' : ''
                  }`}
                />
              );
            }
          )}
        </div>
      </div>
    </div>
  );
});

export default CardsDisplay;
