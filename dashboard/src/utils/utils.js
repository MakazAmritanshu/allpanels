const getRank = (card) => card.replace(/[^0-9AJQK]/g, ''); // Extract rank
const getSuit = (card) => card.slice(-1); // Extract suit letter

const rankOrder = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
];

const getRankCounts = (hand) => {
  const counts = {};
  hand.forEach((card) => {
    const rank = getRank(card);
    counts[rank] = (counts[rank] || 0) + 1;
  });
  return counts;
};

const isPair = (hand) => {
  const counts = Object.values(getRankCounts(hand));
  return counts.filter((c) => c === 2).length === 1;
};

const isTwoPair = (hand) => {
  const counts = Object.values(getRankCounts(hand));
  return counts.filter((c) => c === 2).length === 2;
};

const isFlush = (hand) => {
  const suits = hand.map(getSuit);
  return new Set(suits).size === 1;
};

const isStraight = (hand) => {
  const indexes = hand
    .map((c) => rankOrder.indexOf(getRank(c)))
    .sort((a, b) => a - b);
  if (indexes.toString() === '0,1,12') return true;
  return indexes[2] - indexes[0] === 2 && new Set(indexes).size === 3;
};

const isStraightFlush = (hand) => isStraight(hand) && isFlush(hand);

const isThreeOfAKind = (hand) => {
  const ranks = hand.map(getRank);
  const counts = {};
  for (const rank of ranks) {
    counts[rank] = (counts[rank] || 0) + 1;
  }
  return Object.values(counts).some((count) => count === 3);
};
const isFourOfAKind = (hand) => {
  const counts = Object.values(getRankCounts(hand));
  return counts.includes(4);
};

const isFullHouse = (hand) => {
  const counts = Object.values(getRankCounts(hand));
  return counts.includes(3) && counts.includes(2);
};

const putlaCheck = (hand) => {
  const ranks = hand.map(getRank);
  const faceCards = ['J', 'Q', 'K'];
  return {
    putla1: ranks.filter((r) => faceCards.includes(r)).length === 1,
    putla2: ranks.filter((r) => faceCards.includes(r)).length === 2,
    putla3: ranks.filter((r) => faceCards.includes(r)).length === 3,
  };
};

const isLoveMarriage = (hand) => {
  const ranks = hand.map(getRank);
  const suits = hand.map(getSuit);

  // Check if Q and K are both present
  const hasQ = ranks.includes('Q');
  const hasK = ranks.includes('K');

  // Check if Q and K have the same suit
  if (hasQ && hasK) {
    const suitOfQ = suits[ranks.indexOf('Q')];
    const suitOfK = suits[ranks.indexOf('K')];
    return suitOfQ === suitOfK;
  }
  return false;
};

const isBfLoveGf = (hand) => {
  const ranks = hand.map(getRank);
  const suits = hand.map(getSuit);

  const hasJ = ranks.includes('J');
  const hasQ = ranks.includes('Q');

  if (hasJ && hasQ) {
    const suitOfJ = suits[ranks.indexOf('J')];
    const suitOfQ = suits[ranks.indexOf('Q')];
    return suitOfJ === suitOfQ;
  }
  return false;
};

const getHighCard = (hand) => {
  if (!hand || hand.length === 0) return 0;

  const ranks = hand.map(getRank);
  const values = ranks.map((rank) => {
    switch (rank) {
      case 'A':
        return 14;
      case 'K':
        return 13;
      case 'Q':
        return 12;
      case 'J':
        return 11;
      default:
        return parseInt(rank) || 0;
    }
  });

  return Math.max(...values);
};

const compareHighCards = (hand1, hand2) => {
  const high1 = getHighCard(hand1);
  const high2 = getHighCard(hand2);

  return {
    A: high1 > high2,
    B: high2 > high1,
  };
};

// Baccarat specific pair functions
const isBaccaratPlayerPair = (playerCards) => {
  if (!playerCards || playerCards.length < 2) return false;
  return getRank(playerCards[0]) === getRank(playerCards[1]);
};

const isBaccaratBankerPair = (bankerCards) => {
  if (!bankerCards || bankerCards.length < 2) return false;
  return getRank(bankerCards[0]) === getRank(bankerCards[1]);
};

const getCardNumericValue = (card) => {
  const rank = getRank(card);

  switch (rank) {
    case 'A':
      return 1;
    case 'J':
      return 11;
    case 'Q':
      return 12;
    case 'K':
      return 13;
    default:
      return Number(rank);
  }
};

const isEven = (card) => {
  const val = getCardNumericValue(card);
  return Number.isFinite(val) && val % 2 === 0;
};

const isOdd = (card) => {
  const val = getCardNumericValue(card);
  return Number.isFinite(val) && val % 2 === 1;
};

