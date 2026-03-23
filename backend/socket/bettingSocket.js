// socket/bettingSocket.js

// WebSocketServer - from the ws library, lets you create a WebSocketServer that client (browsers, app) can connect to
import axios from 'axios';
import dotenv from 'dotenv';
import io from 'socket.io-client';
import { WebSocketServer } from 'ws';
import betModel from '../models/betModel.js';
import {
  calculateCashoutValue,
  isCashoutEligible,
  CASHOUT_GAME_TYPES,
} from '../utils/cashoutUtils.js';
import { getBestOddsForTeam } from '../controllers/cashoutController.js';

dotenv.config();

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

// Global State
// clients -> Array holding all connected clients each with
// --> ws (the websocket connection)
// --> gameid (the match they subscribed to)
// --> apitype (the sport: cricket, tennis, soccer, etc)
// --> His browser sends { "type": "subscribe", "gameid": "1234", "apitype": "cricket" }
// --> His server adds him to clients[]
// --> clients = [ { ws: RahulSocket, gameid: "1234", apitype: "cricket" } ]
export let clients = [];

// Cached data -> Stores the latest data fetched for each gameid + apitype combo so you can avoid sending duplicate updates
export let cachedData = {};

const casinoBettingCache = new Map();
const roundIdCache = new Map();

//  NEW: Cache for casino results to prevent duplicate result broadcasts
let cachedCasinoResults = new Map();

//  NEW: Cache for recent results to prevent sending old results
let recentResultsCache = new Map();

// Store score socket connection per match
let liveScoreSockets = {};

//Caching the balance ,exposure and open bets

const lastSentValues = {
  balance: new Map(),
  exposure: new Map(),
  openBets: new Map(),
};

// helper: subscribe to the Live score
const subscribeToLiveScore = (gameid, apitype) => {
  const key = `${gameid}_${apitype}`;

  // Prevent duplicate socket connections for same game
  if (liveScoreSockets[key]) {
    console.log(` Already subscribed to live score for ${gameid} (${apitype})`);
    return;
  }

  try {
    console.log(` Connecting to live score for ${gameid} (${apitype})...`);

    const scoreSocket = io(BASE_SCORE_URL, {
      transports: ['websocket'],
      reconnection: false, // disable auto reconnect
      timeout: 20000,
      forceNew: true,
    });

    liveScoreSockets[key] = scoreSocket;

    //  When connected
    scoreSocket.on('connect', () => {
      console.log(` Connected to live score for ${gameid} (${apitype})`);
      scoreSocket.emit('subscribe', { gameid, apitype });
    });

    //  When score updates arrive
    scoreSocket.on('score_update', (data) => {
      console.log(` Live update for ${gameid} (${apitype}):`, data);
    });

    // When disconnected
    scoreSocket.on('disconnect', (reason) => {
      console.warn(` Disconnected from ${gameid} (${apitype}):`, reason);
      delete liveScoreSockets[key];
    });

    //  Handle connection errors safely
    scoreSocket.on('connect_error', (err) => {
      console.error(
        ` Score socket error for ${gameid} (${apitype}):`,
        err.message
      );

      // Close and clean current socket
      try {
        scoreSocket.close();
      } catch (closeErr) {
        console.error(' Error while closing socket:', closeErr.message);
      }

      delete liveScoreSockets[key];

      // Retry safely after 5 seconds (no recursion)
      setTimeout(() => {
        console.log(` Reconnecting to ${gameid} (${apitype})...`);
        subscribeToLiveScore(gameid, apitype);
      }, 5000);
    });
  } catch (err) {
    console.error(
      ' Unexpected error while subscribing to live score:',
      err.message
    );
  }
};

const getUniqueSubscriptions = () => {
  const uniqueSubscriptions = clients
    .map((c) => {
      if (!c.gameid) return null;

      if (c.apitype === 'casino') {
        return {
          gameid: c.gameid,
          apitype: c.apitype,
          roundId: c.roundId,
        };
      } else {
        return {
          gameid: c.gameid,
          apitype: c.apitype || 'cricket',
        };
      }
    })
    .filter(Boolean);

  return [
    ...new Map(
      uniqueSubscriptions.map((obj) => {
        if (obj.apitype === 'casino' && obj.roundId) {
          return [`${obj.gameid}_${obj.apitype}_${obj.roundId}`, obj];
        } else {
          return [`${obj.gameid}_${obj.apitype}`, obj];
        }
      })
    ).values(),
  ];
};


