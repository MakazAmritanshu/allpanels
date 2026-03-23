import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { marketGames } from '../redux/reducer/marketAnalyzeReducer';
import Loader from '../components/Loader';

const MyMarket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [market, setMarket] = useState([]);

  const { marketData, loading, errorMessage, successMessage } = useSelector(
    (state) => state.market
  );

  const cricketGame = Array.isArray(marketData)
    ? marketData.filter((item) => item.gameName === 'Cricket Game')
    : [];

  const tennisGame = Array.isArray(marketData)
    ? marketData.filter((item) => item.gameName === 'Tennis Game')
    : [];

  const soccerGame = Array.isArray(marketData)
    ? marketData.filter((item) => item.gameName === 'Soccer Game')
    : [];

  const horseRacingGame = Array.isArray(marketData)
    ? marketData.filter(
        (item) =>
          item.gameName === 'Horse Racing Game' ||
          item.gameName === 'Horse Racing'
      )
    : [];

  const casinoGame = Array.isArray(marketData)
    ? marketData.filter((item) => item.gameName === 'Casino')
    : [];

  useEffect(() => {
    dispatch(marketGames());
  }, [dispatch]);

  return (
    <div>
      <Navbar />

      <div className='relative mx-auto overflow-hidden p-2 text-sm md:p-6'>
        {loading ? (
          <div className='flex items-center justify-center'>
            <Loader />
          </div>
        ) : (
          <div>
            {/* Cricket */}
            <div className='mt-4'>
              {cricketGame.length > 0 && (
                <div>
                  <div className='bg-dark mb-2 px-4 py-2 font-semibold text-white'>
                    Cricket
                  </div>
                  {cricketGame[0]?.events.map((event, index) => (
                    <div
                      key={index}
                      className='flex justify-between gap-2 border-b-2 border-gray-300 px-2 pb-2'
                    >
                      <p
                        className='cursor-pointer text-[4vw] leading-[25px] font-[600] text-[#2789ce] md:text-xs lg:text-sm'
                        onClick={() => navigate(`/cricket-bet/${event.gameId}`)}
                      >
                        {event.eventName}
                      </p>
                      <p className='ml-1 font-[400] text-gray-400'>
                        {event.pendingBetCount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tennis */}
            <div className='mt-4'>
              {tennisGame.length > 0 && (
                <div>
                  <div className='bg-dark mb-2 px-4 py-2 font-semibold text-white'>
                    Tennis
                  </div>
                  {tennisGame[0]?.events.map((event, index) => (
                    <div
                      key={index}
                      className='flex justify-between gap-2 border-b-2 border-gray-300 px-2 pb-2'
                    >
                      <p
                        className='cursor-pointer text-[4vw] leading-[25px] font-[600] text-[#2789ce] md:text-xs lg:text-sm'
                        onClick={() => navigate(`/tennis-bet/${event.gameId}`)}
                      >
                        {event.eventName}
                      </p>
                      <p className='ml-1 font-[400] text-gray-400'>
                        {event.pendingBetCount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Soccer */}
            <div className='mt-4'>
              {soccerGame.length > 0 && (
                <div>
                  <div className='bg-dark mb-2 px-4 py-2 font-semibold text-white'>
                    Soccer
                  </div>
                  {soccerGame[0]?.events.map((event, index) => (
                    <div
                      key={index}
                      className='flex justify-between gap-2 border-b-2 border-gray-300 px-2 pb-2'
                    >
                      <p
                        className='cursor-pointer text-[4vw] leading-[25px] font-[600] text-[#2789ce] md:text-xs lg:text-sm'
                        onClick={() => navigate(`/soccerbet/${event.gameId}`)}
                      >
                        {event.eventName}
                      </p>
                      <p className='ml-1 font-[400] text-gray-400'>
                        {event.pendingBetCount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Horse Racing */}
            <div className='mt-4'>
              {horseRacingGame.length > 0 && (
                <div>
                  <div className='bg-dark mb-2 px-4 py-2 font-semibold text-white'>
                    Horse Racing
                  </div>
                  {horseRacingGame[0]?.events.map((event, index) => (
                    <div
                      key={index}
                      className='flex justify-between gap-2 border-b-2 border-gray-300 px-2 pb-2'
                    >
                      <p
                        className='cursor-pointer text-[4vw] leading-[25px] font-[600] text-[#2789ce] md:text-xs lg:text-sm'
                        onClick={() =>
                          navigate(`/horse-racing-bet/${event.gameId}`)
                        }
                      >
                        {event.eventName}
                      </p>
                      <p className='ml-1 font-[400] text-gray-400'>
                        {event.pendingBetCount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Casino */}
            <div className='mt-4'>
              {casinoGame.length > 0 && (
                <div>
                  <div className='bg-dark mb-2 px-4 py-2 font-semibold text-white'>
                    Casino
                  </div>
                  {casinoGame[0]?.events.map((event, index) => (
                    <div
                      key={index}
                      className='flex justify-between gap-2 border-b-2 border-gray-300 px-2 pb-2'
                    >
                      <p
                        className='cursor-pointer text-[4vw] leading-[25px] font-[600] text-[#2789ce] md:text-xs lg:text-sm'
                        onClick={() => navigate(`/casino-bet/${event.gameId}`)}
                      >
                        {event.eventName}
                      </p>
                      <p className='ml-1 font-[400] text-gray-400'>
                        {event.pendingBetCount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMarket;