const gameSpecificLabels = {
  teen20: {
    pair: 'PAIR (DUBBLE) 1:4',
    flush: 'FLUSH (COLOR) 1:8',
    straight: 'STRAIGHT (ROWN) 1:14',
    straightFlush: 'STRAIGHT FLUSH (PAKKI ROWN) 1:40',
    threeOfKind: 'TRIO (TEEN) 1:75',
    putla1: 'PUTLA (1 PICTURE IN GAME) 1:0.70',
    putla2: 'PUTLA (2 PICTURE IN GAME) 1:4',
    putla3: 'PUTLA (3 PICTURE IN GAME) 1:25',
    loveMarriage: 'LOVE MARRIAGE (KING + QUEEN SAME SUIT)',
    bfLoveGf: 'BF LOVE GF (J + Q SAME SUIT)',
  },
  teensin: {
    flush: 'COLOR PLUS',
  },
  dt202: {
    dragonOddEven: 'DRAGON ODD/EVEN',
    tigerOddEven: 'TIGER ODD/EVEN',
  },
};

const defaultBetTypeLabels = {
  winner: 'WINNER',
  pair: 'PAIR',
  twoPair: 'TWO PAIR',
  flush: 'FLUSH',
  straight: 'STRAIGHT',
  straightFlush: 'STRAIGHT FLUSH',
  threeOfKind: 'THREE OF A KIND',
  fourOfKind: 'FOUR OF A KIND',
  fullHouse: 'FULL HOUSE',
  highCard: 'HIGH CARD',
  lucky9: 'LUCKY 9',
  baccaratPair: 'PAIR',
};

const formatBetType = (betType, gameId = null) => {
  // Try game-specific label first
  if (
    gameId &&
    gameSpecificLabels[gameId] &&
    gameSpecificLabels[gameId][betType]
  ) {
    return gameSpecificLabels[gameId][betType];
  }
  // Fallback to default labels
  return defaultBetTypeLabels[betType] || betType.toUpperCase();
};

const GameBetTypes = {
  teen20: [
    'pair',
    'flush',
    'straight',
    'straightFlush',
    'threeOfKind',
    'putla1',
    'putla2',
    'putla3',
    'loveMarriage',
    'bfLoveGf',
  ],
  poker20: [
    'pair',
    'twoPair',
    'threeOfKind',
    'straight',
    'flush',
    'fullHouse',
    'fourOfKind',
    'straightFlush',
  ],
  teensin: ['highCard', 'pair', 'flush'],
  baccarat: ['baccaratPair'],
  baccarat2: ['baccaratPair'],
  dt202: ['dragonOddEven', 'tigerOddEven'],
  default: [],
};
const getAllowedBetTypes = (gameId) => {
  return GameBetTypes[gameId] || GameBetTypes.default;
};

const GameConfig = {
  // 7-card games with poison
  poison: {
    totalCards: 7,
    distribution: {
      poison: [0],
      playerA: [1, 3, 5],
      playerB: [2, 4, 6],
    },
  },
  poison20: {
    totalCards: 7,
    distribution: {
      poison: [0],
      playerA: [1, 3, 5],
      playerB: [2, 4, 6],
    },
  },
  joker20: {
    totalCards: 7,
    distribution: {
      poison: [0],
      playerA: [1, 3, 5],
      playerB: [2, 4, 6],
    },
  },

  // 6-card teen games
  teen20c: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teen41: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teen42: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teen33: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teen32: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teen: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teen6: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teen20: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teensin: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teenmuf: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teen20b: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },
  teen3: {
    totalCards: 6,
    distribution: {
      playerA: [0, 2, 4],
      playerB: [1, 3, 5],
    },
  },

  // 9-card poker games
  poker: {
    totalCards: 9,
    distribution: {
      playerA: [0, 1],
      playerB: [2, 3],
      board: [4, 5, 6, 7, 8],
    },
  },
  poker20: {
    totalCards: 9,
    distribution: {
      playerA: [0, 1],
      playerB: [2, 3],
      board: [4, 5, 6, 7, 8],
    },
  },
  // 2-card teenpatti games
  patti2: {
    totalCards: 4,
    distribution: {
      playerA: [0, 2],
      playerB: [1, 3],
    },
  },
  // 6-card baccarat games
  baccarat: {
    totalCards: 6,
    distribution: {
      player: [4, 2, 0],
      banker: [1, 3, 5],
    },
  },
  baccarat2: {
    totalCards: 6,
    distribution: {
      player: [4, 2, 0],
      banker: [1, 3, 5],
    },
  },
  dt202: {
    totalCards: 2,
    distribution: {
      dragon: [0],
      tiger: [1],
    },
  },
  dt6: {
    totalCards: 2,
    distribution: {
      dragon: [0],
      tiger: [1],
    },
  },
  dt20: {
    totalCards: 2,
    distribution: {
      dragon: [0],
      tiger: [1],
    },
  },
  card32: {
    totalCards: 4,
    distribution: {
      player8: [0],
      player9: [1],
      player10: [2],
      player11: [3],
    },
  },
  card32eu: {
    totalCards: 4,
    distribution: {
      player8: [0],
      player9: [1],
      player10: [2],
      player11: [3],
    },
  },
};

