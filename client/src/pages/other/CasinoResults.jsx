import React from 'react';

function CasinoResults() {
  return (
    <div className='w-full overflow-x-auto p-0.5'>
      <div className='w-full border border-[#00000020] bg-[#fff] shadow-[0_0_5px_#a4a4a4]'>
        <div className='bg-secondary text-secondary p-2'>
          <h4 className='text-[16px] font-[400]'>Casino Results</h4>
        </div>
        <div className='mb-2 w-full p-2'>
          <div className='flex flex-wrap gap-2'>
            <div className='flex gap-2'>
              <input
                type='date'
                placeholder='Start Date'
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              />
              <input
                type='date'
                placeholder='End Date'
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              />
            </div>
            <select
              name='type'
              id='type'
              className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
            >
              <option value='all'>Select Casino Type</option>
              <option value='our-casino'>Our Casino</option>
              <option value='our-vip-casino'>Our VIP Casino</option>
              <option value='our-premium-casino'>Our Premium Casino</option>
              <option value='our-virtual-casino'>Our Virtual Casino</option>
              <option value='tembo'>Tembo</option>
              <option value='live-casino'>Live Casino</option>
              <option value='slot-game'>Slot Game</option>
              <option value='fantasy-game'>Fantasy Game</option>
            </select>
            <button className='bg-primary text-primary h-[38px] w-full rounded-xs px-4 py-1 text-[16px] font-[400] lg:w-auto'>
              Submit
            </button>
          </div>
          <div className='mt-4 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-[16px] font-[400]'>Show</span>
              <select
                name='entries'
                id='entries'
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              >
                <option value='10'>10</option>
                <option value='20'>20</option>
                <option value='30'>30</option>
                <option value='40'>40</option>
                <option value='50'>50</option>
              </select>
              <span className='text-[16px] font-[400]'>Entries</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-[16px] font-[400]'>Search:</span>
              <input
                type='text'
                placeholder='Search'
                className='h-[38px] w-[90px] border border-[#dbdbdb] p-1 outline-none lg:w-auto'
              />
            </div>
          </div>
          <div className='scrollbar-hide mt-4 overflow-x-auto'>
            <table className='w-full min-w-[500px] bg-[#f7f7f7]'>
              <thead className='border border-[#c7c8ca]'>
                <tr>
                  <th className='h-8 min-w-[150px] border-r border-[#c7c8ca] p-1 text-left text-sm font-semibold whitespace-nowrap'>
                    Round Id
                  </th>
                  <th className='h-8 min-w-[300px] border-r border-[#c7c8ca] p-1 text-left text-sm font-semibold whitespace-nowrap'>
                    Winner
                  </th>
                </tr>
              </thead>
              <tbody>{/* Table rows will go here */}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CasinoResults;