const computeAndPushCashoutValues = async (gameid) => {
  try {
    // Find all open, cashout-eligible bets for this game
    const openBets = await betModel.find({
      gameId: gameid,
      status: 0,
      gameType: { $in: CASHOUT_GAME_TYPES },
      isCashoutHedge: { $ne: true },
      isCashedOut: { $ne: true },
    });

    if (openBets.length === 0) return;

    // Group bets by userId
    const betsByUser = new Map();
    for (const bet of openBets) {
      const uid = bet.userId.toString();
      if (!betsByUser.has(uid)) betsByUser.set(uid, []);
      betsByUser.get(uid).push(bet);
    }

    // For each user, calculate cashout per bet and push
    for (const [uid, userBets] of betsByUser) {
      const cashoutData = [];

      for (const bet of userBets) {
        const { bestLay, bestBack } = getBestOddsForTeam(
          bet.gameId,
          bet.gameName,
          bet.teamName
        );
        const value = calculateCashoutValue([bet], bestLay, bestBack);
        if (value !== null) {
          cashoutData.push({
            betId: bet._id.toString(),
            cashoutValue: value,
          });
        }
      }

      if (cashoutData.length > 0) {
        sendCashoutUpdates(uid, cashoutData);
      }
    }
  } catch (err) {
    console.error(`[CASHOUT PUSH] Error for game ${gameid}:`, err.message);
  }
};

// Poll betting data for cricket, tennis, soccer
const pollBettingData = async () => {
  const groupedByGameId = getUniqueSubscriptions();

  for (const { gameid, apitype } of groupedByGameId) {
    try {
      // Skip casino games in this function
      if (apitype === 'casino') continue;

      let sid = 4; // default cricket
      if (apitype === 'tennis') sid = 2;
      else if (apitype === 'soccer') sid = 1;
      else if (apitype === 'horse-racing') sid = 10;

      const endpoint = `${API_URL}/getPriveteData?key=${API_KEY}&gmid=${gameid}&sid=${sid}`;
      const response = await axios.get(endpoint);
      const newData = response.data;

      if (newData.success) {
        const cacheKey = `${gameid}_${apitype}`;
        const prevData = cachedData[cacheKey]?.data;
        if (
          !prevData ||
          JSON.stringify(prevData) !== JSON.stringify(newData.data)
        ) {
          cachedData[cacheKey] = {
            data: newData.data,
            raw: newData,
            lastUpdated: Date.now(),
          };

          clients.forEach((client) => {
            if (
              client.gameid === gameid &&
              client.apitype === apitype &&
              client.ws.readyState === 1
            ) {
              client.ws.send(
                JSON.stringify({
                  type: 'bettingData',
                  gameid,
                  apitype,
                  data: newData.data,
                })
              );
            }
          });

          // Push live cashout values for users watching this game
          computeAndPushCashoutValues(gameid).catch((err) =>
            console.error(`Cashout push error for ${gameid}:`, err.message)
          );
        }
      }
    } catch (error) {
      console.error(`Polling error for ${gameid} (${apitype}):`, error.message);
    }
  }
};

// Poll casino betting data - IMMEDIATE (no delays)
const pollCasinoBettingData = async () => {
  const groupedByGameId = getUniqueSubscriptions();

  for (const { gameid, apitype } of groupedByGameId) {
    try {
      // Only poll betting data for casino games
      if (apitype === 'casino') {
        const endpoint = `${API_URL}/casino/data?key=${API_KEY}&type=${gameid}`;
        const response = await axios.get(endpoint);
        const newBettingData = response.data;

        if (newBettingData.success && newBettingData.data) {
          const newRoundId = newBettingData.data.mid;
          const cacheKey = `betting_${gameid}_${apitype}`;

          // Simple check: only send if data changed
          const currentCached = cachedData[cacheKey]?.data;
          if (
            !currentCached ||
            JSON.stringify(currentCached) !==
              JSON.stringify(newBettingData.data)
          ) {
            console.log(
              ` [${new Date().toISOString()}] Data changed for ${gameid}`
            );

            // IMMEDIATE: Update cache and send betting data right away
            cachedData[cacheKey] = {
              data: newBettingData.data,
              raw: newBettingData,
              lastUpdated: Date.now(),
            };

            // Send casino_update
            clients.forEach((client) => {
              if (
                client.gameid === gameid &&
                client.apitype === apitype &&
                client.ws.readyState === 1
              ) {
                client.ws.send(
                  JSON.stringify({
                    type: 'casino_update',
                    gameid,
                    apitype,
                    data: newBettingData.data,
                  })
                );
              }
            });

            //  REMOVED: casino_result_update WebSocket messages
            // Frontend now uses API calls (fetchCasinoResultData) when round changes
            // This is triggered by useRef detection in WebSocket handler
            // Benefits: Reduced bandwidth, no duplicate messages, cleaner logs
          }
        }
      }
    } catch (error) {
      console.error(
        `Casino betting data polling error for ${gameid} (${apitype}):`,
        error.message
      );
    }
  }
};

