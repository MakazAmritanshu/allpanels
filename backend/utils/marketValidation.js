import dotenv from 'dotenv';

import {
  fetchCasinoData as fetchCasinoDataApi,
  fetchMatchData,
} from '../services/matchApi/index.js';

dotenv.config();

const SPORT_NAME_TO_APITYPE = {
  cricket: 'cricket',
  'cricket game': 'cricket',
  tennis: 'tennis',
  'tennis game': 'tennis',
  soccer: 'soccer',
  'soccer game': 'soccer',
  'horse racing': 'horse-racing',
};

const API_MARKET_ALIASES = {
  'Match Odds': 'MATCH_ODDS',
  'Tied Match': 'TIED_MATCH',
  MATCH_ODDS: 'Match Odds',
  TIED_MATCH: 'Tied Match',
};

const MAX_CACHE_AGE_MS = 1000;

/**
 * Fetch fresh live data from API. ALWAYS fetches — never trusts the polling cache.
 * The polling cache (cachedData) and the frontend WebSocket share the same data,
 * so validating against the cache = comparing stale-vs-stale.
 *
 * Falls back to cache ONLY if the fresh fetch fails AND cache is very recent (< 500ms).
 */
async function fetchFreshSportsData(cachedData, gameId, apitype, sid) {
  const cacheKey = `${gameId}_${apitype}`;

  try {
    const newData = await fetchMatchData(gameId, sid);

    if (!newData?.success || !Array.isArray(newData.data)) {
      return {
        ok: false,
        reason: 'Unable to verify live odds. Please try again.',
      };
    }

    // Update the shared cache so polling benefits too
    cachedData[cacheKey] = {
      data: newData.data,
      raw: newData,
      lastUpdated: Date.now(),
    };

    return { ok: true, markets: newData.data };
  } catch (err) {
    // Fallback: use cache ONLY if very fresh (< 500ms) — half the poll interval
    const cacheEntry = cachedData[cacheKey];
    const now = Date.now();
    if (
      cacheEntry?.lastUpdated &&
      now - cacheEntry.lastUpdated <= 500 &&
      Array.isArray(cacheEntry.data)
    ) {
      return { ok: true, markets: cacheEntry.data };
    }

    return {
      ok: false,
      reason: 'Unable to verify live odds. Please try again.',
    };
  }
}

async function fetchFreshCasinoData(cachedData, gameId) {
  const cacheKey = `betting_${gameId}_casino`;

  try {
    const newData = await fetchCasinoDataApi(gameId);

    if (!newData?.success || !newData.data) {
      return {
        ok: false,
        reason: 'Unable to verify live casino odds. Please try again.',
      };
    }

    cachedData[cacheKey] = {
      data: newData.data,
      raw: newData,
      lastUpdated: Date.now(),
    };

    return { ok: true, data: newData.data };
  } catch (err) {
    const cacheEntry = cachedData[cacheKey];
    const now = Date.now();
    if (
      cacheEntry?.lastUpdated &&
      now - cacheEntry.lastUpdated <= 500 &&
      cacheEntry.data
    ) {
      return { ok: true, data: cacheEntry.data };
    }

    return {
      ok: false,
      reason: 'Unable to verify live casino odds. Please try again.',
    };
  }
}

/**
 * Validate sports bet against live market data.
 * ALWAYS fetches fresh from API — never relies on stale polling cache.
 *
 * @param {object} cachedData - shared cache object from bettingSocket
 * @param {object} params - { gameId, gameName, marketName, teamName, xValue, otype, sid, oname }
 * @returns {{ valid: boolean, reason?: string, currentOdds?: number }}
 */
