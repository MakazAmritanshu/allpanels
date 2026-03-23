import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaRegPlusSquare } from 'react-icons/fa';
import { FaRegMinusSquare } from 'react-icons/fa';
import { RiCloseCircleLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCricketData } from '../../redux/reducer/cricketSlice';
import { fetchSoccerData } from '../../redux/reducer/soccerSlice';
import { fetchTennisData } from '../../redux/reducer/tennisSlice';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { matches: cricketMatches } = useSelector((state) => state.cricket);
  const { matches: tennisMatches } = useSelector((state) => state.tennis);
  const { matches: soccerMatches } = useSelector((state) => state.soccer);

  useEffect(() => {
    dispatch(fetchCricketData());
    dispatch(fetchTennisData());
    dispatch(fetchSoccerData());
  }, [dispatch]);

  // Use Set to track expanded items by their unique IDs
  // This works dynamically with any data structure from API
  // Example: new Set(['racingSports', 'others']) to set initial expanded items
  const [expandedItems, setExpandedItems] = useState(
    new Set(['racingSports', 'others', 'allSports'])
  );

  // Toggle expansion for any item by its unique ID
  // Works with any item ID from API data
  const toggleItem = (itemId) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Check if an item is expanded by its unique ID
  const isExpanded = (itemId) => expandedItems.has(itemId);

  // Helper function to group matches by title
  const groupMatchesByTitle = (matches) => {
    if (!matches || matches.length === 0) return {};

    return matches.reduce((acc, match) => {
      const title = match.title || 'Other';
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(match);
      return acc;
    }, {});
  };

  // Get grouped matches for each sport
  const groupedCricket = groupMatchesByTitle(cricketMatches);
  const groupedTennis = groupMatchesByTitle(tennisMatches);
  const groupedSoccer = groupMatchesByTitle(soccerMatches);

  // Optional: Function to set initial expanded items when data loads from API
  // useEffect(() => {
  //   if (apiData) {
  //     const initialExpanded = new Set(apiData.filter(item => item.defaultExpanded).map(item => item.id));
  //     setExpandedItems(initialExpanded);
  //   }
  // }, [apiData]);

  const racingSports = ['Horse Racing', 'Greyhound Racing'];

  const others = [
    { name: 'Our Casino', animate: true, path: '/casino-list' },
    { name: 'Our VIP Casino', animate: true, path: '/our-vip-casino' },
    { name: 'Our Premium Casino', animate: true, path: '/our-prem-casino' },
    { name: 'Our Virtual', animate: true, path: '/our-virtual-casino' },
    { name: 'Tembo', animate: false },
    { name: 'Live Casino', animate: false },
    { name: 'Slot Game', animate: false },
    { name: 'Fantasy Game', animate: false },
  ];
  const politics = [
    { name: 'Bihar Election 2025', electionName: 'Bihar Election 2025' },
  ];

  // Helper function to create a safe key from title
  const createTitleKey = (sportKey, title) => {
    // Replace spaces and special characters with underscores for a safe key
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    return `${sportKey}-${safeTitle}`;
  };

  // Helper function to render a sport section with grouped titles
  const renderSportSection = (sportName, groupedData, sportKey) => {
    const titles = Object.keys(groupedData);
    const hasData = titles.length > 0;

    return (
      <div>
        <button
          onClick={() => toggleItem(sportKey)}
          className='flex w-full cursor-pointer items-center justify-between border-b border-b-[#9e9e9e] py-1 pl-4'
        >
          <span className='flex items-center gap-1 text-sm font-[400] text-[#000000]'>
            {isExpanded(sportKey) ? (
              <span className='text-xs'>
                <FaRegMinusSquare />
              </span>
            ) : (
              <span className='text-xs'>
                <FaRegPlusSquare />
              </span>
            )}
            {sportName}
          </span>
        </button>
        {isExpanded(sportKey) && hasData && (
          <div className='mt-1 space-y-1'>
            {titles.map((title) => {
              const titleKey = createTitleKey(sportKey, title);
              const matches = groupedData[title];

              return (
                <div key={titleKey}>
                  <button
                    onClick={() => toggleItem(titleKey)}
                    className='flex w-full cursor-pointer border-b border-b-[#9e9e9e] py-1 pl-4'
                  >
                    <span className='flex items-center gap-2 pl-4 text-sm font-[400] text-[#000000]'>
                      {isExpanded(titleKey) ? (
                        <span className='flex inline flex-wrap items-center gap-1 text-left'>
                          <FaRegMinusSquare className='inline text-xs' /> &nbsp;
                          {title}
                        </span>
                      ) : (
                        <span className='flex inline flex-wrap items-center gap-1 text-left'>
                          <FaRegPlusSquare className='inline text-xs' />
                          &nbsp; {title}
                        </span>
                      )}
                    </span>
                  </button>
                  {isExpanded(titleKey) && matches && matches.length > 0 && (
                    <div className='mt-1 space-y-1 text-sm font-[400] text-[#000000]'>
                      {matches.map((match) => (
                        <a
                          key={match.id}
                          href='#'
                          className='block border-b border-b-[#9e9e9e] p-1 pl-12 text-sm transition-colors hover:opacity-70'
                          onClick={(e) => {
                            e.preventDefault();
                            // Navigate based on sport type
                            if (sportName === 'Cricket') {
                              navigate(
                                `/cricket-bet/${match.game}/${match.id}`
                              );
                            } else if (sportName === 'Football') {
                              navigate(
                                `/football-bet/${match.game}/${match.id}`
                              );
                            } else if (sportName === 'Tennis') {
                              navigate(`/tennis-bet/${match.game}/${match.id}`);
                            }
                            // Close sidebar on mobile after navigation
                            onClose();
                          }}
                        >
                          {match.game}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar-menu-bg sidebar-menu-text fixed top-0 left-0 z-50 mt-0.5 h-full w-55 transform transition-transform duration-300 ease-in-out lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } overflow-y-auto`}
      >
        <div className=''>
          <div className='bg-body flex items-center justify-between gap-2 p-2 md:hidden'>
            <input
              type='search'
              placeholder='Search here'
              className='bg-body text-body w-[150px] px-1 py-1 outline-none'
              style={{ boxShadow: '0 0 5px #6f6f6f' }}
            />
            <RiCloseCircleLine className='text-3xl' onClick={onClose} />
          </div>
          {/* Racing Sports Section */}
          <div className=''>
            <button
              onClick={() => toggleItem('racingSports')}
              className='bg-primary text-primary flex w-full items-center justify-between border-b border-b-[#9e9e9e] p-1 hover:opacity-80'
            >
              <span className='text-md font-[500]'>Racing Sports</span>
              {isExpanded('racingSports') ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isExpanded('racingSports') && (
              <div className=' '>
                {racingSports.map((sport) => (
                  <a
                    key={sport}
                    href='#'
                    className='block border-b border-b-[#9e9e9e] p-1 pl-4 text-sm font-[400] text-[#000000] transition-colors hover:opacity-70'
                  >
                    {sport}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Others Section */}
          <div className=''>
            <button
              onClick={() => toggleItem('others')}
              className='bg-primary text-primary flex w-full items-center justify-between border-b border-b-[#9e9e9e] p-1 hover:opacity-80'
            >
              <span className='text-md font-[500]'>Others</span>
              {isExpanded('others') ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isExpanded('others') && (
              <div className=''>
                {others.map((item) => (
                  <a
                    key={item.name}
                    className={`block cursor-pointer border-b border-b-[#9e9e9e] p-1 pl-4 text-sm font-[400] text-[#000000] transition-colors ${
                      item.animate
                        ? 'animate-blink opacity-50'
                        : 'hover:opacity-70'
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* All Sports Section */}
          <div className=''>
            <button
              onClick={() => toggleItem('allSports')}
              className='bg-primary text-primary flex w-full items-center justify-between border-b border-b-[#9e9e9e] p-1 hover:opacity-80'
            >
              <span className='text-md font-[500]'>All Sports</span>
              {isExpanded('allSports') ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isExpanded('allSports') && (
              <div className=''>
                {/* Politics */}
                <div>
                  <button
                    onClick={() => toggleItem('politics')}
                    className='flex w-full items-center justify-between border-b border-b-[#9e9e9e] py-1 pl-4'
                  >
                    <span className='flex items-center gap-1 text-sm font-[400] text-[#000000]'>
                      {isExpanded('politics') ? (
                        <span className='text-xs'>
                          <FaRegMinusSquare />
                        </span>
                      ) : (
                        <span className='text-xs'>
                          <FaRegPlusSquare />
                        </span>
                      )}
                      Politics
                    </span>
                  </button>
                  {isExpanded('politics') && (
                    <div className='mt-1 space-y-1 pl-4'>
                      {/* This will be populated from API */}
                    </div>
                  )}
                </div>

                {/* Cricket */}
                {renderSportSection('Cricket', groupedCricket, 'cricket')}

                {/* Football */}
                {renderSportSection('Football', groupedSoccer, 'football')}

                {/* Tennis */}
                {renderSportSection('Tennis', groupedTennis, 'tennis')}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
