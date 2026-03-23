import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSoccerData } from '../../redux/reducer/soccerSlice';
import { FaCircle } from 'react-icons/fa';
import { GiTv } from 'react-icons/gi';
import Bm from '../../assets/ic_bm.png';
import F from '../../assets/ic_fancy.png';

const Cell = ({ value, type }) => (
  <div
    className={`flex h-6 items-center justify-center text-sm font-semibold ${type === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}
  >
    {value}
  </div>
);

export default function Football() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { matches, loader, error } = useSelector((state) => state.soccer);
  console.log('football matches', matches);
  useEffect(() => {
    dispatch(fetchSoccerData());
  }, [dispatch]);
  return (
    <div className='w-full text-sm text-gray-900'>
      {/* DESKTOP HEADER */}
      <div className='hidden grid-cols-[1fr_70px_70px_70px_70px_70px_70px] border border-b-0 border-gray-300 bg-gray-100 font-bold md:grid'>
        <div className='px-2 py-2'>Game</div>
        <div className='col-span-2 text-center'>1</div>
        <div className='col-span-2 text-center'>X</div>
        <div className='col-span-2 text-center'>2</div>
      </div>

      {/* ROWS */}
      {matches.map((m) => (
        <div key={m.id} className='border border-t-0 border-gray-300'>
          {/* ================= DESKTOP VIEW ================= */}
          <div
            className='hidden cursor-pointer grid-cols-[1fr_70px_70px_70px_70px_70px_70px] hover:bg-gray-50 md:grid'
            onClick={() =>
              navigate(`/football-bet/${m.game}/${m.id}`, {
                state: { time: m.time },
              })
            }
          >
            <div className='flex items-center justify-between gap-2 px-2'>
              <div className='flex items-center gap-2'>
                <div className='text-[14px] font-[400] text-[#333]'>
                  {m.game}
                </div>
                <div className='text-[14px] font-[400] text-[#333]'>
                  {m.time}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {m.inplay && (
                  <FaCircle className='h-[14px] w-[14px] text-[#28a745]' />
                )}
                {m.tv && <GiTv className='h-[14px] w-[14px]' />}
                {m.bm && <img src={Bm} alt='Bm' className='h-[12px]' />}
                {m.f && <img src={F} alt='F' className='h-[12px]' />}
              </div>
            </div>

            <Cell value={m.one.back} type='back' />
            <Cell value={m.one.lay} type='lay' />

            <Cell value={m.x.back} type='back' />
            <Cell value={m.x.lay} type='lay' />

            <Cell value={m.two.back} type='back' />
            <Cell value={m.two.lay} type='lay' />
          </div>

          {/* ================= MOBILE VIEW ================= */}
          <div
            className='space-y-2 bg-white p-2 md:hidden'
            onClick={() =>
              navigate(`/football-bet/${m.game}/${m.id}`, {
                state: { time: m.time },
              })
            }
          >
            {/* Game info */}
            <div className='flex items-center justify-between gap-2'>
              <div>
                <div className='text-[14px] font-bold text-[#333]'>
                  {m.game}
                </div>
                <div className='text-[12px] font-[400] text-[#333]'>
                  {m.time}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                {m.inplay && (
                  <FaCircle className='h-[12px] w-[12px] text-[#28a745]' />
                )}
                {m.tv && <GiTv className='h-[14px] w-[14px]' />}
                {m.bm && <img src={Bm} alt='Bm' className='h-[12px]' />}
                {m.f && <img src={F} alt='F' className='h-[12px]' />}
              </div>
            </div>

            {/* Labels */}
            <div className='grid grid-cols-3 text-center text-xs font-semibold text-gray-600'>
              <div>1</div>
              <div>X</div>
              <div>2</div>
            </div>

            {/* Odds */}
            <div className='grid grid-cols-3 gap-1'>
              <div className='grid grid-cols-2 gap-1'>
                <Cell value={m.one.back} type='back' />
                <Cell value={m.one.lay} type='lay' />
              </div>
              <div className='grid grid-cols-2 gap-1'>
                <Cell value={m.x.back} type='back' />
                <Cell value={m.x.lay} type='lay' />
              </div>
              <div className='grid grid-cols-2 gap-1'>
                <Cell value={m.two.back} type='back' />
                <Cell value={m.two.lay} type='lay' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
