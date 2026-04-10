// import React, { useState } from 'react';
// import MobileNav from '../../components/header/MobileNav';
// import Sports from './sports/Sports';
// import OurCasino from './ourcasino/OurCasino';
// import { MdSportsCricket } from 'react-icons/md';
// import { BiSolidCricketBall } from 'react-icons/bi';
// import Cricket from './Cricket';
// import Football from './Football';
// import Tennis from './Tennis';
// import AllCasino from './ourcasino/AllCasino';
// import Crash from './crash/Crash';
// const tabs = [
//   { name: 'Cricket' },
//   { name: 'Football' },
//   { name: 'Tennis' },
//   { name: 'Table Tennis' },
//   { name: 'Esoccer' },
//   { name: 'Horse Racing' },
//   { name: 'Greyhound Racing' },
//   { name: 'Basketball' },
//   { name: 'Wrestling' },
//   { name: 'Volleyball' },
//   { name: 'Badminton' },
// ];

// function Home() {
//   const [selected, setSelected] = useState('SPORTS');
//   const [activeTab, setActiveTab] = useState('Cricket');
//   return (
//     <div>
//       <div className='block lg:hidden'>
//         <MobileNav selected={selected} setSelected={setSelected} />
//       </div>
//       <div className='block lg:hidden'>
//         {selected === 'SPORTS' && <Sports />}
//         {/* {selected === 'OUR CASINO' && <OurCasino />} */}
//         {selected === 'CRASH' && <Crash />}

//         {selected === 'OUR CASINO' && <OurCasino />}
//       </div>
//       <div className='mt-0.5 w-full pl-1'>
//         <div className='bg-secondary hidden w-full items-center lg:flex'>
//           <div className='bg-secondary text-secondary border-opacity-30 flex min-w-0 flex-1 items-center gap-2 border-r border-white p-2'>
//             <MdSportsCricket className='animate-blink shrink-0' />
//             <span className='animate-blink truncate text-sm'>
//               Central stage vs Nothe...
//             </span>
//           </div>
//           <div className='bg-secondary text-secondary border-opacity-30 flex min-w-0 flex-1 items-center gap-2 border-r border-white p-2'>
//             <BiSolidCricketBall className='animate-blink shrink-0' />
//             <span className='animate-blink truncate text-sm'>
//               Putintseva v D Galfi
//             </span>
//           </div>
//           <div className='bg-secondary text-secondary border-opacity-30 flex min-w-0 flex-1 items-center gap-2 border-r border-white p-2'>
//             <MdSportsCricket className='animate-blink shrink-0' />
//             <span className='animate-blink truncate text-sm'>
//               Central stage vs Nothe...
//             </span>
//           </div>
//           <div className='bg-secondary text-secondary border-opacity-30 flex min-w-0 flex-1 items-center gap-2 border-r border-white p-2'>
//             <MdSportsCricket className='animate-blink shrink-0' />
//             <span className='animate-blink truncate text-sm'>
//               Central stage vs Nothe...
//             </span>
//           </div>
//           <div className='bg-secondary text-secondary flex min-w-0 flex-1 items-center gap-2 p-2'>
//             <MdSportsCricket className='animate-blink shrink-0' />
//             <span className='animate-blink truncate text-sm'>
//               Central stage vs Nothe...
//             </span>
//           </div>
//         </div>

//         <div className='sidebar-menu-bg scrollbar-hide mt-0.5 hidden items-center overflow-x-auto lg:flex'>
//           {tabs.map((tab, index) => (
//             <div
//               key={tab.name}
//               className={`flex cursor-pointer items-center justify-center px-4 py-2 whitespace-nowrap ${
//                 activeTab === tab.name
//                   ? 'bg-secondary text-secondary'
//                   : 'sidebar-menu-bg sidebar-menu-text'
//               } ${index < tabs.length - 1 ? 'border-r border-gray-400' : ''}`}
//               onClick={() => setActiveTab(tab.name)}
//             >
//               <span className='text-sm font-medium'>{tab.name}</span>
//             </div>
//           ))}
//         </div>
//         <div className='hidden lg:block'>
//           {activeTab === 'Cricket' && <Cricket />}
//           {activeTab === 'Football' && <Football />}
//           {activeTab === 'Tennis' && <Tennis />}
//           <div className='mt-1'>
//             <AllCasino />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Home;


import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MobileNav from '../../components/header/MobileNav';
import Sports from './sports/Sports';
import OurCasino from './ourcasino/OurCasino';
import { MdSportsCricket } from 'react-icons/md';
import { FaFootballBall } from 'react-icons/fa';
import { IoMdTennisball } from 'react-icons/io';
import Cricket from './Cricket';
import Football from './Football';
import Tennis from './Tennis';
import AllCasino from './ourcasino/AllCasino';
import Crash from './crash/Crash';

const sportConfig = {
  cricket: { icon: <MdSportsCricket />, route: 'cricket-bet' },
  soccer: { icon: <FaFootballBall />, route: 'football-bet' },
  tennis: { icon: <IoMdTennisball />, route: 'tennis-bet' },
};
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
  const navigate = useNavigate();
  const cricketMatches = useSelector((s) => s.cricket.matches);
  const soccerMatches = useSelector((s) => s.soccer.matches);
  const tennisMatches = useSelector((s) => s.tennis.matches);

  const topMatches = useMemo(() => {
    const excluded = /t\s*(10|5)/i;
    const tag = (list, sport) =>
      list
        .filter((m) => !excluded.test(m.title))
        .map((m) => ({ ...m, sport }));

    const dedupe = (list) => {
      const seen = new Set();
      return list.filter((m) => {
        const key = `${m.sport}-${m.game || m.title}-${m.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const all = dedupe([
      ...tag(cricketMatches, 'cricket'),
      ...tag(soccerMatches, 'soccer'),
      ...tag(tennisMatches, 'tennis'),
    ]);

    const inPlay = all.filter((m) => m.inplay);
    const pool = inPlay.length > 0 ? inPlay : [...all].sort(() => Math.random() - 0.5);
    return pool.slice(0, 5);
  }, [cricketMatches, soccerMatches, tennisMatches]);
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
          {topMatches.map((match, idx) => (
            <div
              key={`${match.sport}-${match.id}`}
              className={`bg-secondary text-secondary flex min-w-0 flex-1 cursor-pointer items-center gap-2 p-2 ${
                idx < topMatches.length - 1 ? 'border-r border-white border-opacity-30' : ''
              }`}
              onClick={() =>
                navigate(
                  `/${sportConfig[match.sport].route}/${match.game}/${match.id}`,
                  { state: { time: match.time } }
                )
              }
            >
              <span className='animate-blink shrink-0'>
                {sportConfig[match.sport].icon}
              </span>
              <span className='animate-blink truncate text-sm'>
                {match.game || match.title}
              </span>
            </div>
          ))}
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