export async function validateSportsMarket(
  cachedData,
  { gameId, gameName, marketName, teamName, xValue, otype, sid, oname }
) {
  const apitype = SPORT_NAME_TO_APITYPE[gameName?.toLowerCase()] || 'cricket';

  const freshResult = await fetchFreshSportsData(
    cachedData,
    gameId,
    apitype,
    sid
  );
  if (!freshResult.ok) {
    return { valid: false, reason: freshResult.reason };
  }

  const markets = freshResult.markets;

  const market = markets.find((m) => {
    const mname = m.mname || '';
    return (
      mname === marketName ||
      mname === API_MARKET_ALIASES[marketName] ||
      API_MARKET_ALIASES[mname] === marketName
    );
  });

  if (!market) {
    return {
      valid: false,
      reason: 'Market not found in live data. Please try again.',
    };
  }

  if (market.status === 'SUSPENDED' || market.gstatus === 'SUSPENDED') {
    return { valid: false, reason: 'Market is suspended. Bet not accepted.' };
  }

  if (!market.section || !Array.isArray(market.section)) {
    return {
      valid: false,
      reason: 'Market data unavailable. Please try again.',
    };
  }

  const normalizedTeam = (teamName || '').trim().toLowerCase();
  const teamSection = market.section.find((sec) => {
    const nat = (sec.nat || '').trim().toLowerCase();
    return nat === normalizedTeam || nat.startsWith(normalizedTeam + ' (');
  });

  if (!teamSection) {
    return {
      valid: false,
      reason: 'Selection not found in live data. Please try again.',
    };
  }

  if (
    teamSection.gstatus === 'SUSPENDED' ||
    teamSection.status === 'SUSPENDED'
  ) {
    return {
      valid: false,
      reason: 'Selection is suspended. Bet not accepted.',
    };
  }

  if (!teamSection.odds || !Array.isArray(teamSection.odds)) {
    return {
      valid: false,
      reason: 'Odds data unavailable. Please try again.',
    };
  }

  const userOdds = parseFloat(xValue);
  const liveOddsObj = oname
    ? teamSection.odds.find((o) => o.oname === oname)
    : teamSection.odds.find((o) => o.otype === otype && o.tno === 0);
  const liveOdds = liveOddsObj ? parseFloat(liveOddsObj.odds) : null;

  if (liveOdds === null || isNaN(liveOdds) || liveOdds <= 0) {
    return {
      valid: false,
      reason: 'Unable to verify current odds. Please try again.',
    };
  }

  if (Math.abs(userOdds - liveOdds) > 0.01) {
    return {
      valid: false,
      reason: `Odds changed. Current: ${liveOdds.toFixed(2)}. Please re-select.`,
      currentOdds: liveOdds,
    };
  }

  return {
    valid: true,
    marketMeta: {
      mid: market.mid || null,
      gmid: market.gmid || null,
      runners: (market.section || []).map((sec) => ({
        selectionId: sec.sid,
        selectionName: (sec.nat || '').trim(),
      })),
    },
  };
}

/**
 * Validate fancy bet against live market data.
 *
 * @param {object} cachedData - shared cache object from bettingSocket
 * @param {object} params - { gameId, gameName, marketName, teamName, xValue, otype, sid, fancyScore, oname }
 * @returns {{ valid: boolean, reason?: string, currentOdds?: number }}
 */
