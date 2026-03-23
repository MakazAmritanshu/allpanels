import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const LiveVideo = ({ url }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delayToWaitForRef = setTimeout(() => {
      const video = videoRef.current;

      console.log('videoRef.current inside timeout:', video);
      console.log('HLS URL inside timeout:', url);

      if (!url || !video) return;

      let hls;

      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch((err) => console.error('Auto-play error:', err));
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          video.play().catch((err) => console.error('Play error:', err));
        });
      }
    }, 50); // wait 50ms for ref to attach

    return () => clearTimeout(delayToWaitForRef);
  }, [url]);

  return (
    <div className='relative w-full'>
      {isLoading && (
        <div className='bg-opacity-60 absolute inset-0 z-2 flex items-center justify-center bg-black'>
          <span className='text-white'>Loading Stream...</span>
        </div>
      )}

      <iframe
        src={videoRef} // make sure to define videoUrl (e.g., YouTube/Twitch/live stream URL)
        allow='autoplay; fullscreen'
        allowFullScreen
        frameBorder='0'
        className='h-[300px] w-full bg-black'
      ></iframe>
    </div>
  );
};

export default LiveVideo;
