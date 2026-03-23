import React, { useEffect, useState } from 'react';
import Casino from './Casino';
import { useNavigate, useParams } from 'react-router-dom';
import OurCasino from '../ourcasino/OurCasino';
const casinos = [
  {
    id: 1,
    slug: 'pteen',
    name: 'Premium Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pteen.jpg',
  },
  {
    id: 2,
    slug: 'pteen20',
    name: 'Premium 20-20 Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pteen20.jpg',
  },
  {
    id: 3,
    slug: 'pbaccarat',
    name: 'Premium Baccarat',
    category: 'Baccarat',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pbaccarat.jpg',
  },
  {
    id: 4,
    slug: 'pdt20',
    name: 'Premium 20-20 Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pdt20.jpg',
  },
  {
    id: 5,
    slug: 'pdt6',
    name: 'Premium 1 Day Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pdt6.jpg',
  },
  {
    id: 6,
    slug: 'pcard32',
    name: 'Premium 32 Cards',
    category: '32 Cards',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/pcard32.jpg',
  },
  {
    id: 7,
    slug: 'plucky7',
    name: 'Premium Lucky 7',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/plucky7.jpg',
  },
];
const casinoCategories = [
  { id: 1, name: 'All Casino' },
  { id: 3, name: 'Teenpatti' },
  { id: 5, name: 'Baccarat' },
  { id: 6, name: 'Dragon Tiger' },
  { id: 7, name: '32 Cards' },
  { id: 9, name: 'Lucky 7' },
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
      {/* <OurCasino selectedNav="Our Premium Casino"/> */}
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
