import React from 'react';
const crash = [
  {
    id: 1,
    image:
      'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500000397.gif',
    provider: 'bcslot',
  },
  {
    id: 2,
    image: 'https://sitethemedata.com/casino_icons/other/betcore/140511.jpg',
    provider: 'betcore',
  },
  {
    id: 3,
    image: 'https://sitethemedata.com/casino_icons/other/betcore/154912.jpg',
    provider: 'betcore',
  },
  {
    id: 4,
    image: 'https://sitethemedata.com/casino_icons/other/betcore/170114.jpg',
    provider: 'betcore',
  },
  {
    id: 5,
    image: 'https://sitethemedata.com/casino_icons/other/betcore/168613.jpg',
    provider: 'betcore',
  },

  {
    id: 6,
    image:
      'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500000674.jpg',
    provider: 'bcslot',
  },
  {
    id: 7,
    image:
      'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/33060327.jpg',
    provider: 'bcslot',
  },
  {
    id: 8,
    image:
      'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500000203.jpg',
    provider: 'bcslot',
  },
  {
    id: 9,
    image:
      'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/141422.jpg',
    provider: 'bcslot',
  },

  {
    id: 10,
    image: 'https://sitethemedata.com/casino_icons/other/ssg/xgames/jetx.jpg',
    provider: 'ssg',
  },
  {
    id: 11,
    image: 'https://sitethemedata.com/casino_icons/other/ssg/xgames/jetx3.jpg',
    provider: 'ssg',
  },
  {
    id: 12,
    image:
      'https://sitethemedata.com/casino_icons/other/ssg/xgames/helicopterx.jpg',
    provider: 'ssg',
  },
  {
    id: 13,
    image:
      'https://sitethemedata.com/casino_icons/other/ssg/aviator/aviator.jpg',
    provider: 'ssg',
  },

  {
    id: 14,
    image:
      'https://sitethemedata.com/casino_icons/other/darwin/darwin/AVIATSR.jpg',
    provider: 'darwin',
  },
  {
    id: 15,
    image:
      'https://sitethemedata.com/casino_icons/other/darwin/darwin/CRAE.jpg',
    provider: 'darwin',
  },
  {
    id: 16,
    image:
      'https://sitethemedata.com/casino_icons/other/darwin/darwin/CRAESP.jpg',
    provider: 'darwin',
  },

  {
    id: 17,
    image:
      'https://sitethemedata.com/casino_icons/other/gemini1/gemini/MultiPlayerAviator.jpg',
    provider: 'gemini',
  },

  {
    id: 18,
    image: 'https://sitethemedata.com/casino_icons/slot/Jili/261.jpg',
    provider: 'jili',
  },
  {
    id: 19,
    image: 'https://sitethemedata.com/casino_icons/slot/Jili/224.jpg',
    provider: 'jili',
  },
  {
    id: 20,
    image: 'https://sitethemedata.com/casino_icons/slot/Jili/235.jpg',
    provider: 'jili',
  },

  {
    id: 21,
    image:
      'https://sitethemedata.com/casino_icons/slot/TurboGames/TRB-crashx.jpg',
    provider: 'turbogames',
  },
  {
    id: 22,
    image:
      'https://sitethemedata.com/casino_icons/slot/TurboGames/TRB-aero.jpg',
    provider: 'turbogames',
  },
];

function Crash() {
  return (
    <div className='grid grid-cols-3 gap-1 p-1 md:grid-cols-6 lg:grid-cols-10'>
      {crash.map((crash) => (
        <img
          key={crash.id}
          src={crash.image}
          alt={crash.provider}
          className='h-full w-full object-cover'
        />
      ))}
    </div>
  );
}

export default Crash;
