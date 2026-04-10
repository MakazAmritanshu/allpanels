import React, { useState } from 'react';
import { GiCricketBat } from 'react-icons/gi';
import {
  FaFootballBall,
  FaTableTennis,
  FaTrophy,
  FaCircle,
} from 'react-icons/fa';
import { IoMdTennisball } from 'react-icons/io';
import { MdSportsEsports } from 'react-icons/md';
import Cricket from '../Cricket';
import Football from '../Football';
import Tennis from '../Tennis';
import AllCasino from '../ourcasino/AllCasino';
const navItems = [
  { id: 'CRICKET', label: 'CRICKET', icon: GiCricketBat },
  { id: 'FOOTBALL', label: 'FOOTBALL', icon: FaFootballBall },
  { id: 'TENNIS', label: 'TENNIS', icon: IoMdTennisball },
  { id: 'TABLE TENNIS', label: 'TABLE TENNIS', icon: FaTableTennis },
  { id: 'ESOCCER', label: 'ESOCCER', icon: MdSportsEsports },
  { id: 'HORSE RACING', label: 'HORSE RACING', icon: FaTrophy },
  { id: 'GREYHOUND RACING', label: 'GREYHOUND RACING', icon: FaTrophy },
  { id: 'BASKETBALL', label: 'BASKETBALL', icon: FaTrophy },
  { id: 'WRESTLING', label: 'WRESTLING', icon: FaTrophy },
  { id: 'VOLLEYBALL', label: 'VOLLEYBALL', icon: FaTrophy },
  { id: 'BADMINTON', label: 'BADMINTON', icon: FaTrophy },
  { id: 'SNOOKER', label: 'SNOOKER', icon: FaCircle },
  { id: 'DARTS', label: 'DARTS', icon: FaCircle },
];
function Sports() {
  const [activeSport, setActiveSport] = useState('CRICKET');

  return (
    <div className='bg-body text-body min-h-screen'>
      <div className='bg-secondary text-secondary'>
        <div className='scrollbar-hide flex overflow-x-auto'>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSport(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-1 whitespace-nowrap transition-colors hover:opacity-80 ${
                  activeSport === item.id
                    ? 'border-b-2 border-white opacity-80'
                    : ''
                }`}
              >
                <Icon className='text-xl' />
                <span className='text-xs font-medium'>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className='scrollbar-hide max-h-[250px] overflow-y-auto'>
        {activeSport === 'CRICKET' && <Cricket />}
        {activeSport === 'FOOTBALL' && <Football />}
        {activeSport === 'TENNIS' && <Tennis />}
      </div>
      <div className='mt-1'>
        <AllCasino />
      </div>
    </div>
  );
}

export default Sports;
