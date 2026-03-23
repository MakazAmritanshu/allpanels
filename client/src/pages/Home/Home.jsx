import React, { useState } from 'react';
import MobileNav from '../../components/header/MobileNav';
import Sports from './sports/Sports';
import OurCasino from './ourcasino/OurCasino';
import { MdSportsCricket } from 'react-icons/md';
import { BiSolidCricketBall } from 'react-icons/bi';
import Cricket from './Cricket';
import Football from './Football';
import Tennis from './Tennis';
import AllCasino from './ourcasino/AllCasino';
import Crash from './crash/Crash';
const tabs = [
  { name: 'Cricket' },
  { name: 'Football' },
  { name: 'Tennis' },
  { name: 'Table Tennis' },
  { name: 'Esoccer' },
  { name: 'Horse Racing' },
  { name: 'Greyhound Racing' },
  { name: 'Basketball' },
  { name: 'Wrestling' },
  { name: 'Volleyball' },
  { name: 'Badminton' },
];

function Home() {
  const [selected, setSelected] = useState('SPORTS');
  const [activeTab, setActiveTab] = useState('Cricket');
  return (
    <div>
      <div className='block lg:hidden'>
        <MobileNav selected={selected} setSelected={setSelected} />
      </div>
      <div className='block lg:hidden'>
        {selected === 'SPORTS' && <Sports />}
        {/* {selected === 'OUR CASINO' && <OurCasino />} */}
        {selected === 'CRASH' && <Crash />}

        {selected === 'OUR CASINO' && <OurCasino />}
      </div>
      <div className='mt-0.5 w-full pl-1'>
        <div className='bg-secondary hidden w-full items-center lg:flex'>
          <div className='bg-secondary text-secondary border-opacity-30 flex min-w-0 flex-1 items-center gap-2 border-r border-white p-2'>
            <MdSportsCricket className='animate-blink shrink-0' />
            <span className='animate-blink truncate text-sm'>
              Central stage vs Nothe...
            </span>
          </div>
          <div className='bg-secondary text-secondary border-opacity-30 flex min-w-0 flex-1 items-center gap-2 border-r border-white p-2'>
            <BiSolidCricketBall className='animate-blink shrink-0' />
            <span className='animate-blink truncate text-sm'>
              Putintseva v D Galfi
            </span>
          </div>
          <div className='bg-secondary text-secondary border-opacity-30 flex min-w-0 flex-1 items-center gap-2 border-r border-white p-2'>
            <MdSportsCricket className='animate-blink shrink-0' />
            <span className='animate-blink truncate text-sm'>
              Central stage vs Nothe...
            </span>
          </div>
          <div className='bg-secondary text-secondary border-opacity-30 flex min-w-0 flex-1 items-center gap-2 border-r border-white p-2'>
            <MdSportsCricket className='animate-blink shrink-0' />
            <span className='animate-blink truncate text-sm'>
              Central stage vs Nothe...
            </span>
          </div>
          <div className='bg-secondary text-secondary flex min-w-0 flex-1 items-center gap-2 p-2'>
            <MdSportsCricket className='animate-blink shrink-0' />
            <span className='animate-blink truncate text-sm'>
              Central stage vs Nothe...
            </span>
          </div>
        </div>

        <div className='sidebar-menu-bg scrollbar-hide mt-0.5 hidden items-center overflow-x-auto lg:flex'>
          {tabs.map((tab, index) => (
            <div
              key={tab.name}
              className={`flex cursor-pointer items-center justify-center px-4 py-2 whitespace-nowrap ${
                activeTab === tab.name
                  ? 'bg-secondary text-secondary'
                  : 'sidebar-menu-bg sidebar-menu-text'
              } ${index < tabs.length - 1 ? 'border-r border-gray-400' : ''}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <span className='text-sm font-medium'>{tab.name}</span>
            </div>
          ))}
        </div>
        <div className='hidden lg:block'>
          {activeTab === 'Cricket' && <Cricket />}
          {activeTab === 'Football' && <Football />}
          {activeTab === 'Tennis' && <Tennis />}
          <div className='mt-1'>
            <AllCasino />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
