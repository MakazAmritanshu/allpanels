import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCricketData } from '../../redux/reducer/cricketSlice';
import { FaCircle } from 'react-icons/fa';
import { GiTv } from 'react-icons/gi';
import Bm from '../../assets/ic_bm.png';
import F from '../../assets/ic_fancy.png';
const matche = [
  {
    id: 1,
    game: 'Delhi v Vidarbha',
    time: '13/01/2026 09:00',
    one: { back: 6.2, lay: 11 },
    x: { back: '-', lay: '-' },
    two: { back: 1.18, lay: 1.19 },
  },
  {
    id: 2,
    game: 'Punjab v Madhya Pradesh',
    time: '13/01/2026 09:00',
    one: { back: '-', lay: 1.01 },
    x: { back: '-', lay: '-' },
    two: { back: 1000, lay: '-' },
  },
  {
    id: 3,
    game: 'Melbourne Stars v Adelaide Strikers',
    time: '13/01/2026 13:45',
    one: { back: '-', lay: 1.01 },
    x: { back: '-', lay: '-' },
    two: { back: 490, lay: 500 },
  },
  {
    id: 4,
    game: 'GAW XI v SNP XI',
    time: '13/01/2026 15:40',
    one: { back: '-', lay: '-' },
    x: { back: '-', lay: '-' },
    two: { back: '-', lay: '-' },
  },
  {
    id: 5,
    game: 'Rajasthan Royals XI v Gujarat Titans XI',
    time: '13/01/2026 16:10',
    one: { back: '-', lay: '-' },
    x: { back: '-', lay: '-' },
    two: { back: '-', lay: '-' },
  },
  {
    id: 6,
    game: 'Bangladesh T10 v South Africa T10',
    time: '13/01/2026 16:15',
    one: { back: '-', lay: '-' },
    x: { back: '-', lay: '-' },
    two: { back: '-', lay: '-' },
  },
  {
    id: 7,
    game: 'New Zealand T10 v Pakistan T10',
    time: '13/01/2026 16:30',
    one: { back: '-', lay: '-' },
    x: { back: '-', lay: '-' },
    two: { back: '-', lay: '-' },
  },
  {
    id: 8,
    game: 'Mumbai Indians W v Gujarat Giants W',
    time: '13/01/2026 19:30',
    one: { back: 1.73, lay: 1.74 },
    x: { back: '-', lay: '-' },
    two: { back: 2.34, lay: 2.36 },
  },
  {
    id: 9,
    game: 'Paarl Royals v Durban Super Giants',
    time: '13/01/2026 21:00',
    one: { back: 2.3, lay: 2.4 },
    x: { back: '-', lay: '-' },
    two: { back: 1.71, lay: 1.76 },
  },
  {
    id: 10,
    game: 'Auckland Aces v Canterbury Kings',
    time: '14/01/2026 05:10',
    one: { back: 1.86, lay: 1.89 },
    x: { back: '-', lay: '-' },
    two: { back: 2.12, lay: 2.16 },
  },
  {
    id: 11,
    game: 'Auckland Hearts W v Canterbury Magicians W',
    time: '14/01/2026 09:20',
    one: { back: 1.5, lay: 1.52 },
    x: { back: '-', lay: '-' },
    two: { back: 2.94, lay: 3 },
  },
  {
    id: 12,
    game: 'India v New Zealand',
    time: '14/01/2026 13:00',
    one: { back: 1.21, lay: 1.22 },
    x: { back: '-', lay: '-' },
    two: { back: 5.5, lay: 5.6 },
  },
  {
    id: 13,
    game: 'Hobart Hurricanes v Brisbane Heat',
    time: '14/01/2026 13:45',
    one: { back: 1.68, lay: 1.69 },
    x: { back: '-', lay: '-' },
    two: { back: 2.44, lay: 2.48 },
  },
  {
    id: 14,
    game: 'UP Warriorz W v Delhi Capitals W',
    time: '14/01/2026 19:30',
    one: { back: 2.22, lay: 2.26 },
    x: { back: '-', lay: '-' },
    two: { back: 1.8, lay: 1.82 },
  },
  {
    id: 15,
    game: 'Sunrisers Eastern Cape v Joburg Super Kings',
    time: '14/01/2026 21:00',
    one: { back: 1.74, lay: 1.77 },
    x: { back: '-', lay: '-' },
    two: { back: 2.28, lay: 2.36 },
  },
  {
    id: 16,
    game: 'Otago Sparks W v Wellington Blaze W',
    time: '15/01/2026 05:10',
    one: { back: 2.28, lay: 2.52 },
    x: { back: '-', lay: '-' },
    two: { back: 1.66, lay: 1.79 },
  },
  {
    id: 17,
    game: 'Otago Volts v Wellington Firebirds',
    time: '15/01/2026 08:55',
    one: { back: 1.97, lay: 2 },
    x: { back: '-', lay: '-' },
    two: { back: 2, lay: 2.04 },
  },
  {
    id: 18,
    game: 'Chattogram Royals v Noakhali Express',
    time: '15/01/2026 12:30',
    one: { back: 1.35, lay: 1.81 },
    x: { back: '-', lay: '-' },
    two: { back: 2.24, lay: 3.85 },
  },
];

