import React, { memo } from 'react';
import { getResultLabel, getResultBgColor } from '../constants';

/**
 * RecentResults - Horizontal scrollable list of recent game results
 * Each result shows the winner (A/B/T for regular, P/B/T for baccarat)
 */
const RecentResults = memo(function RecentResults({
  gameid,
  currentGameId,
  results,
  onItemClick,
}) {
  // Only show results from the correct game
  if (currentGameId !== gameid || !results?.length) {
    return (
      <div className='mb-25 overflow-x-auto bg-black p-1 whitespace-nowrap text-white'>
        <span className='pr-4 text-[1.07375rem] font-bold'>Recent Result</span>
      </div>
    );
  }

  return (
    <div className='mb-25 overflow-x-auto bg-black p-1 whitespace-nowrap text-white'>
      <span className='pr-4 text-[1.07375rem] font-bold'>Recent Result</span>
      {results.map((item, index) => {
        const label = getResultLabel(gameid, item.win);
        const bgColor = getResultBgColor(gameid, item.win);

        return (
          <span
            onClick={() => onItemClick?.(item)}
            key={index}
            className={`mr-2 inline-flex h-[34px] w-[38px] cursor-pointer items-center justify-center rounded-full leading-none font-bold text-black ${bgColor}`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
});

export default RecentResults;
