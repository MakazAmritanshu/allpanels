import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCasinoResultData } from '../../redux/reducer/casinoSlice';
import ResultPopup from '../CasinoBet/components/CasinoResult1';
const casinos = [
  // Teenpatti
  {
    id: 1,
    slug: 'teen62',
    name: 'V VIP Teenpatti 1-day',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen62.gif',
  },
  // {
  //   id: 2,
  //   slug: 'teen20v1',
  //   name: '20-20 Teenpatti VIP1',
  //   category: 'Teenpatti',
  //   image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20v1.jpg',
  // },
  {
    id: 3,
    slug: 'poison',
    name: 'Teenpatti Poison One Day',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poison.jpg',
  },
  // {
  //   id: 4,
  //   slug: 'teenunique',
  //   name: 'Unique Teenpatti',
  //   category: 'Teenpatti',
  //   image:
  //     'https://dataobj.ecoassetsservice.com/casino-icons/lc/teenunique.jpg',
  // },
  {
    id: 4,
    slug: 'teenmuf',
    name: 'Teen Patti Muf',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teenmuf.jpg',
  },
  {
    id: 5,
    slug: 'poison20',
    name: 'Teenpatti Poison 20-20',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poison20.jpg',
  },
  {
    id: 6,
    slug: 'joker120',
    name: 'Unlimited Joker 20-20',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/joker120.jpg',
  },
  {
    id: 7,
    slug: 'joker20',
    name: 'Teenpatti Joker 20-20',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/joker20.jpg',
  },
  {
    id: 8,
    slug: 'joker1',
    name: 'Unlimited Joker Oneday',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/joker1.jpg',
  },
  {
    id: 9,
    slug: 'teen20c',
    name: '20-20 Teenpatti C',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20c.jpg',
  },
  {
    id: 10,
    slug: 'teen41',
    name: 'Queen Top Open Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen41.jpg',
  },
  {
    id: 11,
    slug: 'teen42',
    name: 'Jack Top Open Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen42.jpg',
  },
  {
    id: 12,
    slug: 'teen33',
    name: 'Instant Teenpatti 3.0',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen33.jpg',
  },
  {
    id: 13,
    slug: 'teen32',
    name: 'Instant Teenpatti 2.0',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen32.jpg',
  },
  {
    id: 14,
    slug: 'teen',
    name: 'Teenpatti 1-day',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen.jpg',
  },
  {
    id: 15,
    slug: 'teen20',
    name: '20-20 Teenpatti',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen20.jpg',
  },
  {
    id: 16,
    slug: 'teen9',
    name: 'Teenpatti Test',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen9.jpg',
  },
  {
    id: 17,
    slug: 'teen8',
    name: 'Teenpatti Open',
    category: 'Teenpatti',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/teen8.jpg',
  },
  // Others
  {
    id: 18,
    slug: 'worli3',
    name: 'Matka',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/worli3.gif',
  },
  {
    id: 19,
    slug: 'dolidana',
    name: 'Dolidana',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dolidana.gif',
  },
  {
    id: 20,
    slug: 'mogambo',
    name: 'Mogambo',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/mogambo.gif',
  },
  {
    id: 21,
    slug: 'lucky5',
    name: 'Lucky 6',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky5.jpg',
  },
  {
    id: 22,
    slug: 'roulette12',
    name: 'Beach Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/roulette12.jpg',
  },
  {
    id: 23,
    slug: 'roulette13',
    name: 'Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/roulette13.jpg',
  },
  {
    id: 24,
    slug: 'roulette11',
    name: 'Golden Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/roulette11.jpg',
  },
  {
    id: 25,
    slug: 'btable2',
    name: 'Bollywood Casino 2',
    category: 'Bollywood',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/btable2.jpg',
  },
  {
    id: 26,
    slug: 'ourroullete',
    name: 'Unique Roulette',
    category: 'Roulette',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/ourroullete.jpg',
  },
  {
    id: 27,
    slug: 'superover3',
    name: 'Mini Superover',
    category: 'Others',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/superover3.jpg',
  },
  {
    id: 28,
    slug: 'goal',
    name: 'Goal',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/goal.jpg',
  },
  {
    id: 29,
    slug: 'ab4',
    name: 'ANDAR BAHAR 150 cards',
    category: 'Andar Bahar',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/ab4.jpg',
  },
  {
    id: 30,
    slug: 'lucky15',
    name: 'Lucky 15',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky15.jpg',
  },
  {
    id: 31,
    slug: 'superover2',
    name: 'Super Over2',
    category: 'Others',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/superover2.jpg',
  },
  {
    id: 32,
    slug: 'sicbo2',
    name: 'Sic Bo2',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/sicbo2.jpg',
  },
  {
    id: 33,
    slug: 'sicbo',
    name: 'Sic Bo',
    category: 'Others',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/sicbo.jpg',
  },
  {
    id: 34,
    slug: 'ballbyball',
    name: 'Ball by Ball',
    category: 'Others',
    image:
      'https://dataobj.ecoassetsservice.com/casino-icons/lc/ballbyball.jpg',
  },
  {
    id: 35,
    slug: 'poker',
    name: 'Poker 1-Day',
    category: 'Poker',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poker.jpg',
  },
  {
    id: 36,
    slug: 'poker20',
    name: '20-20 Poker',
    category: 'Poker',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poker20.jpg',
  },
  {
    id: 37,
    slug: 'poker6',
    name: 'Poker 6 Players',
    category: 'Poker',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/poker6.jpg',
  },
  {
    id: 38,
    slug: 'baccarat',
    name: 'Baccarat',
    category: 'Baccarat',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/baccarat.jpg',
  },
  {
    id: 39,
    slug: 'baccarat2',
    name: 'Baccarat 2',
    category: 'Baccarat',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/baccarat2.jpg',
  },
  {
    id: 40,
    slug: 'dt20',
    name: '20-20 Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dt20.jpg',
  },
  {
    id: 41,
    slug: 'dt6',
    name: '1 Day Dragon Tiger',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dt6.jpg',
  },
  {
    id: 42,
    slug: 'dtl20',
    name: '20-20 D T L',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dtl20.jpg',
  },
  {
    id: 43,
    slug: 'dt202',
    name: '20-20 Dragon Tiger 2',
    category: 'Dragon Tiger',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/dt202.jpg',
  },
  {
    id: 44,
    slug: 'card32',
    name: '32 Cards A',
    category: '32 Cards',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/card32.jpg',
  },
  {
    id: 45,
    slug: 'card32eu',
    name: '32 Cards B',
    category: '32 Cards',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/card32eu.jpg',
  },
  {
    id: 46,
    slug: 'ab20',
    name: 'Andar Bahar',
    category: 'Andar Bahar',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/ab20.jpg',
  },
  {
    id: 47,
    slug: 'abj',
    name: 'Andar Bahar 2',
    category: 'Andar Bahar',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/abj.jpg',
  },
  {
    id: 48,
    slug: 'lucky7',
    name: 'Lucky 7 - A',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky7.jpg',
  },
  {
    id: 49,
    slug: 'lucky7eu',
    name: 'Lucky 7 - B',
    category: 'Lucky 7',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/lucky7eu.jpg',
  },
  {
    id: 50,
    slug: '3cardj',
    name: '3 Cards Judgement',
    category: '3 Card Judgement',
    image: 'https://dataobj.ecoassetsservice.com/casino-icons/lc/3cardj.jpg',
  },
];
function CasinoResults() {
  const dispatch = useDispatch();
  const { resultData, loader, error } = useSelector((state) => state.casino);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedGameId, setSelectedGameId] = useState(
    casinos?.[0]?.slug || ''
  );
  const [entries, setEntries] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (selectedGameId) {
      dispatch(fetchCasinoResultData(selectedGameId));
    }
  }, [dispatch, selectedGameId]);

  const handleSubmit = () => {
    if (!selectedGameId) return;
    dispatch(fetchCasinoResultData(selectedGameId));
  };

  const resultRows = useMemo(() => {
    if (Array.isArray(resultData?.res)) return resultData.res;
    if (Array.isArray(resultData)) return resultData;
    return [];
  }, [resultData]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = query
      ? resultRows.filter((row) => {
          const roundId = String(row?.mid ?? row?.roundId ?? '').toLowerCase();
          const winner = String(row?.win ?? row?.winner ?? '').toLowerCase();
          return roundId.includes(query) || winner.includes(query);
        })
      : resultRows;
    return rows.slice(0, Number(entries));
  }, [resultRows, search, entries]);

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
                value={selectedDate}
                min={today}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder='Start Date'
                className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
              />
            </div>
            <select
              name='type'
              id='type'
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className='h-[38px] border border-[#dbdbdb] p-1 outline-none'
            >
              {casinos.map((casino) => (
                <option key={casino.id} value={casino.slug}>
                  {casino.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSubmit}
              className='bg-primary text-primary h-[38px] w-full rounded-xs px-4 py-1 text-[16px] font-[400] lg:w-auto'
            >
              Submit
            </button>
          </div>
          <div className='mt-4 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <span className='text-[16px] font-[400]'>Show</span>
              <select
                name='entries'
                id='entries'
                value={entries}
                onChange={(e) => setEntries(Number(e.target.value))}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              <tbody>
                {loader?.result ? (
                  <tr>
                    <td
                      colSpan={2}
                      className='border border-[#c7c8ca] p-2 text-center text-sm'
                    >
                      Loading...
                    </td>
                  </tr>
                ) : error?.result ? (
                  <tr>
                    <td
                      colSpan={2}
                      className='border border-[#c7c8ca] p-2 text-center text-sm text-red-500'
                    >
                      {error.result}
                    </td>
                  </tr>
                ) : filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <tr key={`${row?.mid || row?.roundId || 'row'}-${index}`}>
                      <td
                        onClick={() => setSelectedItem(row)}
                        className='cursor-pointer border border-[#c7c8ca] p-1 text-sm underline-offset-2 hover:underline'
                      >
                        {row?.mid || row?.roundId || '-'}
                      </td>
                      <td
                        onClick={() => setSelectedItem(row)}
                        className='cursor-pointer border border-[#c7c8ca] p-1 text-sm underline-offset-2 hover:underline'
                      >
                        {String(row?.win ?? row?.winner ?? '') === '1'
                          ? 'Player A'
                          : String(row?.win ?? row?.winner ?? '') === '2'
                            ? 'Player B'
                            : row?.win || row?.winner || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className='border border-[#c7c8ca] p-2 text-center text-sm'
                    >
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {selectedItem && (
        <ResultPopup
          gameId={selectedGameId}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          showSideBets={true}
        />
      )}
    </div>
  );
}

export default CasinoResults;
