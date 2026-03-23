import { IoIosArrowDown } from 'react-icons/io';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import api from '../redux/api';
import { toast } from 'react-toastify';

const MatchList = ({
  matches,
  loading,
  error,
  sport,
  deactivatedMatches,
  togglingMatchId,
  onToggleMatch,
}) => {
  if (loading) {
    return (
      <div className='py-4 text-center text-sm text-gray-500'>
        Loading matches...
      </div>
    );
  }

  if (error) {
    return <div className='py-4 text-center text-sm text-red-500'>{error}</div>;
  }

  if (!matches.length) {
    return (
      <div className='py-4 text-center text-sm text-gray-500'>
        No matches found
      </div>
    );
  }

  return matches.map((match) => {
    const isActive = !deactivatedMatches.has(String(match.id));
    const isToggling = togglingMatchId === match.id;

    return (
      <div
        key={match.id}
        className='flex items-center justify-between rounded-[20px] border-b border-gray-100 px-2 last:border-0 hover:bg-gray-100'
      >
        <span className='text-sm font-medium'>
          {match.match}
          {(match.inplay || match.iplay) && (
            <span className='ml-2 text-xs font-bold text-green-600'>
              (In-Play)
            </span>
          )}
        </span>

        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleMatch(match.id, match.match, sport);
          }}
          className={`relative flex h-[19px] min-w-[34px] cursor-pointer items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'} ${isToggling ? 'pointer-events-none opacity-50' : ''} `}
        >
          <span
            className={`absolute top-1/2 h-[15px] w-[15px] -translate-y-1/2 rounded-full bg-white transition-all ${isActive ? 'right-[2px]' : 'left-[2px]'} `}
          />
        </div>
      </div>
    );
  });
};

