import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../redux/api';
import { toast } from 'react-toastify';
import { IoIosArrowDown } from 'react-icons/io';

// Fancy game types that need score input instead of team selection
const FANCY_GAME_TYPES = ['Normal', 'meter', 'line', 'ball', 'khado'];

const getGameColor = (gameType) => {
  // Fancy bet types - orange/amber color
  if (FANCY_GAME_TYPES.includes(gameType)) {
    return 'bg-orange-100 text-orange-800';
  }
  switch (gameType) {
    case 'OVER_UNDER_05':
    case 'OVER_UNDER_15':
    case 'OVER_UNDER_25':
      return 'bg-purple-100 text-purple-800';
    case 'Match Odds':
      return 'bg-blue-100 text-blue-800';
    case 'Bookmaker':
    case 'Bookmaker IPL CUP':
      return 'bg-green-100 text-green-800';
    case 'Toss':
    case '1st 6 over':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getSportKey = (gameName = '') => {
  const name = gameName.toLowerCase();
  if (name.includes('cricket')) return 'Cricket';
  if (name.includes('soccer') || name.includes('football')) return 'Soccer';
  if (name.includes('tennis')) return 'Tennis';
  if (name.includes('horse')) return 'Horse Racing';
  return 'Other';
};

const ResultControl = () => {
  const [activeGameId, setActiveGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(null);
  const [unsettledLoading, setUnsettledLoading] = useState(false);
  const [unsettledError, setUnsettledError] = useState('');
  const [unsettledBets, setUnsettledBets] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [settleLoading, setSettleLoading] = useState(false);
  const [fancyScore, setFancyScore] = useState(''); // For fancy bet score input
  const [selectedGame, setSelectedGame] = useState(null); // Track selected game object

  const formatDateTime = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  useEffect(() => {
    const fetchPendingGames = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/manual-result/pending-games');
        const data = res.data || {};
        const payload = data.data || {};

        setGames(payload.games || []);
        setTotalPending(payload.totalPendingGames || 0);
      } catch (err) {
        const msg =
          err?.response?.data?.message || 'Failed to fetch pending games';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingGames();
  }, []);

  const fetchUnsettledBets = async (gameId, gameType, marketName) => {
    if (!gameId) return;
    setUnsettledLoading(true);
    try {
      const res = await api.get('/manual-result/unsettled-bets', {
        params: { gameId, gameType, marketName }, // Include gameType and marketName to filter correctly
      });
      const data = res.data || {};
      const payload = data.data || {};
      setUnsettledBets(payload.bets || []);
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Failed to fetch unsettled bets';
      setUnsettledError(msg);
      toast.error(msg);
      setUnsettledBets([]);
    } finally {
      setUnsettledLoading(false);
    }
  };

  const handleSettle = async (game, finalResult) => {
    if (!game || !finalResult) return;

    // Validate fancy score if it's a fancy bet
    if (FANCY_GAME_TYPES.includes(game.gameType)) {
      if (isNaN(parseFloat(finalResult))) {
        toast.error('Please enter a valid numeric score for fancy bets');
        return;
      }
    }

    setSettleLoading(true);
    try {
      const res = await api.post('/manual-result/settle', {
        gameId: game.gameId,
        gameType: game.gameType,
        marketName: game.marketName, // Include marketName to settle only this specific market
        final_result: finalResult, // Can be team name OR score
      });

      toast.success(res?.data?.message || `Result settled: ${finalResult}`);
      setShowModal(false);
      setSelectedGame(null);
      setFancyScore(''); // Reset fancy score
      // Refresh the pending games list
      const refreshRes = await api.get('/manual-result/pending-games');
      const data = refreshRes.data || {};
      const payload = data.data || {};
      setGames(payload.games || []);
      setTotalPending(payload.totalPendingGames || 0);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to settle result';
      toast.error(msg);
    } finally {
      setSettleLoading(false);
    }
  };
  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };
  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gray-100 p-4'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-4 flex items-center justify-between'>
            <h1 className='text-xl font-semibold text-gray-800'>
              Pending Games (Manual Result)
            </h1>
            <div className='inline-flex items-center rounded-md px-2 py-0.5 text-[14px] font-bold text-black'>
              Total Pending:{' '}
              <span className='bg-color ml-0.5 flex w-fit items-center justify-center rounded-md px-1.5 py-0.5 text-white'>
                {totalPending}
              </span>
            </div>
          </div>

          {loading && (
            <div className='rounded bg-white p-4 text-center text-sm text-gray-600 shadow'>
              Loading pending games…
            </div>
          )}

          {!loading && error && (
            <div className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
              {error}
            </div>
          )}

          {!loading && !error && games.length === 0 && (
            <div className='rounded bg-white p-4 text-center text-sm text-gray-600 shadow'>
              No pending games found.
            </div>
          )}

          {!loading && !error && games.length > 0 && (
            <>
              {['Cricket', 'Soccer', 'Tennis', 'Horse Racing', 'Other'].map(
                (sport) => {
                  const groupGames = games.filter(
                    (g) => getSportKey(g.gameName) === sport
                  );
                  if (!groupGames.length) return null;

                  const tabId = sport; // use sport name as tab id

                  return (
                    <div key={sport} className='mb-4'>
                      {/* Collapsible section header */}
                      <div
                        className='section-header bg-dark mb-2 flex cursor-pointer items-center justify-between px-2 py-1 font-bold text-white'
                        onClick={() => toggleTab(tabId)}
                      >
                        <h2 className='text-sm font-semibold'>{sport} Games</h2>
                        <div
                          className={
                            activeTab === tabId
                              ? 'rotate-180 transition'
                              : 'transition'
                          }
                        >
                          <IoIosArrowDown />
                        </div>
                      </div>

                      {/* Only show this sport's games when no tab is selected OR this tab is active */}
                      {activeTab === tabId && (
                        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
                          {groupGames.map((g) => (
                            <button
                              key={`${g.gameId}-${g.gameType}-${g.marketName}`}
                              onClick={() => {
                                setActiveGameId(g.gameId);
                                setSelectedGame(g); // Store the full game object
                                fetchUnsettledBets(
                                  g.gameId,
                                  g.gameType,
                                  g.marketName
                                );
                                setFancyScore(''); // Reset fancy score input
                                setShowModal(true);
                              }}
                              className='rounded-lg border bg-white px-3 py-2 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md'
                            >
                              <div className='flex items-start justify-between gap-2'>
                                <div>
                                  <div className='text-[11px] text-gray-500 uppercase'>
                                    {g.gameName}
                                  </div>
                                  <div className='text-sm font-semibold text-gray-900'>
                                    {g.eventName}
                                  </div>
                                  <div className='mt-0.5 text-[11px] text-gray-600'>
                                    Market:{' '}
                                    <span className='font-medium'>
                                      {g.marketName}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={
                                    'rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ' +
                                    getGameColor(g.gameType)
                                  }
                                >
                                  {g.gameType}
                                </span>
                              </div>

                              <div className='mt-2 flex items-center justify-between text-[11px] text-gray-600'>
                                <span>
                                  Bets:{' '}
                                  <span className='font-semibold text-gray-900'>
                                    {g.totalBets}
                                  </span>
                                </span>
                                <span>
                                  Stake:{' '}
                                  <span className='font-semibold text-gray-900'>
                                    {g.totalStake}
                                  </span>
                                </span>
                              </div>

                              <div className='mt-1 text-[10px] text-gray-500'>
                                Oldest: {formatDateTime(g.oldestBet)}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </>
          )}
        </div>
      </div>

      {/* Popup with details + settle buttons */}
      {showModal &&
        selectedGame &&
        (() => {
          const game = selectedGame;
          const isFancyBet = FANCY_GAME_TYPES.includes(game.gameType);
          const [teamA = 'Team A', teamB = 'Team B'] = (
            game.eventName || ''
          ).split(/ v | vs | - /i);

          return (
            <div
              className='fixed inset-0 z-40 flex items-center justify-center bg-black/40'
              onClick={() => {
                setShowModal(false);
                setSelectedGame(null);
              }}
            >
              <div
                className='relative mx-4 w-full max-w-3xl rounded-xl bg-white shadow-lg'
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className='flex items-center justify-between border-b px-4 py-2'>
                  <div>
                    <div className='flex items-center gap-2 text-[11px] uppercase'>
                      <span className='text-gray-500'>
                        {getSportKey(game.gameName)} • {game.gameType}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          isFancyBet
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {isFancyBet ? 'FANCY (Score)' : 'SPORTS (Team)'}
                      </span>
                    </div>
                    <div className='text-sm font-semibold text-gray-900'>
                      {game.eventName}
                    </div>
                    <div className='text-[11px] text-gray-500'>
                      Market: {game.marketName}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedGame(null);
                    }}
                    className='px-2 text-lg leading-none text-gray-500 hover:text-gray-800'
                  >
                    ×
                  </button>
                </div>

                {/* Body */}
                <div className='max-h-[70vh] overflow-y-auto px-4 py-3 text-xs text-gray-800'>
                  {/* Summary */}
                  <div className='mb-3 grid gap-2 md:grid-cols-3'>
                    <div>
                      <div className='text-[11px] text-gray-500'>
                        Total Bets
                      </div>
                      <div className='text-base font-semibold'>
                        {game.totalBets}
                      </div>
                    </div>
                    <div>
                      <div className='text-[11px] text-gray-500'>
                        Total Stake
                      </div>
                      <div className='text-base font-semibold'>
                        {game.totalStake}
                      </div>
                    </div>
                    <div>
                      <div className='text-[11px] text-gray-500'>
                        Potential Payout
                      </div>
                      <div className='text-base font-semibold'>
                        {game.totalPotentialPayout}
                      </div>
                    </div>
                  </div>

                  {/* Settlement UI - Different for Fancy vs Sports */}
                  <div className='mb-4'>
                    {isFancyBet ? (
                      /* FANCY BET - Score Input */
                      <div>
                        <div className='mb-1 text-[11px] text-gray-500'>
                          Enter final score to settle fancy bets
                        </div>
                        <div className='flex items-center gap-2'>
                          <input
                            type='number'
                            value={fancyScore}
                            onChange={(e) => setFancyScore(e.target.value)}
                            placeholder='Enter score (e.g., 156)'
                            className='w-40 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none'
                          />
                          <button
                            disabled={settleLoading || !fancyScore}
                            onClick={() => handleSettle(game, fancyScore)}
                            className='rounded-full bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-60'
                          >
                            {settleLoading
                              ? 'Settling...'
                              : 'Settle with Score'}
                          </button>
                        </div>
                        {game.fancyScores && game.fancyScores.length > 0 && (
                          <div className='mt-2 text-[10px] text-gray-500'>
                            Bet scores in this market:{' '}
                            {game.fancyScores.filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* SPORTS BET - Team Selection */
                      <div>
                        <div className='mb-1 text-[11px] text-gray-500'>
                          Settle result (choose winning team)
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          <button
                            disabled={settleLoading}
                            onClick={() => handleSettle(game, teamA)}
                            className='rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'
                          >
                            {settleLoading ? 'Settling...' : `Settle: ${teamA}`}
                          </button>
                          <button
                            disabled={settleLoading}
                            onClick={() => handleSettle(game, teamB)}
                            className='rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60'
                          >
                            {settleLoading ? 'Settling...' : `Settle: ${teamB}`}
                          </button>
                          {/* Tied - refunds all bets */}
                          <button
                            disabled={settleLoading}
                            onClick={() => handleSettle(game, 'tied')}
                            className='rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600 disabled:opacity-60'
                          >
                            {settleLoading ? 'Settling...' : 'Tied (Refund)'}
                          </button>

                          {/* Void - cancel and refund all bets */}
                          <button
                            disabled={settleLoading}
                            onClick={() => handleSettle(game, 'void')}
                            className='rounded-full bg-gray-500 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-600 disabled:opacity-60'
                          >
                            {settleLoading ? 'Settling...' : 'Void (Cancel)'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Unsettled bets */}
                  <div className='border-t pt-3'>
                    <div className='mb-1 flex items-center justify-between'>
                      <h3 className='text-xs font-semibold text-gray-800'>
                        Unsettled Bets
                      </h3>
                      {unsettledLoading && (
                        <span className='text-[11px] text-gray-500'>
                          Loading…
                        </span>
                      )}
                    </div>

                    {unsettledError && (
                      <div className='mb-2 text-[11px] text-red-600'>
                        {unsettledError}
                      </div>
                    )}

                    {!unsettledLoading &&
                      !unsettledError &&
                      unsettledBets.length > 0 && (
                        <div className='max-h-48 overflow-y-auto rounded-lg bg-gray-50 p-2'>
                          <table className='w-full text-[11px]'>
                            <thead className='text-gray-500'>
                              <tr>
                                <th className='px-1 py-1 text-left'>User</th>
                                <th className='px-1 py-1 text-left'>
                                  {isFancyBet ? 'Market / Score' : 'Selection'}
                                </th>
                                <th className='px-1 py-1 text-center'>Type</th>
                                <th className='px-1 py-1 text-right'>P/L</th>
                              </tr>
                            </thead>
                            <tbody>
                              {unsettledBets.map((b) => (
                                <tr
                                  key={b._id}
                                  className='border-t border-gray-200'
                                >
                                  <td className='px-1 py-1'>{b.userName}</td>
                                  <td className='truncate px-1 py-1'>
                                    {isFancyBet ? (
                                      <span>
                                        {b.teamName}{' '}
                                        <span className='font-bold text-orange-600'>
                                          @ {b.fancyScore}
                                        </span>
                                      </span>
                                    ) : (
                                      b.teamName
                                    )}
                                  </td>
                                  <td className='px-1 py-1 text-center uppercase'>
                                    {b.otype}
                                  </td>
                                  <td className='px-1 py-1 text-right font-semibold'>
                                    <span className='text-green-600'>
                                      {b.betAmount}
                                    </span>
                                    /
                                    <span className='text-red-600'>
                                      {b.price}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    {!unsettledLoading &&
                      !unsettledError &&
                      unsettledBets.length === 0 && (
                        <div className='text-[11px] text-gray-500'>
                          No unsettled bets for this game.
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
};

export default ResultControl;
