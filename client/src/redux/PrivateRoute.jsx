import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
// import Spinner from '../components/Spinner';
import { getUser } from './reducer/authReducer';

const PrivateRoute = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  // Memoize the userInfo processing to avoid unnecessary computations
  const processedUserInfo = useMemo(() => {
    return userInfo ? userInfo : null;
  }, [userInfo]);

  // Check if user has token in localStorage
  const hasToken = useMemo(() => {
    return !!localStorage.getItem('auth');
  }, []);

  useEffect(() => {
    // If no token, redirect to login immediately
    if (!hasToken) {
      navigate('/login');
      setIsChecking(false);
      return;
    }

    // If token exists but no userInfo, fetch user (only if not already loading)
    if (hasToken && !processedUserInfo && !loading) {
      dispatch(getUser());
    }
  }, [dispatch, hasToken, processedUserInfo, loading, navigate]);

  useEffect(() => {
    // If we have userInfo, allow access
    if (processedUserInfo) {
      setIsChecking(false);
    }
  }, [processedUserInfo]);

  useEffect(() => {
    // If there's an error and we're not loading, redirect to login
    if (error && !loading) {
      localStorage.removeItem('auth');
      navigate('/login');
      setIsChecking(false);
    }
  }, [error, loading, navigate]);

  // Show loading while checking authentication
  if (isChecking) {
    return <div>Loading...</div>;
  }

  // Only render Outlet if user is authenticated
  return processedUserInfo ? <Outlet /> : null;
};

export default PrivateRoute;
