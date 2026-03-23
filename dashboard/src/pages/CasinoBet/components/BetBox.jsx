import React, { memo } from 'react';
import { FaLock } from 'react-icons/fa';

/**
 * BetBox - A clickable betting option box
 * Used primarily in Baccarat games for Player/Banker/Tie options
 */
const BetBox = memo(function BetBox({
  option,
  gradient,
  align,
  rounded,
  height,
  onBetClick,
}) {
  if (!option) return null;

  const handleClick = async () => {
    if (option.b > 0 && onBetClick) {
      await onBetClick(option);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative grid h-full cursor-pointer content-center gap-1 overflow-hidden px-5 leading-none uppercase ${align} ${rounded} ${height}`}
      style={{ background: gradient }}
    >
      <span>{option.nat}</span>
      <span>{option.b}</span>
      {option.gstatus === 'SUSPENDED' && (
        <div className='absolute inset-0 flex items-center justify-center rounded bg-gray-950/70 text-lg font-bold text-white'>
          <FaLock />
        </div>
      )}
    </div>
  );
});

export default BetBox;
