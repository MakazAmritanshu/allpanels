import React from 'react';

function Casino({ casinos }) {
  return (
    <div className='grid grid-cols-3 md:grid-cols-7'>
      {casinos.map((casino) => (
        <div key={casino.id} className='flex flex-col items-center p-0.5'>
          <img src={casino.image} alt={casino.name} className=' ' />
          {/* <span className='text-[9px] font-semibold bg-[#0088CC] text-[#FFFFFF] w-full h-5 flex justify-center items-center truncate text-center  '>{casino.name}</span> */}
        </div>
      ))}
    </div>
  );
}

export default Casino;
