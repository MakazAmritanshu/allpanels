import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaFootballBall,
  FaTableTennis,
  FaDice,
  FaTrophy,
  FaChartLine,
  FaCircle,
} from 'react-icons/fa';
import { IoMdTennisball } from 'react-icons/io';
import { GiCricketBat } from 'react-icons/gi';

function Navbar() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('HOME');
  const [activeSport, setActiveSport] = useState('CRICKET');

  const mainNavItems = [
    { id: 'HOME', label: 'HOME', icon: FaHome, path: '/' },
    // { id: 'LOTTERY', label: 'LOTTERY', icon: FaDice },
    { id: 'CRICKET', label: 'CRICKET', icon: GiCricketBat, path: '/cricket' },
    {
      id: 'FOOTBALL',
      label: 'FOOTBALL',
      icon: FaFootballBall,
      path: '/football',
    },
    { id: 'TENNIS', label: 'TENNIS', icon: IoMdTennisball, path: '/tennis' },
    { id: 'TABLE TENNIS', label: 'TABLE TENNIS', icon: FaTableTennis },
    {
      id: 'BACCARAT',
      label: 'BACCARAT',
      icon: FaCircle,
      path: '/casino-list/Baccarat',
    },
    {
      id: '32 CARDS',
      label: '32 CARDS',
      icon: FaDice,
      path: '/casino-list/32 Cards',
    },
    {
      id: 'TEENPATTI',
      label: 'TEENPATTI',
      icon: FaDice,
      path: '/casino-list/Teenpatti',
    },
    { id: 'POKER', label: 'POKER', icon: FaDice, path: '/casino-list/Poker' },
    {
      id: 'LUCKY 7',
      label: 'LUCKY 7',
      icon: FaDice,
      path: '/casino-list/Lucky 7',
    },
    { id: 'CRASH', label: 'CRASH', icon: FaChartLine },
  ];

  const sportsNavItems = [
    { id: 'CRICKET', label: 'CRICKET', icon: GiCricketBat },
    { id: 'FOOTBALL', label: 'FOOTBALL', icon: FaFootballBall },
    { id: 'TENNIS', label: 'TENNIS', icon: IoMdTennisball },
    { id: 'TABLE TENNIS', label: 'TABLE TENNIS', icon: FaTableTennis },
    { id: 'ESOCCER', label: 'ESOCCER', icon: FaFootballBall },
    { id: 'HORSE RACING', label: 'HORSE RACING', icon: FaTrophy },
    { id: 'GREYHOUND RACING', label: 'GREYHOUND RACING', icon: FaTrophy },
    { id: 'BASKETBALL', label: 'BASKETBALL', icon: FaTrophy },
    { id: 'WRESTLING', label: 'WRESTLING', icon: FaTrophy },
    { id: 'VOLLEYBALL', label: 'VOLLEYBALL', icon: FaTrophy },
    { id: 'BADMINTON', label: 'BADMINTON', icon: FaTrophy },
    { id: 'SNOOKER', label: 'SNOOKER', icon: FaTrophy },
    { id: 'DARTS', label: 'DARTS', icon: FaTrophy },
  ];

  return (
    <div className='bg-secondary text-secondary'>
      {/* Main Navigation Bar */}
      <nav className='border-opacity-20 border-b border-white'>
        <div className='scrollbar-hide flex overflow-x-auto'>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors hover:opacity-80 ${
                  activeNav === item.id
                    ? 'border-b-2 border-white opacity-80'
                    : ''
                }`}
              >
                {/* <Icon className="text-sm" /> */}
                <span className='text-sm font-[700]'>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
