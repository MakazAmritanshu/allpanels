import poison20 from '../../assets/casinoRules/joker3.jpg';

const TEENPATTI_RULES = [
  'This game is played with a standard 52-card deck.',
  'Each player gets 3 cards.',
  'Ranking: Trail > Straight Flush > Straight > Flush > Pair > High Card.',
  'Highest hand wins.',
  'Side bets (Pair, Flush, Straight, etc.) are optional and pay at fixed odds.',
];

const BACCARAT_RULES = [
  'Player and Banker each get 2 cards.',
  'Closest to 9 wins.',
  'Face cards and 10s count as 0.',
  'Tie pays 8:1.',
  'Third card is drawn automatically based on standard Baccarat rules.',
];

const DRAGON_TIGER_RULES = [
  'Single card dealt to Dragon and Tiger.',
  'Higher card wins.',
  'Tie pays 8:1.',
  'Suits are not considered unless betting on suit markets.',
];

const CARD32_RULES = [
  '32 cards are used (8-Ace of each suit).',
  'Each player receives one card.',
  'Highest card wins for that player.',
  'Total points across rounds determine the winner.',
];

const LUCKY7_RULES = [
  'A single card is drawn.',
  'Bet on whether the card is Low (A-6), High (8-K), or exactly 7 (Tie).',
  'Card value of 7 results in a Tie.',
  'You can also bet on Odd/Even, Red/Black.',
];

const POKER_RULES = [
  'This game is played with a standard 52-card deck.',
  '5 community cards and 2 hole cards per player.',
  'Best 5-card hand wins.',
  'Ranking: Royal Flush > Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > Pair > High Card.',
];

export const GAME_RULES = {
  // TeenPatti variants
  teen20: { title: '20-20 TeenPatti', rules: TEENPATTI_RULES },
  teen20b: { title: '20-20 TeenPatti B', rules: TEENPATTI_RULES },
  teen20c: { title: '20-20 TeenPatti C', rules: TEENPATTI_RULES },
  teen20v1: { title: '20-20 TeenPatti VIP', rules: TEENPATTI_RULES },
  teenmuf: {
    title: 'Muflis TeenPatti',
    rules: [
      ...TEENPATTI_RULES.slice(0, 2),
      'Lowest hand wins (reverse ranking of normal TeenPatti).',
      'Trail is the weakest, High Card is the strongest.',
    ],
  },
  teen: { title: 'TeenPatti', rules: TEENPATTI_RULES },
  teen6: { title: 'TeenPatti 6 Player', rules: TEENPATTI_RULES },
  teen62: { title: 'TeenPatti 6 Player 2', rules: TEENPATTI_RULES },
  teen9: { title: 'TeenPatti 9', rules: TEENPATTI_RULES },
  teen41: { title: 'TeenPatti 4-1', rules: TEENPATTI_RULES },
  teen42: { title: 'TeenPatti 4-2', rules: TEENPATTI_RULES },
  teenjoker: {
    title: 'Joker TeenPatti',
    rules: [
      ...TEENPATTI_RULES,
      'One card is designated as Joker (wild card).',
      'Joker can substitute any card to form the best hand.',
    ],
  },
  joker20: {
    title: '20-20 Joker TeenPatti',
    rules: [...TEENPATTI_RULES, 'One card is designated as Joker (wild card).'],
  },
  patti2: { title: 'TeenPatti 2', rules: TEENPATTI_RULES },
  poison: { title: 'Poison', rules: TEENPATTI_RULES },
  poison20: {
    title: 'Poison 20',
    img: poison20,
    rules: [
      'Welcome to Teenpatti Poison 20-20, a new variation of Teenpatti.As Teenpatti games are becoming more and more famous and popular on our platforms, we are excited to introduce you to Teenpatti Poison 20-20. The game follows the same standard rules of Teenpatti but at the beginning of the round the dealer draws a Poison card before dealing to the players. The Poison card is toxic and makes the player lose as soon as any player gets it. If no Poison card is dealt then the game continues as per Teenpatti standard rules.',
    ],
  },

  // Baccarat
  baccarat: { title: 'Baccarat', rules: BACCARAT_RULES },
  baccarat2: { title: 'Baccarat 2', rules: BACCARAT_RULES },

  // Dragon Tiger
  dt6: { title: 'Dragon Tiger', rules: DRAGON_TIGER_RULES },
  dt20: { title: 'Dragon Tiger 20-20', rules: DRAGON_TIGER_RULES },
  dt202: { title: 'Dragon Tiger 20-20 (2)', rules: DRAGON_TIGER_RULES },

  // 32 Cards
  card32: { title: '32 Cards', rules: CARD32_RULES },
  card32eu: { title: '32 Cards EU', rules: CARD32_RULES },

  // Lucky 7
  lucky7: { title: 'Lucky 7', rules: LUCKY7_RULES },
  lucky7eu: { title: 'Lucky 7 EU', rules: LUCKY7_RULES },
  lucky7eu2: { title: 'Lucky 7 EU 2', rules: LUCKY7_RULES },

  // Poker
  poker: { title: 'Poker', rules: POKER_RULES },
  poker20: { title: 'Poker 20-20', rules: POKER_RULES },
};

export const getGameRules = (gameid) => {
  return (
    GAME_RULES[gameid] || {
      title: 'Game Rules',
      img: '',
      rules: ['Rules not available for this game.'],
    }
  );
};
