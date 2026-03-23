import React from 'react';
import { MdSportsCricket } from 'react-icons/md';

const matches = [
  {
    id: 1,
    team1: 'Sydney Thunder',
    team2: 'Melbourne Renegades',
  },
  {
    id: 2,
    team1: 'Kolkata Knight Riders',
    team2: 'Delhi Capitals',
  },
  {
    id: 3,
    team1: 'Mumbai Indians',
    team2: 'Chennai Super Kings',
  },
  {
    id: 4,
    team1: 'Royal Challengers Bangalore',
    team2: 'Sunrisers Hyderabad',
  },
];

const mainNavItems = [
  { id: 'CRASH', label: 'CRASH' },

  { id: 'SPORTS', label: 'SPORTS' },
  { id: 'OUR CASINO', label: 'OUR CASINO' },
  { id: 'LIVE CASINO', label: 'LIVE CASINO' },
  { id: 'SLOTS', label: 'SLOTS' },
  { id: 'FANTASY', label: 'FANTASY' },
];

function MobileNav({ selected, setSelected }) {
  return (
    <div className='flex flex-col'>
      <div className='bg-primary text-primary scrollbar-hide flex gap-2 overflow-x-auto'>
        {matches.map((match) => (
          <div
            key={match.id}
            className='bg-secondary text-secondary flex shrink-0 items-center p-1 text-[14px] font-semibold whitespace-nowrap'
          >
            <div className='animate-blink flex items-center'>
              <MdSportsCricket />
            </div>
            <div className='animate-blink flex items-center py-1 sm:py-2'>
              <span>
                {match.team1} v {match.team2}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className='bg-primary text-primary scrollbar-hide flex items-center justify-between gap-2 overflow-x-auto'>
        <div className='flex gap-2 text-[14px] font-semibold'>
          {mainNavItems.map((item) => (
            <div
              key={item.id}
              className='flex items-center justify-center border-r border-white px-4 py-1 sm:py-2'
            >
              <span
                onClick={() => setSelected(item.id)}
                className='cursor-pointer'
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MobileNav;