const distributeCards = (cards, gameName, gameId = null) => {
  if (!cards || !Array.isArray(cards)) {
    console.error('Invalid cards array:', cards);
    return null;
  }

  let gameType = gameId || gameName;

  if (!gameType && gameId) {
    gameType = gameId;
  }

  const config = GameConfig[gameType];

  if (!config) {
    console.warn(
      `No configuration found for game: ${gameType}, using default teen distribution`
    );
    // Default fallback for unknown games
    return {
      playerA: [cards[0], cards[2], cards[4]],
      playerB: [cards[1], cards[3], cards[5]],
      poison: cards.length === 7 ? [cards[0]] : null,
      board: null,
    };
  }

  const { distribution, totalCards } = config;

  // Validate card count
  if (cards.length !== totalCards) {
    console.warn(
      `Expected ${totalCards} cards for ${gameType}, got ${cards.length}`
    );
  }

  const result = {};

  // Distribute cards based on configuration
  Object.entries(distribution).forEach(([player, indices]) => {
    result[player] = indices.map((index) => cards[index]).filter(Boolean);
  });
  if (gameType === 'dt202' || gameType === 'dt6' || gameType === 'dt20') {
    result.playerA = result.dragon;
    result.playerB = result.tiger;
  }
  return result;
};

const evaluateSideBets = (distributedCards, gameType) => {
  const result = {};

  // Handle different player names based on game type
  const playerA =
    distributedCards.playerA ||
    distributedCards.player ||
    distributedCards.dragon;
  const playerB =
    distributedCards.playerB ||
    distributedCards.banker ||
    distributedCards.tiger;
  const board = distributedCards.board || [];

  if (playerA && playerB) {
    // Calculate all possible side bets
    const allSideBets = {
      pair: {
        A: isPair([...playerA, ...board]),
        B: isPair([...playerB, ...board]),
      },
      twoPair: {
        A: isTwoPair([...playerA, ...board]),
        B: isTwoPair([...playerB, ...board]),
      },
      flush: {
        A: isFlush([...playerA, ...board]),
        B: isFlush([...playerB, ...board]),
      },
      straight: {
        A: isStraight([...playerA, ...board]),
        B: isStraight([...playerB, ...board]),
      },
      straightFlush: {
        A: isStraightFlush([...playerA, ...board]),
        B: isStraightFlush([...playerB, ...board]),
      },
      threeOfKind: {
        A: isThreeOfAKind([...playerA, ...board]),
        B: isThreeOfAKind([...playerB, ...board]),
      },
      putla1: {
        A: putlaCheck([...playerA, ...board]).putla1,
        B: putlaCheck([...playerB, ...board]).putla1,
      },
      putla2: {
        A: putlaCheck([...playerA, ...board]).putla2,
        B: putlaCheck([...playerB, ...board]).putla2,
      },
      putla3: {
        A: putlaCheck([...playerA, ...board]).putla3,
        B: putlaCheck([...playerB, ...board]).putla3,
      },
      loveMarriage: {
        A: isLoveMarriage([...playerA, ...board]),
        B: isLoveMarriage([...playerB, ...board]),
      },
      bfLoveGf: {
        A: isBfLoveGf([...playerA, ...board]),
        B: isBfLoveGf([...playerB, ...board]),
      },
      fullHouse: {
        A: isFullHouse([...playerA, ...board]),
        B: isFullHouse([...playerB, ...board]),
      },
      fourOfKind: {
        A: isFourOfAKind([...playerA, ...board]),
        B: isFourOfAKind([...playerB, ...board]),
      },
      highCard: compareHighCards(
        [...playerA, ...board],
        [...playerB, ...board]
      ),
      baccaratPair: {
        A: isBaccaratPlayerPair(playerA),
        B: isBaccaratBankerPair(playerB),
      },
      dragonOddEven: {
        A: isEven(playerA[0]),
        B: isOdd(playerA[0]),
      },
      tigerOddEven: {
        A: isEven(playerB[0]),
        B: isOdd(playerB[0]),
      },
    };

    // Get allowed bet types for this game
    const allowedBetTypes = getAllowedBetTypes(gameType);

    // Filter results to only include allowed bet types
    allowedBetTypes.forEach((betType) => {
      if (allSideBets[betType]) {
        result[betType] = allSideBets[betType];
      }
    });
  }

  return result;
};

export { distributeCards, evaluateSideBets, formatBetType };