export async function validateFancyMarket(
  cachedData,
  {
    gameId,
    gameName,
    marketName,
    teamName,
    xValue,
    otype,
    sid,
    fancyScore,
    oname,
  }
) {
  const apitype = SPORT_NAME_TO_APITYPE[gameName?.toLowerCase()] || 'cricket';

  const freshResult = await fetchFreshSportsData(
    cachedData,
    gameId,
    apitype,
    sid
  );
  if (!freshResult.ok) {
    return { valid: false, reason: freshResult.reason };
  }

  const markets = freshResult.markets;

  // Search all markets for the matching section (teamName)
  for (const market of markets) {
    if (!market.section || !Array.isArray(market.section)) continue;

    const section = market.section.find(
      (sec) =>
        (sec.nat || '').trim().toLowerCase() ===
        (teamName || '').trim().toLowerCase()
    );

    if (section) {
      // ── Suspension checks ──
      if (
        section.gstatus === 'SUSPENDED' ||
        section.gstatus === 'Ball Running' ||
        section.status === 'SUSPENDED'
      ) {
        return {
          valid: false,
          reason: 'Market is suspended. Bet not accepted.',
        };
      }

      if (market.status === 'SUSPENDED' || market.gstatus === 'SUSPENDED') {
        return {
          valid: false,
          reason: 'Market is suspended. Bet not accepted.',
        };
      }

      // ── Odds array must exist ──
      if (!section.odds || !Array.isArray(section.odds)) {
        return {
          valid: false,
          reason: 'Odds data unavailable. Please try again.',
        };
      }

      // ── FancyScore strict validation ──
      if (fancyScore == null) {
        return {
          valid: false,
          reason: 'Fancy score is required. Please try again.',
        };
      }

      const userFancyScore = parseFloat(fancyScore);
      const liveOddsObj = oname
        ? section.odds.find((o) => o.oname === oname)
        : section.odds.find((o) => o.otype === otype && o.tno === 0);
      const liveFancyScore = liveOddsObj ? parseFloat(liveOddsObj.odds) : null;

      if (
        liveFancyScore === null ||
        isNaN(liveFancyScore) ||
        liveFancyScore <= 0
      ) {
        return {
          valid: false,
          reason: 'Unable to verify current fancy score. Please try again.',
        };
      }

      if (Math.abs(userFancyScore - liveFancyScore) > 0.01) {
        return {
          valid: false,
          reason: `Fancy score changed. Current: ${liveFancyScore}. Please re-select.`,
        };
      }

      // ── xValue (size/payout) strict validation ──
      if (!xValue) {
        return {
          valid: false,
          reason: 'Odds size is required. Please try again.',
        };
      }

      const userSize = parseFloat(xValue);
      const liveSizeObj = oname
        ? section.odds.find((o) => o.oname === oname)
        : section.odds.find((o) => o.otype === otype && o.tno === 0);
      const liveSize = liveSizeObj ? parseFloat(liveSizeObj.size) : null;

      if (liveSize === null || isNaN(liveSize) || liveSize <= 0) {
        return {
          valid: false,
          reason: 'Unable to verify current odds size. Please try again.',
        };
      }

      if (Math.abs(userSize - liveSize) > 0.01) {
        return {
          valid: false,
          reason: `Odds changed. Current: ${liveSize.toFixed(2)}. Please re-select.`,
          currentOdds: liveSize,
        };
      }

      return {
        valid: true,
        marketMeta: {
          mid: market.mid || null,
          gmid: market.gmid || null,
          fancyId: section.sid || null,
        },
      };
    }
  }

  // teamName not found in ANY market section — fail closed
  return {
    valid: false,
    reason: 'Selection not found in live data. Please try again.',
  };
}

/**
 * Validate casino bet against live market data.
 *
 * @param {object} cachedData - shared cache object from bettingSocket
 * @param {object} params - { gameId, teamName, xValue, otype }
 * @returns {{ valid: boolean, reason?: string, currentOdds?: number }}
 */
export async function validateCasinoMarket(
  cachedData,
  { gameId, teamName, xValue, otype }
) {
  const freshResult = await fetchFreshCasinoData(cachedData, gameId);
  if (!freshResult.ok) {
    return { valid: false, reason: freshResult.reason };
  }

  const data = freshResult.data;

  if (data.status === 'SUSPENDED' || data.gstatus === 'SUSPENDED') {
    return { valid: false, reason: 'Market is suspended. Bet not accepted.' };
  }

  const players = data.sub;
  if (!players || !Array.isArray(players)) {
    return {
      valid: false,
      reason: 'Casino selection data unavailable. Please try again.',
    };
  }

  const allSuspended = players.every(
    (p) => p.gstatus === 'SUSPENDED' || p.status === 'SUSPENDED'
  );
  if (allSuspended) {
    return {
      valid: false,
      reason: 'All selections are suspended. Bet not accepted.',
    };
  }

  const player = players.find(
    (p) =>
      (p.nat || '').trim().toLowerCase() ===
      (teamName || '').trim().toLowerCase()
  );

  if (!player) {
    return {
      valid: false,
      reason: 'Selection not found in live data. Please try again.',
    };
  }

  if (player.gstatus === 'SUSPENDED' || player.status === 'SUSPENDED') {
    return {
      valid: false,
      reason: 'Selection is suspended. Bet not accepted.',
    };
  }

  if (!xValue) {
    return {
      valid: false,
      reason: 'Odds value is required. Please try again.',
    };
  }

  const userOdds = parseFloat(xValue);
  const liveOdds =
    otype === 'back' ? parseFloat(player.b) : parseFloat(player.l);

  if (isNaN(liveOdds) || liveOdds <= 0) {
    return {
      valid: false,
      reason: 'Unable to verify current casino odds. Please try again.',
    };
  }

  const drift = Math.abs(userOdds - liveOdds) / liveOdds;
  if (drift > 0.05) {
    return {
      valid: false,
      reason: `Odds changed. Current: ${liveOdds.toFixed(2)}. Please re-select.`,
      currentOdds: liveOdds,
    };
  }

  return { valid: true };
}

export { API_MARKET_ALIASES, MAX_CACHE_AGE_MS, SPORT_NAME_TO_APITYPE };
