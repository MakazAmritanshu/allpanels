import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import OurCasinopage from './CasinoList';
import OurVipCasinopage from '../ourvipcasino/CasinoList';
import OurPremCasinopage from '../ourpremcasino/CasinoList';
import OurVirtualCasinopage from '../ourvirtual/CasinoList';
const navs = [
  { name: 'Our Casino', animate: true, path: '/casino-list' },
  { name: 'Our VIP Casino', animate: true, path: '/our-vip-casino' },
  { name: 'Our Premium Casino', animate: true, path: '/our-prem-casino' },
  { name: 'Our Virtual', animate: true, path: '/our-virtual-casino' },
  { name: 'Tembo', animate: false },
];
function OurCasino() {
  // const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(navs[0].name);
  return (
    <>
      <div className='block w-full md:hidden'>
        <div className='scrollbar-hide bg-secondary text-secondary flex overflow-x-auto'>
          {navs.map((nav) => (
            <button
              key={nav.name}
              className={`flex-shrink-0 px-2 py-1 text-sm text-[16px] font-[400] whitespace-nowrap md:p-1 ${activeCategory === nav.name ? 'border-t-2 border-white' : ''}`}
              onClick={() => {
                setActiveCategory(nav.name);
              }}
            >
              {nav.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        {activeCategory === 'Our Casino' && <OurCasinopage />}
        {activeCategory === 'Our VIP Casino' && <OurVipCasinopage />}
        {activeCategory === 'Our Premium Casino' && <OurPremCasinopage />}
        {activeCategory === 'Our Virtual' && <OurVirtualCasinopage />}
      </div>
    </>
  );
}

export default OurCasino;
