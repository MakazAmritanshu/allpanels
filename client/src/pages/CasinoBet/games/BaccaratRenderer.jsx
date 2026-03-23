import React, { memo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import BetBox from '../components/BetBox';
import QuickAmountGrid from '../components/QuickAmountGrid';
import {
  getBaccaratChartData,
  getBaccaratChartOptions,
} from '../utils/gameUtils';

/**
 * BaccaratRenderer - Renders the betting UI for Baccarat games
 * Features Player/Banker/Tie layout with statistics pie chart
 */
const BaccaratRenderer = memo(function BaccaratRenderer({
  bettingData,
  resultData,
  betControl,
  setBetControl,
  setValue,
  betAmount,
  betOdds,
  updateAmount,
  placeBet,
}) {
  const chartData = getBaccaratChartData(resultData);
  const chartOptions = getBaccaratChartOptions(chartData);

  const handleBetClick = async (option) => {
    if (option.b > 0) {
      setBetControl({ ...option, type: 'back', odds: option.b });
      setValue(option.b, option.nat, 'back');
    }

    const betType = betControl?.type;
    const teamName = betControl?.nat;
    const maxAmount = betControl?.max || 100000;
    const oddsValue = betControl?.odds || betOdds;

    await placeBet(betType, teamName, maxAmount, oddsValue);
  };

  return (
    <>
      <div className='relative my-5 flex h-[120px] text-[16px] font-semibold text-white'>
        <BetBox
          option={bettingData?.sub[0]}
          gradient='linear-gradient(-180deg,#1285e2 0,#0b5795 100%)'
          align='flex-1/2'
          rounded='rounded-l-2xl'
          height='w-[90px]'
          onBetClick={handleBetClick}
        />
        <div className='absolute left-1/2 z-9 h-full -translate-x-1/2'>
          <BetBox
            option={bettingData?.sub[2]}
            gradient='linear-gradient(-180deg,#11b24b 0,#1c6235 100%)'
            align='justify-items-center rounded-full w-[120px]'
            height='w-[90px]'
            onBetClick={handleBetClick}
          />
        </div>
        <BetBox
          option={bettingData?.sub[1]}
          gradient='linear-gradient(-180deg,#af2736 0,#93212d 100%)'
          align='justify-items-end flex-1/2'
          rounded='rounded-r-2xl'
          height='w-[90px]'
          onBetClick={handleBetClick}
        />
      </div>

      <div className='my-5 flex h-[100px] gap-2 text-[16px] font-semibold text-white'>
        <BetBox
          option={bettingData?.sub[3]}
          gradient='linear-gradient(-180deg,#1285e2 0,#0b5795 100%)'
          align='justify-items-center'
          rounded='rounded-l-2xl flex-1/2'
          height='w-[70px]'
          onBetClick={handleBetClick}
        />
        <BetBox
          option={bettingData?.sub[4]}
          gradient='linear-gradient(-180deg,#af2736 0,#93212d 100%)'
          align='justify-items-center'
          rounded='rounded-r-2xl flex-1/2'
          height='w-[70px]'
          onBetClick={handleBetClick}
        />
      </div>

      <div className='flex flex-col gap-2 px-3 md:flex-row md:px-0'>
        <div className='w-full md:basis-2/5'>
          <div className='font-bold'>STATISTICS</div>

          <div className='flex w-full'>
            <div className='w-full'>
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </div>
            <div className=''>
              {chartData.map((item, i) => (
                <div
                  key={i}
                  className='flex items-center gap-1 rounded-md py-1 font-bold capitalize'
                >
                  <span
                    className='block h-4 w-4 rounded-full'
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='md:basis-3/5'>
          <div className='font-bold'>CHIPS</div>
          <QuickAmountGrid
            betAmount={betAmount}
            onAmountSelect={updateAmount}
            variant='chips'
          />
        </div>
      </div>
    </>
  );
});

export default BaccaratRenderer;
