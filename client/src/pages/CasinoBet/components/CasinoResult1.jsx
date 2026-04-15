import { useEffect, useState } from 'react';
import { FaTrophy } from 'react-icons/fa';
import api from '../../../redux/api';
import { formatBetType, distributeCards, evaluateSideBets } from './utils';

/* ------------------ Helpers ------------------ */

const isBaccarat = (gameId) => gameId === 'baccarat' || gameId === 'baccarat2';

const GAMES_WITH_TIE = new Set(['baccarat', 'baccarat2', 'dt202']);

const hasTie = (gameId) => GAMES_WITH_TIE.has(gameId);

const TEAM_LABELS = {
  baccarat: { A: 'PLAYER', B: 'BANKER' },
  baccarat2: { A: 'PLAYER', B: 'BANKER' },
  dt202: { A: 'DRAGON', B: 'TIGER' },
  lucky7: { A: 'LOW CARD (A to 6)', B: 'HIGH CARD (8 to K)' },
  lucky7eu: { A: 'LOW CARD (A to 6)', B: 'HIGH CARD (8 to K)' },
  lucky7eu2: { A: 'LOW CARD (A to 6)', B: 'HIGH CARD (8 to K)' },
};
const isCard32 = (gameId) => gameId === 'card32' || gameId === 'card32eu';

const CARD32_ORDER = [
  { key: 'player8', label: 'Player 8', winValue: '1' },
  { key: 'player9', label: 'Player 9', winValue: '2' },
  { key: 'player10', label: 'Player 10', winValue: '3' },
  { key: 'player11', label: 'Player 11', winValue: '4' },
];

const isLucky7 = (gameId) =>
  gameId === 'lucky7' || gameId === 'lucky7eu' || gameId === 'lucky7eu2';

const getTeamLabel = (gameId, side) =>
  TEAM_LABELS[gameId]?.[side] ?? `PLAYER ${side}`;

const normalizePlayers = (distributed) => ({
  A: distributed?.playerA ?? distributed?.player ?? distributed?.dragon ?? [],
  B: distributed?.playerB ?? distributed?.banker ?? distributed?.tiger ?? [],
});

const hasNumberNine = (cardString) =>
  cardString?.split(',').some((c) => c.includes('9')) ?? false;

/* ------------------ UI Components ------------------ */

const Trophy = ({ win }) =>
  win ? (
    <FaTrophy className='text-xs text-green-600 shadow' />
  ) : (
    <FaTrophy className='rotate-180 text-xs text-red-600 shadow' />
  );

const CardRow = ({ title, cards, isWinner, isTie, gameId, rotateIndex }) => (
  <div className='text-center md:pr-2.5'>
    <h3 className='font-bold'>{title}</h3>

    <div className='my-2 flex justify-center gap-2'>
      {cards.map((card, index) => {
        if (isBaccarat(gameId) && card === '1') return null;

        const rotate = isBaccarat(gameId) && index === rotateIndex;

        return (
          <img
            key={`${card}-${index}`}
            src={`/cards/${card}.jpg`}
            alt={card}
            className={`h-18 ${rotate ? 'mx-2 rotate-90' : ''}`}
          />
        );
      })}
    </div>

    {isWinner && (
      <div className='mt-2 inline-block rounded bg-green-600 px-3 py-1 text-lg font-semibold text-white'>
        Winner
      </div>
    )}
    {isTie && (
      <div className='mt-2 inline-block rounded bg-gray-600 px-3 py-1 text-lg font-semibold text-white'>
        Tie
      </div>
    )}
  </div>
);

// lucky7 result
const Lucky7UI = ({ distributed, item, gameId }) => (
  <>
    <div className='my-2 space-y-2'>
      <img
        src={`/cards/${distributed?.card}.jpg`}
        alt='card'
        className='m-auto h-14 w-auto rounded border border-gray-300 object-contain'
      />
    </div>

    <div className='border-t py-2 text-xs'>
      <div className='text-center font-semibold'>WINNER</div>
      <div className='grid grid-cols-2 py-1 text-[12px]'>
        <div className='flex justify-center gap-1'>
          {getTeamLabel(gameId, 'A')}
          <Trophy win={item.win === '1'} />
        </div>
        <div className='flex justify-center gap-1'>
          {getTeamLabel(gameId, 'B')}
          <Trophy win={item.win === '2'} />
        </div>
      </div>
    </div>
  </>
);

