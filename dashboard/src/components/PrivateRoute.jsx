import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { getAdmin, userLogout } from '../redux/reducer/authReducer';
import Spinner from './Spinner';
import api from '../redux/api';

const PrivateRoute = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [ok, setOk] = useState(true);

  // Memoize the userInfo processing to avoid unnecessary computations
  const processedUserInfo = useMemo(() => {
    return userInfo ? userInfo : null;
  }, [userInfo]);

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response?.status === 401 &&
        error.response?.data?.code === 'SESSION_EXPIRED'
      ) {
        // Clear user data and redirect to login
        dispatch(userLogout());
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (!processedUserInfo) {
      dispatch(getAdmin());
    }
  }, [dispatch, processedUserInfo]);

  useEffect(() => {
    setOk(!!processedUserInfo);
  }, [processedUserInfo]);

  return ok ? <Outlet /> : <Spinner />;
};

export default PrivateRoute;
