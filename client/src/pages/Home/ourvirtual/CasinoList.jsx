import React, { useEffect, useState } from 'react';
import Casino from './Casino';
import { useNavigate, useParams } from 'react-router-dom';
import OurCasino from '../ourcasino/OurCasino';
const casinos = [
  {
    id: 1,
    slug: 'vlucky7',
    name: 'Virtual Lucky 7',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vlucky7.jpg',
  },
  {
    id: 2,
    slug: 'vtrio',
    name: 'Virtual Trio',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vtrio.jpg',
  },
  {
    id: 3,
    slug: 'vdtl20',
    name: 'Virtual 20-20 D T L',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vdtl20.jpg',
  },
  {
    id: 4,
    slug: 'vteenmuf',
    name: 'Virtual Teenpatti Muf',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vteenmuf.jpg',
  },
  {
    id: 5,
    slug: 'vaaa',
    name: 'Virtual AAA',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vaaa.jpg',
  },
  {
    id: 6,
    slug: 'vbtable',
    name: 'Virtual Bollywood Table',
    category: 'Bollywood',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vbtable.jpg',
  },
  {
    id: 7,
    slug: 'vdt6',
    name: 'Virtual 1 Day Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vdt6.jpg',
  },
  {
    id: 8,
    slug: 'vteen',
    name: 'Virtual Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vteen.jpg',
  },
  {
    id: 9,
    slug: 'vteen20',
    name: 'Virtual 20-20 Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/vc/vteen20.jpg',
  },
];
const casinoCategories = [
  { id: 1, name: 'All Casino' },
  { id: 3, name: 'Teenpatti' },
  { id: 6, name: 'Dragon Tiger' },
  { id: 9, name: 'Lucky 7' },
  { id: 14, name: 'Bollywood' },
  { id: 15, name: 'Others' },
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
      {/* <OurCasino selectedNav="Our Virtual"/> */}
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
