import React, { useState, useEffect } from 'react';
import Casino from './Casino';
import { useParams } from 'react-router-dom';
const casinosold = [
  {
    id: 1,
    slug: 'worli3',
    name: 'Matka',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/worli3.gif',
  },
  {
    id: 2,
    slug: 'teen62',
    name: 'V VIP Teenpatti 1-day',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen62.gif',
  },
  {
    id: 3,
    slug: 'dolidana',
    name: 'Dolidana',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dolidana.gif',
  },
  {
    id: 4,
    slug: 'mogambo',
    name: 'Mogambo',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/mogambo.gif',
  },
  {
    id: 5,
    slug: 'teen20v1',
    name: '20-20 Teenpatti VIP1',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20v1.jpg',
  },
  {
    id: 6,
    slug: 'lucky5',
    name: 'Lucky 6',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky5.jpg',
  },
  {
    id: 7,
    slug: 'roulette12',
    name: 'Beach Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/roulette12.jpg',
  },
  {
    id: 8,
    slug: 'roulette13',
    name: 'Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/roulette13.jpg',
  },
  {
    id: 9,
    slug: 'roulette11',
    name: 'Golden Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/roulette11.jpg',
  },
  {
    id: 10,
    slug: 'poison',
    name: 'Teenpatti Poison One Day',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poison.jpg',
  },
  {
    id: 11,
    slug: 'teenunique',
    name: 'Unique Teenpatti',
    category: 'Teenpatti',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/teenunique.jpg',
  },
  {
    id: 12,
    slug: 'poison20',
    name: 'Teenpatti Poison 20-20',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poison20.jpg',
  },
  {
    id: 13,
    slug: 'joker120',
    name: 'Unlimited Joker 20-20',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/joker120.jpg',
  },
  {
    id: 14,
    slug: 'joker20',
    name: 'Teenpatti Joker 20-20',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/joker20.jpg',
  },
  {
    id: 15,
    slug: 'joker1',
    name: 'Unlimited Joker Oneday',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/joker1.jpg',
  },
  {
    id: 16,
    slug: 'teen20c',
    name: '20-20 Teenpatti C',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20c.jpg',
  },
  {
    id: 17,
    slug: 'btable2',
    name: 'Bollywood Casino 2',
    category: 'Bollywood',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/btable2.jpg',
  },
  {
    id: 18,
    slug: 'ourroullete',
    name: 'Unique Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/ourroullete.jpg',
  },
  {
    id: 19,
    slug: 'superover3',
    name: 'Mini Superover',
    category: 'Others',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/superover3.jpg',
  },
  {
    id: 20,
    slug: 'goal',
    name: 'Goal',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/goal.jpg',
  },
  {
    id: 21,
    slug: 'ab4',
    name: 'ANDAR BAHAR 150 cards',
    category: 'Andar Bahar',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/ab4.jpg',
  },
  {
    id: 22,
    slug: 'lucky15',
    name: 'Lucky 15',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky15.jpg',
  },
  {
    id: 23,
    slug: 'superover2',
    name: 'Super Over2',
    category: 'Others',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/superover2.jpg',
  },
  {
    id: 24,
    slug: 'teen41',
    name: 'Queen Top Open Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen41.jpg',
  },
  {
    id: 25,
    slug: 'teen42',
    name: 'Jack Top Open Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen42.jpg',
  },
  {
    id: 26,
    slug: 'sicbo2',
    name: 'Sic Bo2',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/sicbo2.jpg',
  },
  {
    id: 27,
    slug: 'teen33',
    name: 'Instant Teenpatti 3.0',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen33.jpg',
  },
  {
    id: 28,
    slug: 'sicbo',
    name: 'Sic Bo',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/sicbo.jpg',
  },
  {
    id: 29,
    slug: 'ballbyball',
    name: 'Ball by Ball',
    category: 'Others',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/ballbyball.jpg',
  },
  {
    id: 30,
    slug: 'teen32',
    name: 'Instant Teenpatti 2.0',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen32.jpg',
  },
  {
    id: 31,
    slug: 'teen',
    name: 'Teenpatti 1-day',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen.jpg',
  },
  {
    id: 32,
    slug: 'teen20',
    name: '20-20 Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20.jpg',
  },
  {
    id: 33,
    slug: 'teen9',
    name: 'Teenpatti Test',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen9.jpg',
  },
  {
    id: 34,
    slug: 'teen8',
    name: 'Teenpatti Open',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen8.jpg',
  },
  {
    id: 35,
    slug: 'poker',
    name: 'Poker 1-Day',
    category: 'Poker',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poker.jpg',
  },
  {
    id: 36,
    slug: 'poker20',
    name: '20-20 Poker',
    category: 'Poker',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poker20.jpg',
  },
  {
    id: 37,
    slug: 'poker6',
    name: 'Poker 6 Players',
    category: 'Poker',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poker6.jpg',
  },
  {
    id: 38,
    slug: 'baccarat',
    name: 'Baccarat',
    category: 'Baccarat',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/baccarat.jpg',
  },
  {
    id: 39,
    slug: 'baccarat2',
    name: 'Baccarat 2',
    category: 'Baccarat',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/baccarat2.jpg',
  },
  {
    id: 40,
    slug: 'dt20',
    name: '20-20 Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dt20.jpg',
  },
  {
    id: 41,
    slug: 'dt6',
    name: '1 Day Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dt6.jpg',
  },
  {
    id: 42,
    slug: 'dtl20',
    name: '20-20 D T L',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dtl20.jpg',
  },
  {
    id: 43,
    slug: 'dt202',
    name: '20-20 Dragon Tiger 2',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dt202.jpg',
  },
  {
    id: 44,
    slug: 'card32',
    name: '32 Cards A',
    category: '32 Cards',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/card32.jpg',
  },
  {
    id: 45,
    slug: 'card32eu',
    name: '32 Cards B',
    category: '32 Cards',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/card32eu.jpg',
  },
  {
    id: 46,
    slug: 'ab20',
    name: 'Andar Bahar',
    category: 'Andar Bahar',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/ab20.jpg',
  },
  {
    id: 47,
    slug: 'abj',
    name: 'Andar Bahar 2',
    category: 'Andar Bahar',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/abj.jpg',
  },
  {
    id: 48,
    slug: 'lucky7',
    name: 'Lucky 7 - A',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky7.jpg',
  },
  {
    id: 49,
    slug: 'lucky7eu',
    name: 'Lucky 7 - B',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky7eu.jpg',
  },
  {
    id: 50,
    slug: '3cardj',
    name: '3 Cards Judgement',
    category: '3 Card Judgement',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/3cardj.jpg',
  },
];

