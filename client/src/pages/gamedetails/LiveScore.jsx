import React from 'react';

function LiveScore(gameid) {
  return (
    <div>
      <iframe
        src={`https://score.akamaized.uk/diamond-live-score?gmid=${gameid}`}
        allowFullScreen
        className='w-full rounded-lg'
        title='Live Score'
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

export default LiveScore;
