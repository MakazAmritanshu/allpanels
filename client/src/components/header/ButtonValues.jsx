import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateQuickStakes } from '../../redux/reducer/authReducer';
import { toast } from 'react-toastify';

const GAME_DEFAULTS = [
  { label: '1k', value: 1000 },
  { label: '2k', value: 2000 },
  { label: '5k', value: 5000 },
  { label: '10k', value: 10000 },
  { label: '20k', value: 20000 },
  { label: '25k', value: 25000 },
  { label: '50k', value: 50000 },
  { label: '75k', value: 75000 },
  { label: '1L', value: 100000 },
  { label: '2L', value: 200000 },
];

const CASINO_DEFAULTS = [
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '500', value: 500 },
  { label: '5k', value: 5000 },
  { label: '10k', value: 10000 },
  { label: '25k', value: 25000 },
  { label: '100k', value: 100000 },
];

function formatLabel(val) {
  if (val >= 100000) return val / 100000 + 'L';
  if (val >= 1000) return val / 1000 + 'k';
  return String(val);
}

function buildButtons(defaults, savedValues) {
  if (!savedValues || savedValues.length === 0)
    return defaults.map((d) => ({ ...d }));

  const result = defaults.map((def, i) => {
    const item = savedValues[i];
    if (!item) return { ...def };
    if (typeof item === 'object' && item.label && item.value) {
      return { label: item.label, value: item.value };
    }
    if (typeof item === 'number' && item > 0) {
      return { label: def.label || formatLabel(item), value: item };
    }
    return { ...def };
  });

  return result;
}

function ButtonValues({ onClose }) {
  const dispatch = useDispatch();
  const { userInfo, loading } = useSelector((state) => state.auth);

  const [selectedTab, setSelectedTab] = useState('game');
  const [gameButtons, setGameButtons] = useState(
    GAME_DEFAULTS.map((d) => ({ ...d }))
  );
  const [casinoButtons, setCasinoButtons] = useState(
    CASINO_DEFAULTS.map((d) => ({ ...d }))
  );

  useEffect(() => {
    if (userInfo) {
      if (userInfo.quickStakes?.length) {
        setGameButtons(buildButtons(GAME_DEFAULTS, userInfo.quickStakes));
      }
      if (userInfo.casinoQuickStakes?.length) {
        setCasinoButtons(
          buildButtons(CASINO_DEFAULTS, userInfo.casinoQuickStakes)
        );
      }
    }
  }, [userInfo]);

  const buttons = selectedTab === 'game' ? gameButtons : casinoButtons;

  const handleChange = (index, field, rawValue) => {
    const setter = selectedTab === 'game' ? setGameButtons : setCasinoButtons;
    setter((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'value' ? Number(rawValue) || 0 : rawValue,
      };
      return updated;
    });
  };

  const handleUpdate = async () => {
    const payload = {};
    const btns = selectedTab === 'game' ? gameButtons : casinoButtons;

    const items = btns.map((b) => ({
      label: b.label.trim(),
      value: Number(b.value),
    }));
    if (items.some((i) => !i.label || !i.value || i.value <= 0)) {
      toast.error('All stakes must have a label and a positive value');
      return;
    }

    if (selectedTab === 'game') {
      payload.quickStakes = items;
    } else {
      payload.casinoQuickStakes = items;
    }

    try {
      const res = await dispatch(updateQuickStakes(payload)).unwrap();
      toast.success(res.message || 'Stakes updated successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to update stakes');
    }
  };

  return (
    <div className='fixed inset-0 z-60 flex items-start justify-center overflow-auto bg-[rgba(17,17,17,0.49)] pt-10'>
      <div className="w-[95%] max-w-4xl rounded-lg bg-white font-['Times_New_Roman'] shadow-lg md:w-[45%]">
        <div className='bg-primary flex items-center justify-between p-2'>
          <h2 className='text-secondary text-lg font-semibold'>
            Set Button Value
          </h2>
          <button
            onClick={onClose}
            className='text-secondary text-xl font-bold'
          >
            ✕
          </button>
        </div>
        <div className='h-[500px] overflow-x-auto overflow-y-scroll p-2'>
          <div className='flex'>
            <div
              className={`${selectedTab === 'game' ? 'bg-secondary text-white' : 'bg-primary text-primary'} cursor-pointer px-4 py-1`}
              onClick={() => setSelectedTab('game')}
            >
              Game Buttons
            </div>
            <div
              className={`${selectedTab === 'casino' ? 'bg-secondary text-white' : 'bg-primary text-primary'} cursor-pointer px-4 py-1`}
              onClick={() => setSelectedTab('casino')}
            >
              Casino Buttons
            </div>
          </div>
          <div className='p-4'>
            <div className='mb-2 flex justify-between font-semibold'>
              <span className='text-[#2C3E50]'>Price Label:</span>
              <span className='text-[#2C3E50]'>Price Value:</span>
            </div>

            {buttons.map((btn, index) => (
              <div key={index} className='mb-3 flex justify-between gap-3'>
                <input
                  type='text'
                  value={btn.label}
                  onChange={(e) => handleChange(index, 'label', e.target.value)}
                  className='w-1/2 border p-2 text-[#2C3E50]'
                />
                <input
                  type='number'
                  value={btn.value}
                  onChange={(e) => handleChange(index, 'value', e.target.value)}
                  className='w-1/2 border p-2 text-[#2C3E50]'
                />
              </div>
            ))}

            <button
              className='bg-primary mt-2 w-full py-2 text-white disabled:opacity-60'
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ButtonValues;
