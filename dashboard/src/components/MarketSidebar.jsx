import React from 'react';
import LiveVideo from '../pages/LiveVideo';
import { useState } from 'react';
import axios from 'axios';
import scorecardimg from '../assets/scorecard-bg.png';
import { useEffect } from 'react';

const MarketSidebar = ({ gameid }) => {
  const [scoreUrl, setScoreUrl] = useState(false);
  const [url, setUrl] = useState('');
  const [masterpopup, setMasterpopup] = useState(false);

  useEffect(() => {
    document.body.style.overflow = masterpopup ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [masterpopup]);

  const videoS = async () => {
    if (url) {
      setUrl('');
      return;
    }
    try {
      const response = await axios.get(
        `https://live.cricketid.xyz/directStream?gmid=${gameid}&key=a1bett20252026`
      );
      const data = response?.data;
      console.log('API response:', data);
      setUrl(data?.tv_url); // make sure the field is `tv_url`
    } catch (error) {
      console.error('Video API Error:', error?.response?.data || error.message);
    }
  };

  return (
    <div>
      <div>
        <div
          className='bg-dark cursor-pointer rounded-t-md px-4 py-1 font-semibold text-white'
          onClick={() => videoS()}
        >
          Live Streaming
        </div>
        {url ? <LiveVideo url={url} /> : null}
      </div>
      <div className='mt-4'>
        <div
          className='bg-dark cursor-pointer rounded-t-md px-4 py-1 font-semibold text-white'
          onClick={() => setScoreUrl(!scoreUrl)}
        >
          Score Card
        </div>
        {scoreUrl ? (
          <img className='h-[150px]' src={scorecardimg} alt='scorecardimg' />
        ) : null}
      </div>
      <div className='mt-4 bg-white'>
        <div className='bg-dark cursor-pointer rounded-t-md px-4 py-1 font-semibold text-white'>
          Book
        </div>
        <div className='flex w-full justify-between p-4'>
          <button
            className='bg-dark w-[47%] cursor-pointer rounded-md px-4 py-1 font-semibold text-white'
            onClick={() => setMasterpopup(true)}
          >
            Master Book
          </button>
          <button className='bg-dark w-[47%] cursor-pointer rounded-md px-4 py-1 font-semibold text-white'>
            User Book
          </button>
        </div>
      </div>
      <div className='mt-4 bg-white'>
        <div className='bg-dark flex w-full cursor-pointer justify-between rounded-t-md px-4 py-1 text-white'>
          <div className='flex w-[60%] justify-between p-4'>
            <div className='flex gap-5'>
              <span>Live Bet</span>
              <div className='inline-flex items-center'>
                <label className='relative flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    className='peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white shadow transition-all checked:border-slate-800 checked:bg-slate-800 hover:shadow-md'
                    id='uncheck'
                  />
                  <span className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-white text-blue-500 opacity-0 peer-checked:opacity-100'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-3.5 w-3.5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      stroke='currentColor'
                      strokeWidth={1}
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </span>
                </label>
              </div>
            </div>
            <div className='flex gap-5'>
              <span>Partnership Book</span>
              <div className='inline-flex items-center'>
                <label className='relative flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    className='peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white shadow transition-all checked:border-slate-800 checked:bg-slate-800 hover:shadow-md'
                    id='check'
                  />
                  <span className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-white text-blue-500 opacity-0 peer-checked:opacity-100'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-3.5 w-3.5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      stroke='currentColor'
                      strokeWidth={1}
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div className='flex w-[40%] justify-end p-4 text-end'>View More</div>
        </div>
        <div className='items-center py-8 text-center'>
          <h2>There are no any bet.</h2>
        </div>
      </div>

      {masterpopup && (
        <div className='modal-overlay fixed top-5 left-[25%]'>
          <div className='modal-content h-[300px]'>
            <div className='modal-header flex justify-between'>
              <span> Market List</span>
              <span className='text-2xl' onClick={() => setMasterpopup(false)}>
                {' '}
                X
              </span>
            </div>
            <div className='modal-body p-4'>
              <div className='border-2 border-gray-600'>
                <h2 className='cursor-pointer border-b p-3'>Match Odds</h2>
                <h2 className='cursor-pointer border-b p-3'>Match Odds</h2>
                <h2 className='cursor-pointer border-b p-3'>Match Odds</h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSidebar;