// setupWebSocket is called with your HTTP server so that the WebSocket server can share the same port
export const setupWebSocket = (server) => {
  // Create a WebSocket server (wss) that listens for client connections
  const wss = new WebSocketServer({ server });

  // Every time someone connects we:
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    //  Create client object with roundId and userId
    let client = {
      ws,
      gameid: null,
      apitype: null,
      roundId: null,
      userId: null,
    };
    clients.push(client);

    //  Complete message handler
    ws.on('message', (message) => {
      try {
        const jsonStr = message.toString();
        const data = JSON.parse(jsonStr);

        // Register userId for account-level updates (balance, exposure, open bets, cashout)
        if (data.type === 'register' && data.userId) {
          client.userId = data.userId;
          console.log(`[WS] Registered userId: ${data.userId}`);
        }

        if (data.type === 'subscribe' && data.gameid) {
          client.gameid = data.gameid;
          client.apitype = data.apitype || 'cricket';
          client.roundId = data.roundId || null;
          client.userId = data.userId || null;

          //  ESSENTIAL: Clear only betting/results cache, keep deduplication cache
          if (client.apitype === 'casino') {
            const bettingCacheKey = `betting_${client.gameid}_casino`;
            const resultsCacheKey = `results_${client.gameid}_casino`;
            delete cachedData[bettingCacheKey];
            delete cachedData[resultsCacheKey];
            //  DON'T clear deduplication cache keys (message_*, results_*)
            console.log(
              `[CACHE] Cleared betting/results cache for ${client.gameid} (kept deduplication cache)`
            );
          }

          // Push cached data immediately so client doesn't wait for next poll tick
          const cacheKey =
            client.apitype === 'casino'
              ? `betting_${client.gameid}_casino`
              : `${client.gameid}_${client.apitype}`;
          if (cachedData[cacheKey]?.data && client.ws.readyState === 1) {
            const msgType =
              client.apitype === 'casino' ? 'casino_update' : 'bettingData';
            client.ws.send(
              JSON.stringify({
                type: msgType,
                gameid: client.gameid,
                apitype: client.apitype,
                data: cachedData[cacheKey].data,
              })
            );
          }

          //  FIX: Subscribe to live score socket for this game
          subscribeToLiveScore(client.gameid, client.apitype);
        }
      } catch (err) {
        console.error(' [WS] Invalid message:', err.message);
      }
    });

    // Remove the disconnected client from the clients array
    ws.on('close', () => {
      clients = clients.filter((c) => c.ws !== ws);
      console.log(' WebSocket client disconnected');
    });
  });

  // Start all polling intervals
  setInterval(pollBettingData, 1000);
  setInterval(pollCasinoBettingData, 1000);
};

//  REMOVED: sendCasinoResultUpdate function
// Frontend now uses API calls (fetchCasinoResultData) triggered by useRef round detection
// This function is no longer needed and has been replaced with the optimized approach

//FUNCTION THAT SENDS BALANCE UPDATES TO ALL THE CONNECTED CLIENTS
export const sendBalanceUpdates = (userId, newBalance) => {
  //Check if the value is changed
  const lastBalance = lastSentValues.balance.get(userId);

  if (lastBalance === newBalance) {
    console.log('Skipped-No Change');
    return;
  }

  let sentCount = 0;

  //Send only if the Value is Changed
  clients.forEach((client) => {
    if (client.ws.readyState === 1) {
      client.ws.send(
        JSON.stringify({
          type: 'balance_update',
          userId: userId,
          newBalance: newBalance,
        })
      );
      sentCount++;
     
    }
  });

  //Update Cache
  lastSentValues.balance.set(userId, newBalance);


};

//FUNCTIONS THAT SEND EXPOSURE UPDATES TO ALL THE CONNECTED CLIENTS
export const sendExposureUpdates = (userId, newExposure) => {
  const lastExposure = lastSentValues.exposure.get(userId);
  if (lastExposure === newExposure) {
    return;
  }

  let sentCount = 0;

  //Send only if the Value is Changed
  clients.forEach((client) => {
    if (client.ws.readyState === 1) {
      client.ws.send(
        JSON.stringify({
          type: 'exposure_update',
          userId: userId,
          newExposure: newExposure,
        })
      );
      sentCount++;
    }
  });

  //Update Cache
  lastSentValues.exposure.set(userId, newExposure);
};

//FUNCTION THAT UPDATES OPEN BETS TO ALL THE CONNECTED CLIENTS AFTER BET SETTLEMENT
export const sendOpenBetsUpdates = (userId, newOpenBets) => {
  let sentCount = 0;
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === 1) {
      client.ws.send(
        JSON.stringify({
          type: 'open_bets_update',
          userId: userId,
          newOpenBets: newOpenBets,
        })
      );
      sentCount++;
    }
  });
};

//FUNCTION THAT SENDS CASHOUT UPDATES TO SPECIFIC USER'S CONNECTED CLIENTS
export const sendCashoutUpdates = (userId, cashoutData) => {
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === 1) {
      client.ws.send(
        JSON.stringify({
          type: 'cashout_update',
          userId,
          bets: cashoutData, // array of { betId, cashoutValue }
        })
      );
    }
  });
};

// In short — the flow
// Client connects → added to clients
// Client subscribes → sends { type: "subscribe", gameid, apitype }
// Server subscribes to live score socket (1 connection per game + apitype)
// Server polls API every 3 seconds for each unique subscription
// If data changed, sends update to subscribed clients
// If client disconnects, they're removed from the list