const casinos = [
  // Teenpatti
  {
    id: 1,
    slug: 'teen62',
    name: 'V VIP Teenpatti 1-day',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen62.gif',
  },
  // {
  //   id: 2,
  //   slug: 'teen20v1',
  //   name: '20-20 Teenpatti VIP1',
  //   category: 'Teenpatti',
  //   image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20v1.jpg',
  // },
  {
    id: 3,
    slug: 'poison',
    name: 'Teenpatti Poison One Day',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poison.jpg',
  },
  // {
  //   id: 4,
  //   slug: 'teenunique',
  //   name: 'Unique Teenpatti',
  //   category: 'Teenpatti',
  //   image:
  //     'https://dataobj.ecoassetsservice.com/casino-icons/lc/teenunique.jpg',
  // },
  {
    id: 4,
    slug: 'teenmuf',
    name: 'Teen Patti Muf',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teenmuf.jpg',
  },
  {
    id: 5,
    slug: 'poison20',
    name: 'Teenpatti Poison 20-20',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poison20.jpg',
  },
  {
    id: 6,
    slug: 'joker120',
    name: 'Unlimited Joker 20-20',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/joker120.jpg',
  },
  {
    id: 7,
    slug: 'joker20',
    name: 'Teenpatti Joker 20-20',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/joker20.jpg',
  },
  {
    id: 8,
    slug: 'joker1',
    name: 'Unlimited Joker Oneday',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/joker1.jpg',
  },
  {
    id: 9,
    slug: 'teen20c',
    name: '20-20 Teenpatti C',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20c.jpg',
  },
  {
    id: 10,
    slug: 'teen41',
    name: 'Queen Top Open Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen41.jpg',
  },
  {
    id: 11,
    slug: 'teen42',
    name: 'Jack Top Open Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen42.jpg',
  },
  {
    id: 12,
    slug: 'teen33',
    name: 'Instant Teenpatti 3.0',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen33.jpg',
  },
  {
    id: 13,
    slug: 'teen32',
    name: 'Instant Teenpatti 2.0',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen32.jpg',
  },
  {
    id: 14,
    slug: 'teen',
    name: 'Teenpatti 1-day',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen.jpg',
  },
  {
    id: 15,
    slug: 'teen20',
    name: '20-20 Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20.jpg',
  },
  {
    id: 16,
    slug: 'teen9',
    name: 'Teenpatti Test',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen9.jpg',
  },
  {
    id: 17,
    slug: 'teen8',
    name: 'Teenpatti Open',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen8.jpg',
  },
  // Others
  {
    id: 18,
    slug: 'worli3',
    name: 'Matka',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/worli3.gif',
  },
  {
    id: 19,
    slug: 'dolidana',
    name: 'Dolidana',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dolidana.gif',
  },
  {
    id: 20,
    slug: 'mogambo',
    name: 'Mogambo',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/mogambo.gif',
  },
  {
    id: 21,
    slug: 'lucky5',
    name: 'Lucky 6',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky5.jpg',
  },
  {
    id: 22,
    slug: 'roulette12',
    name: 'Beach Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/roulette12.jpg',
  },
  {
    id: 23,
    slug: 'roulette13',
    name: 'Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/roulette13.jpg',
  },
  {
    id: 24,
    slug: 'roulette11',
    name: 'Golden Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/roulette11.jpg',
  },
  {
    id: 25,
    slug: 'btable2',
    name: 'Bollywood Casino 2',
    category: 'Bollywood',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/btable2.jpg',
  },
  {
    id: 26,
    slug: 'ourroullete',
    name: 'Unique Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/ourroullete.jpg',
  },
  {
    id: 27,
    slug: 'superover3',
    name: 'Mini Superover',
    category: 'Others',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/superover3.jpg',
  },
  {
    id: 28,
    slug: 'goal',
    name: 'Goal',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/goal.jpg',
  },
  {
    id: 29,
    slug: 'ab4',
    name: 'ANDAR BAHAR 150 cards',
    category: 'Andar Bahar',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/ab4.jpg',
  },
  {
    id: 30,
    slug: 'lucky15',
    name: 'Lucky 15',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky15.jpg',
  },
  {
    id: 31,
    slug: 'superover2',
    name: 'Super Over2',
    category: 'Others',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/superover2.jpg',
  },
  {
    id: 32,
    slug: 'sicbo2',
    name: 'Sic Bo2',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/sicbo2.jpg',
  },
  {
    id: 33,
    slug: 'sicbo',
    name: 'Sic Bo',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/sicbo.jpg',
  },
  {
    id: 34,
    slug: 'ballbyball',
    name: 'Ball by Ball',
    category: 'Others',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/ballbyball.jpg',
  },
  {
    id: 35,
    slug: 'poker',
    name: 'Poker 1-Day',
    category: 'Poker',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poker.jpg',
  },
  {
    id: 36,
    slug: 'poker20',
    name: '20-20 Poker',
    category: 'Poker',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poker20.jpg',
  },
  {
    id: 37,
    slug: 'poker6',
    name: 'Poker 6 Players',
    category: 'Poker',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poker6.jpg',
  },
  {
    id: 38,
    slug: 'baccarat',
    name: 'Baccarat',
    category: 'Baccarat',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/baccarat.jpg',
  },
  {
    id: 39,
    slug: 'baccarat2',
    name: 'Baccarat 2',
    category: 'Baccarat',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/baccarat2.jpg',
  },
  {
    id: 40,
    slug: 'dt20',
    name: '20-20 Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dt20.jpg',
  },
  {
    id: 41,
    slug: 'dt6',
    name: '1 Day Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dt6.jpg',
  },
  {
    id: 42,
    slug: 'dtl20',
    name: '20-20 D T L',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dtl20.jpg',
  },
  {
    id: 43,
    slug: 'dt202',
    name: '20-20 Dragon Tiger 2',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dt202.jpg',
  },
  {
    id: 44,
    slug: 'card32',
    name: '32 Cards A',
    category: '32 Cards',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/card32.jpg',
  },
  {
    id: 45,
    slug: 'card32eu',
    name: '32 Cards B',
    category: '32 Cards',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/card32eu.jpg',
  },
  {
    id: 46,
    slug: 'ab20',
    name: 'Andar Bahar',
    category: 'Andar Bahar',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/ab20.jpg',
  },
  {
    id: 47,
    slug: 'abj',
    name: 'Andar Bahar 2',
    category: 'Andar Bahar',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/abj.jpg',
  },
  {
    id: 48,
    slug: 'lucky7',
    name: 'Lucky 7 - A',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky7.jpg',
  },
  {
    id: 49,
    slug: 'lucky7eu',
    name: 'Lucky 7 - B',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky7eu.jpg',
  },
  {
    id: 50,
    slug: '3cardj',
    name: '3 Cards Judgement',
    category: '3 Card Judgement',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/3cardj.jpg',
  },
];
const casinoCategories = [
  { id: 1, name: 'All Casino' },
  { id: 2, name: 'Roulette' },
  { id: 3, name: 'Teenpatti' },
  { id: 4, name: 'Poker' },
  { id: 5, name: 'Baccarat' },
  { id: 6, name: 'Dragon Tiger' },
  { id: 7, name: '32 Cards' },
  { id: 8, name: 'Andar Bahar' },
  { id: 9, name: 'Lucky 7' },
  { id: 10, name: '3 Card Judgement' },
  { id: 11, name: 'Casino War' },
  { id: 12, name: 'Worli' },
  { id: 13, name: 'Sports' },
  { id: 14, name: 'Bollywood' },
  { id: 15, name: 'Lottery' },
  { id: 16, name: 'Queen' },
  { id: 17, name: 'Race' },
];
function CasinoList() {
  const { category } = useParams();
  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
  }, [category]);
  const [activeCategory, setActiveCategory] = useState(
    category || 'All Casino'
  );

  return (
    <>
      {/* <OurCasino  selectedNav="Our Casino"/> */}
      <div className='flex w-full flex-col md:flex-row md:p-0.5'>
        {/* Categories Bar - Horizontal scrollable on mobile, Vertical sidebar on desktop */}
        <div className='scrollbar-hide bg-primary text-primary md-desktop-bg flex w-full flex-row overflow-x-auto md:w-1/6 md:flex-col md:overflow-x-visible md:overflow-y-auto'>
          {casinoCategories.map((category) => (
            <button
              key={category.id}
              className={`flex-shrink-0 px-2 py-1 text-sm text-[16px] font-[400] whitespace-nowrap md:p-1 ${activeCategory === category.name ? 'bg-primary' : ''}`}
              onClick={() => {
                setActiveCategory(category.name);
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        {/* Casino Grid */}
        <div className='w-full md:w-5/6'>
          <Casino
            casinos={
              activeCategory === 'All Casino'
                ? casinos
                : casinos.filter((casino) => casino.category === activeCategory)
            }
          />
        </div>
      </div>
    </>
  );
}

export default CasinoList;