const MatchControl = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [cricketMatches, setCricketMatches] = useState([]);
  const [tennisMatches, setTennisMatches] = useState([]);
  const [soccerMatches, setSoccerMatches] = useState([]);
  const [horseRacingMatches, setHorseRacingMatches] = useState([]);

  const [deactivatedMatches, setDeactivatedMatches] = useState(new Set());
  const [togglingMatchId, setTogglingMatchId] = useState(null);

  const [loading, setLoading] = useState({
    cricket: false,
    tennis: false,
    soccer: false,
    'horse-racing': false,
  });

  const [errors, setErrors] = useState({
    cricket: null,
    tennis: null,
    soccer: null,
    'horse-racing': null,
  });

  useEffect(() => {
    const fetchDeactivatedMatches = async () => {
      try {
        const res = await api.get('/match-settings/deactivated', {
          params: { page: 1, limit: 10000 },
        });

        if (res.data.success) {
          const ids = new Set(
            res.data.data.matches.map((m) => String(m.matchId))
          );
          setDeactivatedMatches(ids);
        } else {
          console.warn(' Fetch response success is false:', res.data);
        }
      } catch (err) {
        console.error('Error fetching deactivated matches', err);
      }
    };

    fetchDeactivatedMatches();
  }, []);

  const fetchMatches = async (url, key, setter) => {
    setLoading((p) => ({ ...p, [key]: true }));
    setErrors((p) => ({ ...p, [key]: null }));

    try {
      const res = await api.get(url);
      if (res.data.success) {
        setter(res.data.data || res.data.matches || []);
      } else {
        setErrors((p) => ({ ...p, [key]: 'Failed to fetch matches' }));
      }
    } catch (err) {
      setErrors((p) => ({
        ...p,
        [key]: err.response?.data?.message || 'Failed to fetch matches',
      }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  };

  useEffect(() => {
    fetchMatches('/cricket/matches', 'cricket', setCricketMatches);
    fetchMatches('/tennis', 'tennis', setTennisMatches);
    fetchMatches('/soccer', 'soccer', setSoccerMatches);
    // Horse racing returns venues with races, flatten for MatchList
    const fetchHorseRacing = async () => {
      setLoading((p) => ({ ...p, 'horse-racing': true }));
      setErrors((p) => ({ ...p, 'horse-racing': null }));
      try {
        const res = await api.get('/horse-racing');
        if (res.data.success) {
          const venues = res.data.data || [];
          const flat = [];
          venues.forEach((venue) => {
            (venue.races || []).forEach((race, i) => {
              flat.push({
                id: race.gmid,
                match: `${venue.ename} - R${i + 1}`,
                iplay: race.iplay,
              });
            });
          });
          setHorseRacingMatches(flat);
        }
      } catch (err) {
        setErrors((p) => ({
          ...p,
          'horse-racing': err.response?.data?.message || 'Failed to fetch',
        }));
      } finally {
        setLoading((p) => ({ ...p, 'horse-racing': false }));
      }
    };
    fetchHorseRacing();
  }, []);

  const handleToggleMatch = async (matchId, matchName, sport) => {
    if (togglingMatchId === matchId) return;
    setTogglingMatchId(matchId);

    try {
      const res = await api.patch(`/match-settings/${matchId}/toggle-active`, {
        sport,
        matchName,
      });

      if (res.data.success) {
        setDeactivatedMatches((prev) => {
          const updated = new Set(prev);
          const id = String(matchId);
          res.data.data.isActive ? updated.delete(id) : updated.add(id);
          return updated;
        });

        toast.success(res.data.message);
      } else {
        toast.error(res.data.message || 'Toggle failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Toggle failed');
    } finally {
      setTogglingMatchId(null);
    }
  };

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <>
      <Navbar />

      <div className='mx-auto w-full md:max-w-250'>
        <div className='rounded-sm border border-gray-200 bg-white px-5 py-3'>
          <div
            onClick={() => toggleTab('cricket')}
            className='section-header bg-dark mb-2 flex items-center justify-between px-2 py-1 font-bold text-white'
          >
            Cricket
            <IoIosArrowDown
              className={activeTab === 'cricket' ? 'rotate-180' : ''}
            />
          </div>

          {activeTab === 'cricket' && (
            <MatchList
              matches={cricketMatches}
              loading={loading.cricket}
              error={errors.cricket}
              sport='cricket'
              deactivatedMatches={deactivatedMatches}
              togglingMatchId={togglingMatchId}
              onToggleMatch={handleToggleMatch}
            />
          )}

          <div
            onClick={() => toggleTab('tennis')}
            className='section-header bg-dark mb-2 flex items-center justify-between px-2 py-1 font-bold text-white'
          >
            Tennis
            <IoIosArrowDown
              className={activeTab === 'tennis' ? 'rotate-180' : ''}
            />
          </div>

          {activeTab === 'tennis' && (
            <MatchList
              matches={tennisMatches}
              loading={loading.tennis}
              error={errors.tennis}
              sport='tennis'
              deactivatedMatches={deactivatedMatches}
              togglingMatchId={togglingMatchId}
              onToggleMatch={handleToggleMatch}
            />
          )}

          <div
            onClick={() => toggleTab('soccer')}
            className='section-header bg-dark flex items-center justify-between px-2 py-1 font-bold text-white'
          >
            Soccer
            <IoIosArrowDown
              className={activeTab === 'soccer' ? 'rotate-180' : ''}
            />
          </div>

          {activeTab === 'soccer' && (
            <MatchList
              matches={soccerMatches}
              loading={loading.soccer}
              error={errors.soccer}
              sport='soccer'
              deactivatedMatches={deactivatedMatches}
              togglingMatchId={togglingMatchId}
              onToggleMatch={handleToggleMatch}
            />
          )}

          <div
            onClick={() => toggleTab('horse-racing')}
            className='section-header bg-dark mt-2 mb-2 flex items-center justify-between px-2 py-1 font-bold text-white'
          >
            Horse Racing
            <IoIosArrowDown
              className={activeTab === 'horse-racing' ? 'rotate-180' : ''}
            />
          </div>

          {activeTab === 'horse-racing' && (
            <MatchList
              matches={horseRacingMatches}
              loading={loading['horse-racing']}
              error={errors['horse-racing']}
              sport='horse-racing'
              deactivatedMatches={deactivatedMatches}
              togglingMatchId={togglingMatchId}
              onToggleMatch={handleToggleMatch}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MatchControl;
