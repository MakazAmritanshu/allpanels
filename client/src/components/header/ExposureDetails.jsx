import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../redux/api';

function ExposureDetails({ onClose, userId }) {
  const navigate = useNavigate();
  const [expoDetail, setExpoDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExposureDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/user/exposure-details', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth')}`,
        },
      });
      console.log('Exposure details:', response.data);
      setExpoDetail(response.data);
    } catch (err) {
      console.error('Error fetching exposure details:', err);
      setError(
        err?.response?.data?.message || 'Failed to load exposure details'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExposureDetails();
  }, []);

  const rows =
    expoDetail?.data && Array.isArray(expoDetail.data) ? expoDetail.data : [];

  const handleEventClick = (row) => {
    const sportName = String(row?.sportName || '').toLowerCase();
    const eventName = row?.eventName || 'match';
    const gameId = row?.gameId;

    if (!gameId) return;

    if (sportName.includes('cricket')) {
      navigate(`/cricket-bet/${eventName}/${gameId}`);
    } else if (sportName.includes('soccer') || sportName.includes('football')) {
      navigate(`/football-bet/${eventName}/${gameId}`);
    } else if (sportName.includes('tennis')) {
      navigate(`/tennis-bet/${eventName}/${gameId}`);
    } else if (sportName.includes('casino')) {
      navigate(`/casino-bet/${eventName}/${gameId}`);
    } else {
      return;
    }

    if (onClose) onClose();
  };

  return (
    <div className='fixed inset-0 z-60 flex items-start justify-center overflow-auto bg-[rgba(17,17,17,0.49)] pt-10'>
      <div className="w-[95%] max-w-4xl rounded-lg bg-white font-['Times_New_Roman'] shadow-lg md:w-[80%]">
        <div className='bg-primary flex items-center justify-between p-2'>
          <h2 className='text-secondary text-lg font-semibold'>My Market</h2>
          <button
            onClick={onClose}
            className='text-secondary text-xl font-bold'
          >
            ✕
          </button>
        </div>
        <div className='overflow-x-auto p-2'>
          {loading && (
            <div className='py-6 text-center text-gray-600'>Loading...</div>
          )}
          {error && (
            <div className='py-4 text-center text-red-600'>{error}</div>
          )}
          {!loading && !error && (
            <table className='bg-body text-body w-full border border-gray-300'>
              <thead>
                <tr className='border-b border-gray-300 bg-gray-100'>
                  <th className='border-r border-gray-300 p-2 text-left last:border-r-0'>
                    Event Type
                  </th>
                  <th className='border-r border-gray-300 p-2 text-left last:border-r-0'>
                    Event Name
                  </th>
                  <th className='border-r border-gray-300 p-2 text-left last:border-r-0'>
                    Match Name
                  </th>
                  <th className='p-2 text-left'>Trade</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className='border-b border-gray-200 hover:bg-gray-50'
                    >
                      <td className='border-r border-gray-200 p-2'>
                        {row.sportName ?? '-'}
                      </td>
                      <td
                        className='cursor-pointer border-r border-gray-200 p-2 text-[#0d6efd]'
                        onClick={() => handleEventClick(row)}
                        title='Open event'
                      >
                        {row.eventName ?? '-'}
                      </td>
                      <td className='border-r border-gray-200 p-2'>
                        {row.marketName ?? '-'}
                      </td>
                      <td className='p-2'>{row.betCounts ?? 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className='p-4 text-center text-gray-500'>
                      No exposure details
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExposureDetails;
