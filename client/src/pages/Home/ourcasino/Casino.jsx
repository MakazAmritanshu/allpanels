import React from 'react';
import { useNavigate } from 'react-router-dom';

function Casino({ casinos }) {
  console.log('casino', casinos);
  const navigate = useNavigate();

  return (
    <div className='grid grid-cols-3 md:grid-cols-7'>
      {casinos.map((casino) => (
        <div key={casino.id} className='flex flex-col items-center p-0.5'>
          <img
            src={casino.image}
            alt={casino.name}
            onClick={() => {
              // navigate(`/casino-bet/${casino.name}/${casino.slug}`);
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default Casino;
