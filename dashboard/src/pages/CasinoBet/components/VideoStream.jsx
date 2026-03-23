import React, { memo, useState, useEffect } from 'react';
import { getVideoStreamUrl } from '../utils/gameUtils';
import { VIDEO_LOAD_TIMEOUT } from '../constants';
import CardsDisplay from './CardsDisplay';

/**
 * VideoStream - Casino video stream with loading states and overlay
 * Handles iframe loading, timeout, and displays cards/timer overlay
 */
const VideoStream = memo(function VideoStream({
  gameid,
  bettingData,
  showWinner,
  winnerLabel,
}) {
  const [videoload, setVideoload] = useState(true);
  const [failed, setFailed] = useState(false);

  // Reset states when game changes
  useEffect(() => {
    setVideoload(true);
    setFailed(false);
  }, [gameid]);

  // Video load timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (videoload) {
        setFailed(true);
      }
    }, VIDEO_LOAD_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [videoload, gameid]);

  return (
    <div className='relative flex h-[200px] w-full items-center justify-center bg-black md:h-[420px]'>
      {/* Video Iframe */}
      <iframe
        src={getVideoStreamUrl(gameid)}
        frameBorder='0'
        allowFullScreen
        style={{
          visibility: videoload || failed ? 'hidden' : 'visible',
          opacity: videoload || failed ? 0 : 1,
          transition: 'all 0.5s ease-in-out',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: '0',
          left: '0',
          border: 'none',
        }}
        onLoad={() => setVideoload(false)}
        onError={() => console.warn('Iframe load error')}
      />

      {/* Loading State */}
      {(videoload || failed) && (
        <img
          src='/loader.gif'
          alt='Loading'
          className='m-auto h-32 w-32 md:h-40 md:w-40 lg:h-auto lg:w-auto'
        />
      )}

      {/* Cards Display Overlay */}
      <div className='absolute top-2 left-2'>
        <CardsDisplay bettingData={bettingData} />
      </div>

      {/* Timer Overlay */}
      <div className='absolute top-2 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-black text-[20px] font-bold text-white'>
        {bettingData?.lt || 0}
      </div>

      {/* Winner Popup */}
      {showWinner && winnerLabel && (
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-tl-[15px] rounded-br-[15px] bg-gradient-to-t from-[#ff5100] to-[#ff8100] px-2 py-1 text-black'>
          {winnerLabel} Win
        </div>
      )}
    </div>
  );
});

export default VideoStream;
