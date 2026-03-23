import React from 'react';

function LiveTv(gameid) {
  return (
    <div>
      <iframe
        src={`https://live.cricketid.xyz/directStream?gmid=${gameid}&key=a1bett20252026`}
        // src={`https://test.shivay9554.com/api/v1/live-stream?gmid=${gameid}&key=${key}`}
        title='Watch Live'
        className='w-full rounded-lg'
        style={{ height: '50vh' }}
        allowFullScreen
        loading='lazy'
        allow='
                autoplay;
                encrypted-media;
                fullscreen;
                picture-in-picture;
                accelerometer;
                gyroscope
              '
      />
    </div>
  );
}

export default LiveTv;
