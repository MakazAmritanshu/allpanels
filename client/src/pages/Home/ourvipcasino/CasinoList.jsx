import React, { useEffect, useState } from 'react';
import Casino from './Casino';
import { useNavigate, useParams } from 'react-router-dom';
import OurCasino from '../ourcasino/OurCasino';
const casinos = [
  {
    id: 1,
    slug: 'teen20v1',
    name: '20-20 Teenpatti VIP1',
    category: 'Teenpatti',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20v1_red.gif',
  },
];
const casinoCategories = [
  { id: 1, name: 'All Casino' },
  { id: 2, name: 'Teenpatti' },
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
  const navigate = useNavigate();
  return (
    <>
      {/* <OurCasino selectedNav="Our VIP Casino"/> */}
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
