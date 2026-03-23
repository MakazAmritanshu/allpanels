import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  getGraphData,
  getGraphTodayData,
} from '../redux/reducer/downlineReducer';
import { useEffect } from 'react';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { graphbackup, graphtoday, loading } = useSelector(
    (state) => state.downline
  );
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 12);
  const formatDate = (date) => date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(currentDate));

  useEffect(() => {
    dispatch(
      getGraphData({
        startDate,
        endDate,
      })
    );
    dispatch(
      getGraphTodayData({
        startDate: currentDate,
        endDate: currentDate,
      })
    );
  }, [dispatch]);

  const PLdata = graphbackup?.report;
  const LivePLdata = graphtoday?.report;
  const Totaldata = graphbackup?.total;
  console.log(graphtoday, 'myReportseventData');

  // Transform the data for the PieChart
  const transformBackupData = (data) => {
    return data?.map((item) => ({
      name: item.name,
      value: Math.abs(item.myProfit), // Using absolute value for display
      originalProfit: item.myProfit, // Keeping original value for reference
    }));
  };
  const transformLiveData = (data) => {
    return data?.map((item) => ({
      name: item.name,
      value: Math.abs(item.myProfit), // Using absolute value for display
      originalProfit: item.myProfit, // Keeping original value for reference
    }));
  };

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
  ];
  const formatNumber = (v) => {
    const num = Math.abs(Number(v));
    if (isNaN(num)) return 0;
    return Number.isInteger(num)
      ? num
      : num.toFixed(v.toString().split('.')[1]?.length === 1 ? 1 : 2);
  };
  // Custom tooltip formatter to show profit/loss
  const customTooltipFormatter = (value, name, props) => {
    const originalProfit = props.payload.originalProfit;
    const profitText =
      originalProfit < 0
        ? `Loss: ${formatNumber(originalProfit)}`
        : `Profit: ${formatNumber(originalProfit)}`;
    return [`${formatNumber(value)}`, `${name} (${profitText})`];
  };

  return (
    <>
      <Navbar />
      <div className='mt-[20px] flex flex-col justify-center gap-6 px-[15px] pb-4 md:mt-[0px] md:flex-row md:px-7.5'>
        {/* Backup Sports Profit Graph */}
        <div className='rounded-sm bg-white shadow-lg md:w-1/2'>
          <div className='bg-dark rounded-t-sm px-2.5 py-1.5 text-[15px] font-bold text-white'>
            Live Sports Profit
          </div>
          <div className='flex justify-center p-2'>
            <ResponsiveContainer width='100%' height={400}>
              <PieChart>
                <Pie
                  data={transformLiveData(LivePLdata)}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  outerRadius={150}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {transformLiveData(LivePLdata)?.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className='rounded-sm bg-white shadow-lg md:w-1/2'>
          <div className='bg-dark rounded-t-sm px-2.5 py-1.5 text-[15px] font-bold text-white'>
            Backup Sports Profit
          </div>
          <div className='flex justify-center p-2'>
            <ResponsiveContainer width='100%' height={400}>
              <PieChart>
                <Pie
                  data={transformBackupData(PLdata)}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  outerRadius={150}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {transformBackupData(PLdata)?.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
