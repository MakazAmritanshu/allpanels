import React, { useState } from 'react';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
// import logo from "../assets/icons/theme-1709828838678-aura555.png";
// import logo from "../assets/icons/daimondpan (1).png"
  import Allpanellogo from '../assets/allpanel.png';
  import jdlogo from '../assets/jdlogo.png';
import newshivalogo from '../assets/newshivalogo.png';

import { useDispatch, useSelector } from 'react-redux';
import { getAdmin, loginAdmin } from '../redux/reducer/authReducer';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    userName: false,
    password: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await dispatch(loginAdmin(formData)).unwrap();
      toast.success(data.message);
      dispatch(getAdmin());
      navigate('/home');
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePass = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div
      className='relative flex h-screen items-center justify-center'
      style={{ background: 'linear-gradient(-180deg,#14805e 0, #184438 100%)' }}
    >
      <form
        className='w-[94%] rounded-lg pt-[40px] pb-[150px] text-center md:w-[540px] md:pt-[120px]'
        style={{
          boxShadow: '0 5px 20px #00000080',
        }}
      >
        <div className='mx-auto w-[90%] md:w-[220px]'>
          <img src={Allpanellogo} className='mx-auto h-[60px] md:h-[70px]' alt='logo' />
          <div className='relative mt-5'>
            <input
              type='text'
              placeholder='Username'
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              onBlur={() => setTouched({ ...touched, userName: true })}
              className='w-full rounded-sm border border-white/50 bg-white px-2 py-1.5 text-[18px] text-black placeholder-gray-500 focus:outline-none md:py-1 md:text-[14px]'
            />
            <FaUser className='absolute top-1/2 right-2 size-3.5 -translate-y-1/2 transform text-black' />
          </div>
          {(touched.userName || submitAttempted) &&
            formData.userName === '' && (
              <p className='mb-2 text-left text-sm text-gray-300'>
                Please enter username
              </p>
            )}

          <div className='relative mt-2.5'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              onBlur={() => setTouched({ ...touched, password: true })}
              className='w-full rounded-sm border border-white/50 bg-white px-2 py-1.5 text-[18px] text-black placeholder-gray-500 focus:outline-none md:py-1 md:text-[14px]'
            />
            <button
              className='absolute top-1/2 right-2 -translate-y-1/2 transform text-black'
              onClick={handlePass}
            >
              {showPassword ? (
                <FaEyeSlash className='size-3.5' />
              ) : (
                <FaEye className='size-3.5' />
              )}
            </button>
          </div>

          {(touched.password || submitAttempted) &&
            formData.password === '' && (
              <p className='mb-2 text-left text-sm text-gray-300'>
                Please enter password
              </p>
            )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className='bg-color mt-3.5 w-full rounded-md py-2 text-[18px] font-bold text-white transition-all duration-150 hover:brightness-110 active:scale-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isLoading ? (
              <span className='flex items-center justify-center gap-2'>
                <svg
                  className='h-5 w-5 animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