const Cell = ({ value, type }) => (
  <div
    className={`flex h-6 items-center justify-center text-sm font-semibold ${type === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}
  >
    {value}
  </div>
);

// export default function CricketTable() {
//   return (
//     <div className="w-full text-sm text-gray-900 border border-gray-300">
//       {/* Header */}
//       <div className="grid grid-cols-[1fr_70px_70px_70px_70px_70px_70px] bg-gray-100 font-bold border-b">
//         <div className="px-2 py-2">Game</div>
//         <div className="col-span-2 text-center">1</div>
//         <div className="col-span-2 text-center">X</div>
//         <div className="col-span-2 text-center">2</div>
//       </div>

//       {/* Rows */}
//       {matches.map((m) => (
//         <div
//           key={m.id}
//           className="grid grid-cols-[1fr_70px_70px_70px_70px_70px_70px] border-b hover:bg-gray-50"
//         >
//           {/* Game Info */}
//           <div className="px-2 flex items-center gap-2">
//             <div className="text-[14px] font-[400] text-[#333]">{m.game}</div>
//             <div className="text-[14px] font-[400] text-[#333]">{m.time}</div>
//           </div>

//           {/* 1 */}
//           <Cell value={m.one.back} type="back" />
//           <Cell value={m.one.lay} type="lay" />

//           {/* X */}
//           <Cell value={m.x.back} type="back" />
//           <Cell value={m.x.lay} type="lay" />

//           {/* 2 */}
//           <Cell value={m.two.back} type="back" />
//           <Cell value={m.two.lay} type="lay" />
//         </div>
//       ))}
//     </div>
//   );
// }

export default function Cricket() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.user);
  // console.log(user)
  const { matches, loader, error } = useSelector((state) => state.cricket);
  console.log('matches', matches);
  useEffect(() => {
    dispatch(fetchCricketData());
  }, [dispatch]);

  // Show loading state
  // if (loader) {
  //   return (
  //     <div className="w-full text-sm text-gray-900 flex items-center justify-center py-8">
  //       <div className="text-gray-500">Loading...</div>
  //     </div>
  //   );
  // }

  // Show error state
  // if (error) {
  //   return (
  //     <div className="w-full text-sm text-gray-900 flex items-center justify-center py-8">
  //       <div className="text-red-500">Error: {error}</div>
  //     </div>
  //   );
  // }

  // Show no data message
  // if (!matches || matches.length === 0) {
  //   return (
  //     <div className="w-full text-sm text-gray-900 flex items-center justify-center py-8">
  //       <div className="text-gray-500 text-lg">No data found</div>
  //     </div>
  //   );
  // }

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
              navigate(`/cricket-bet/${m.game}/${m.id}`, {
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
          <div className='space-y-2 bg-white p-1 md:hidden'>
            {/* Game info */}
            <div
              className='flex items-center justify-between gap-2 mb-0'
              onClick={() =>
                navigate(`/cricket-bet/${m.game}/${m.id}`, {
                  state: { time: m.time },
                })
              }
            >
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
            <div className='grid grid-cols-3 text-center font-semibold mb-0'>
              <div>1</div>
              <div>X</div>
              <div>2</div>
            </div>

            {/* Odds */}
            <div
              className='grid grid-cols-3'
              onClick={() =>
                navigate(`/cricket-bet/${m.game}/${m.id}`, {
                  state: { time: m.time },
                })
              }
            >
              <div className='grid grid-cols-2'>
                <Cell value={m.one.back} type='back' />
                <Cell value={m.one.lay} type='lay' />
              </div>
              <div className='grid grid-cols-2'>
                <Cell value={m.x.back} type='back' />
                <Cell value={m.x.lay} type='lay' />
              </div>
              <div className='grid grid-cols-2'>
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
