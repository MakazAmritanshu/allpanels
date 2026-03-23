import { memo } from 'react';
import { getGameRules } from '../rulesData';

const RulesPopup = memo(function RulesPopup({ gameid, onClose }) {
  const { title, img, rules } = getGameRules(gameid);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
      onClick={onClose}
    >
      <div
        className='mx-4 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border border-yellow-500/30 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 flex items-center justify-between rounded-t-xl bg-gradient-to-r from-yellow-600 to-yellow-500 px-4 py-3'>
          <h2 className='text-lg font-bold text-black'>{title} - Rules</h2>
          <button
            onClick={onClose}
            className='flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-black transition-colors hover:bg-black/40'
          >
            ✕
          </button>
        </div>

        {/* Rules List */}
        <ul className='space-y-3 p-4'>
          {rules.map((rule, index) => (
            <li key={index} className='flex gap-3 text-sm text-gray-200'>
              <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400'>
                {index + 1}
              </span>
              <span className='pt-0.5'>{rule}</span>
            </li>
          ))}
        </ul>
        <div className='px-5 pb-5'>
          <img src={img} className='rounded-md' />
        </div>
      </div>
    </div>
  );
});

export default RulesPopup;