// card32 result
const Card32UI = ({ distributed, item }) => (
  <>
    <div className='my-2 space-y-2'>
      {CARD32_ORDER.map(({ key, label, winValue }) => {
        const playerCards = distributed[key] ?? [];
        const win = item.win === winValue;

        return (
          <div key={key} className='flex items-center gap-2'>
            <span className='min-w-[80px] text-sm font-medium'>{label} -</span>

            <div className='flex gap-1'>
              {playerCards.map((card) => (
                <img
                  key={card}
                  src={`/cards/${card}.jpg`}
                  alt={card}
                  className='h-14 w-auto rounded border border-gray-300 object-contain'
                />
              ))}
            </div>

            <Trophy win={win} />
          </div>
        );
      })}
    </div>

    <div className='border-t py-2 text-xs'>
      <div className='text-center font-semibold'>WINNER</div>
      <div className='grid grid-cols-2 gap-y-2 py-2 text-[12px]'>
        {CARD32_ORDER.map(({ key, label, winValue }) => (
          <div key={key} className='flex items-center justify-center gap-1'>
            {label} - <Trophy win={item.win === winValue} />
          </div>
        ))}
      </div>
    </div>
  </>
);

// default result
const DefaultGameUI = ({ players, item, gameId }) => (
  <>
    <div className='my-2 grid md:grid-cols-2'>
      <CardRow
        title={getTeamLabel(gameId, 'A')}
        cards={players.A}
        gameId={gameId}
        rotateIndex={0}
        isWinner={item.win === '1'}
        isTie={item.win === '3'}
      />

      <CardRow
        title={getTeamLabel(gameId, 'B')}
        cards={players.B}
        gameId={gameId}
        rotateIndex={2}
        isWinner={item.win === '2'}
        isTie={item.win === '3'}
      />
    </div>

    <div className='border-t py-2 text-xs'>
      <div className='text-center font-semibold'>WINNER</div>
      <div className='grid grid-cols-2 py-1 text-[12px]'>
        <div className='flex justify-center gap-1'>
          {getTeamLabel(gameId, 'A')}
          <Trophy win={item.win === '1'} />
        </div>

        {hasTie(gameId) && (
          <div className='flex justify-center gap-1'>
            TIE <Trophy win={item.win === '3'} />
          </div>
        )}

        <div className='flex justify-center gap-1'>
          {getTeamLabel(gameId, 'B')}
          <Trophy win={item.win === '2'} />
        </div>
      </div>
    </div>
  </>
);

/* ------------------ Main Component ------------------ */

const ResultPopup = ({ item, onClose, showSideBets, gameId }) => {
  const [resultDetail, setResultDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item || !gameId) return;

    setLoading(true);
    api
      .get(`/casino-betting-result-detail?gameId=${gameId}&mid=${item.mid}`)
      .then((res) => setResultDetail(res.data?.data ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [item, gameId]);

  console.log('resultDetail', resultDetail);
  if (loading || !resultDetail) return null;

  const cards = resultDetail.card?.split(',') ?? [];
  const distributed = distributeCards(cards, gameId, gameId);
  const sideBets = evaluateSideBets(distributed, gameId);
  const players = normalizePlayers(distributed);

  return (
    <div className='fixed inset-0 z-10 flex items-center justify-center bg-black/40'>
      <div className='w-full max-w-[500px] overflow-hidden rounded-md bg-white'>
        {/* Header */}
        <div className='bg-primary flex justify-between px-2 py-1 text-white'>
          <span className='text-sm font-semibold uppercase'>
            {resultDetail.ename}
          </span>
          <span onClick={onClose} className='cursor-pointer text-white'>
            ✖
          </span>
        </div>

        {/* Content */}
        <div className='max-h-[80vh] overflow-y-auto px-4 pb-4'>
          <p className='text-end text-xs font-semibold'>
            Round Id: {resultDetail.rid}
          </p>

          {/* Board */}
          {distributed?.board?.length > 0 && (
            <div className='flex gap-2 py-3 font-bold'>
              Board:
              {distributed.board.map((c) => (
                <img key={c} src={`/cards/${c}.jpg`} alt={c} className='h-18' />
              ))}
            </div>
          )}

          {(() => {
            const isLucky = isLucky7(gameId);
            const is32 = isCard32(gameId);
            if (isLucky) {
              return (
                <Lucky7UI
                  distributed={distributed}
                  item={item}
                  gameId={gameId}
                />
              );
            }
            if (is32) {
              return <Card32UI distributed={distributed} item={item} />;
            }
            return (
              <DefaultGameUI players={players} item={item} gameId={gameId} />
            );
          })()}

          {/* Side Bets */}
          {showSideBets &&
            Object.keys(sideBets).length > 0 &&
            Object.entries(sideBets).map(([type, value]) => (
              <div key={type} className='border-t py-2 text-xs'>
                <div className='text-center font-semibold'>
                  {formatBetType(type, gameId)}
                </div>
                <div className='grid grid-cols-2 py-1 text-[12px]'>
                  <div className='flex justify-center gap-1'>
                    {getTeamLabel(gameId, 'A')} <Trophy win={value.A} />
                  </div>
                  <div className='flex justify-center gap-1'>
                    {getTeamLabel(gameId, 'B')} <Trophy win={value.B} />
                  </div>
                </div>
              </div>
            ))}

          {/* Lucky 9 */}
          {gameId === 'teensin' && (
            <div className='border-t py-2 text-center text-xs'>
              LUCKY 9 <Trophy win={hasNumberNine(resultDetail.card)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPopup;
