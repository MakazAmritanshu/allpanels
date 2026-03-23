// Quick bet amount options with chip images
export const QUICK_AMOUNTS = [
  { amt: 100, img: 'chips1.svg' },
  { amt: 200, img: 'chips1.svg' },
  { amt: 500, img: 'chips1.svg' },
  { amt: 5000, img: 'chips5.svg' },
  { amt: 10000, img: 'chips10.svg' },
  { amt: 25000, img: 'chips20.svg' },
  { amt: 50000, img: 'chips1k.svg' },
  { amt: 100000, img: 'chips1k.svg' },
];

// Games that should only show Player A and Player B
export const TWO_PLAYER_GAMES = [
  'teen20',
  'teenmuf',
  'poison',
  'poison20',
  'teen20c',
  'teen20b',
  'joker20',
  'teen41',
  'teen42',
  'teen',
  'teen6',
  'poker',
  'patti2',
  'teenjoker',
  'teen20v1',
];

// Teen20 side bet sections (static data)
export const TEEN20_SIDE_BETS = [
  {
    title: 'PAIR ( DUBBLE )',
    ratio: '1:4',
    players: [
      {
        sid: 'pair_player_a',
        nat: 'Player A ( Pair )',
        b: 4,
        amount: 500000,
        subtype: 'pair',
      },
      {
        sid: 'pair_player_b',
        nat: 'Player B ( Pair )',
        b: 4,
        amount: 500000,
        subtype: 'pair',
      },
    ],
  },
  {
    title: 'FLUSH ( COLOR )',
    ratio: '1:8',
    players: [
      {
        sid: 'flush_player_a',
        nat: 'Player A ( Flush )',
        b: 8,
        amount: 500000,
        subtype: 'flush',
      },
      {
        sid: 'flush_player_b',
        nat: 'Player B ( flush )',
        b: 8,
        amount: 500000,
        subtype: 'flush',
      },
    ],
  },
  {
    title: 'STRAIGHT ( ROWN )',
    ratio: '1:14',
    players: [
      {
        sid: 'Straight_player_a',
        nat: 'Player A ( Straight )',
        b: 14,
        amount: 500000,
        subtype: 'straight',
      },
      {
        sid: 'Straight_player_b',
        nat: 'Player B ( Straight )',
        b: 14,
        amount: 500000,
        subtype: 'staright',
      },
    ],
  },
  {
    title: 'STRAIGHT FLUSH ( PAKKI ROWN )',
    ratio: ' 1:40',
    players: [
      {
        sid: 'Straight_flush_a',
        nat: 'Player A ( Straight Flush )',
        b: 40,
        amount: 500000,
        subtype: 'straightFlush',
      },
      {
        sid: 'Straight_flush_b',
        nat: 'Player B ( Straight Flush )',
        b: 40,
        amount: 500000,
        subtype: 'straightFlush',
      },
    ],
  },
  {
    title: 'TRIO ( TEEN )',
    ratio: '1:75',
    players: [
      {
        sid: 'player_trio_a',
        nat: 'Player A ( Trio )',
        b: 75,
        amount: 500000,
        subtype: 'trio',
      },
      {
        sid: 'player_trio_b',
        nat: 'Player B ( Trio )',
        b: 75,
        amount: 500000,
        subtype: 'trio',
      },
    ],
  },
  {
    title: 'PUTLA ( 1 PICTURE IN GAME )',
    ratio: '1:0.70',
    players: [
      {
        sid: 'player_putla1_a',
        nat: 'Player A ( Putla 1 )',
        b: 1.7,
        amount: 1000000,
        subtype: 'putla1',
      },
      {
        sid: 'player_putla1_b',
        nat: 'Player B ( Putla 1 )',
        b: 1.7,
        amount: 1000000,
        subtype: 'putla1',
      },
    ],
  },
  {
    title: 'PUTLA ( 2 PICTURE IN GAME )',
    ratio: '1:4',
    players: [
      {
        sid: 'player_putla2_a',
        nat: 'Player A ( Putla 2 )',
        b: 4,
        amount: 1000000,
        subtype: 'putla2',
      },
      {
        sid: 'player_putla2_b',
        nat: 'Player B ( Putla 2 )',
        b: 4,
        amount: 1000000,
        subtype: 'putla2',
      },
    ],
  },
  {
    title: 'PUTLA ( 3 PICTURE IN GAME )',
    ratio: '1:25',
    players: [
      {
        sid: 'player_putla3_a',
        nat: 'Player A ( Putla 3 )',
        b: 25,
        amount: 1000000,
        subtype: 'putla3',
      },
      {
        sid: 'player_putla3_b',
        nat: 'Player B ( Putla 3 )',
        b: 25,
        amount: 1000000,
        subtype: 'putla3',
      },
    ],
  },
  {
    title: 'LOVE MARRIAGE ( Q & K WITH SAME SUIT )',
    ratio: '1:25',
    players: [
      {
        sid: 'player_qk_a',
        nat: 'Player A ( Queen & King )',
        b: 25,
        amount: 500000,
        subtype: 'loveMarriage',
      },
      {
        sid: 'player_qk_b',
        nat: 'Player B ( Queen & King )',
        b: 25,
        amount: 500000,
        subtype: 'loveMarriage',
      },
    ],
  },
  {
    title: 'BF LOVE GF ( J & Q WITH SAME SUIT )',
    ratio: '1:25',
    players: [
      {
        sid: 'player_jq_a',
        nat: 'Player A ( Jack & Queen )',
        b: 25,
        amount: 500000,
        subtype: 'bfAndGf',
      },
      {
        sid: 'player_jq_b',
        nat: 'Player B ( Jack & Queen )',
        b: 25,
        amount: 500000,
        subtype: 'bfAndGf',
      },
    ],
  },
];

// Winner labels for different game types
export const getWinnerMap = (gameid) => {
  if (gameid === 'baccarat' || gameid === 'baccarat2') {
    return {
      1: 'Player',
      2: 'Banker',
      3: 'Tie',
    };
  }
  return {
    1: 'Player A',
    2: 'Player B',
  };
};

// Result display labels
export const getResultLabel = (gameid, win) => {
  const isBaccarat = gameid === 'baccarat' || gameid === 'baccarat2';

  if (isBaccarat) {
    switch (win) {
      case '1':
        return 'P';
      case '2':
        return 'B';
      case '3':
        return 'T';
      default:
        return 'T';
    }
  } else {
    switch (win) {
      case '1':
        return 'A';
      case '2':
        return 'B';
      default:
        return 'T';
    }
  }
};

// Result background colors
export const getResultBgColor = (gameid, win) => {
  const isBaccarat = gameid === 'baccarat' || gameid === 'baccarat2';

  if (isBaccarat) {
    switch (win) {
      case '1':
        return 'bg-[#428bca] text-white';
      case '2':
        return 'bg-[#d9534f] text-white';
      case '3':
        return 'bg-[#5cb85c] text-white';
      default:
        return 'bg-gray-400';
    }
  } else {
    switch (win) {
      case '1':
        return 'bg-[#72bbef]';
      case '2':
        return 'bg-[#f9a9ba]';
      default:
        return 'bg-gray-400';
    }
  }
};

// Video stream timeout (ms)
export const VIDEO_LOAD_TIMEOUT = 20000;

// Winner popup display duration (ms)
export const WINNER_POPUP_DURATION = 5000;

// Default bet odds
export const DEFAULT_BET_ODDS = 1.29;

// Default max bet amount
export const DEFAULT_MAX_AMOUNT = 100000;
