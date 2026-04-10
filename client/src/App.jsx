import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home/Home';
import Cricket from './pages/Home/Cricket';
import Football from './pages/Home/Football';
import Tennis from './pages/Home/Tennis';
import CricketBet from './pages/gamedetails/CricketBet';
import FootballBet from './pages/gamedetails/FootballBet';
import TennisBet from './pages/gamedetails/TennisBet';
import AccountStatement from './pages/other/AccountStatement';
import CurrentBets from './pages/other/CurrentBets';
import ActivityLog from './pages/other/ActivityLog';
import ChangePassword from './pages/other/ChangePassword';
import CasinoResults from './pages/other/CasinoResults';
import PrivateRoute from './redux/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import CasinoList from './pages/Home/ourcasino/CasinoList';
import OurVipCasino from './pages/Home/ourvipcasino/CasinoList';
import OurVirtualCasino from './pages/Home/ourvirtual/CasinoList';
import OurPremCasino from './pages/Home/ourpremcasino/CasinoList';
import CasinoBet from './pages/CasinoBet/casinoBet';
function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path='cricket' element={<Cricket />} />
            <Route path='football' element={<Football />} />
            <Route path='tennis' element={<Tennis />} />
            <Route path='cricket-bet/:game/:id' element={<CricketBet />} />
            <Route path='football-bet/:game/:id' element={<FootballBet />} />
            <Route path='tennis-bet/:game/:id' element={<TennisBet />} />
            <Route path='account-statement' element={<AccountStatement />} />
            <Route path='current-bets' element={<CurrentBets />} />
            <Route path='activity-log' element={<ActivityLog />} />
            <Route path='change-password' element={<ChangePassword />} />
            <Route path='casino-results' element={<CasinoResults />} />
            <Route path='casino-list' element={<CasinoList />} />
            <Route path='casino-list/:category' element={<CasinoList />} />
            <Route path='our-vip-casino' element={<OurVipCasino />} />
            <Route path='our-virtual-casino' element={<OurVirtualCasino />} />
            <Route path='our-prem-casino' element={<OurPremCasino />} />
            <Route path='casino-bet/:match/:gameid' element={<CasinoBet />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        position='top-right'
        autoClose={800}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
      />
    </>
  );
}

export default App;
