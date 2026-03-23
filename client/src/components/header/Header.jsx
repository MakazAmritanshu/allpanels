// import React, { useState, useEffect, useRef } from 'react';
// import { FiMenu, FiSearch, FiChevronDown } from 'react-icons/fi';
// import { IoMdClose } from 'react-icons/io';
// import { FaSearchPlus } from "react-icons/fa";
// import { IoLogoAndroid } from "react-icons/io";
// import { useNavigate } from 'react-router-dom';
// import Alllogo from '../../assets/Alllogo.png';
// import Shivaylogo from '../../assets/shivaylogo.png';
// import newshivalogo from '../../assets/newshivalogo.png';
// import { useDispatch, useSelector } from 'react-redux';
// import  api  from '../../redux/api';
// import {
//   getUser,
//   loginUser,
//   user_reset,
//   changePasswordByFirstLogin,
// } from '../../redux/reducer/authReducer';
// function Header({ onMenuToggle, isSidebarOpen }) {
//   const navigate = useNavigate();
//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const dispatch = useDispatch();
//   const { userInfo } = useSelector((state) => state.auth);
//   console.log("userInfo",userInfo);
//   useEffect(() => {
//     dispatch(getUser());
//   }, [dispatch]);

//   // const handleLogout = () => {
//   //   dispatch(logoutUser());
//   //   navigate('/login');
//   // };
//   const logout = async () => {
//     try {
//       await api.get('/customer/logout', {
//         withCredentials: true,
//       }); // ✅ Important!
//       localStorage.removeItem('auth');

//       dispatch(user_reset());

//       navigate('/');
//     } catch (error) {
//       console.log(error?.response?.data || error.message);
//     }
//   };

//   const dropdownItems = [
//     { name: 'Account Statement', path: '/account-statement' },
//     { name: 'Current Bet', path: '/current-bets' },
//     { name: 'Activity Log', path: '/activity-log ' },
//     { name: 'Casino Results', path: '/casino-results' },
//     { name: 'Change Password', path: '/change-password' },
//     { name: 'Sign Out', path: '/login' },
//   ];

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsUserDropdownOpen(false);
//       }
//     };

//     if (isUserDropdownOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isUserDropdownOpen]);

//   return (
//     <header className="bg-primary text-primary w-full">
//       {/* Top Header Bar */}
//       <div className="flex items-center justify-between px-1 py-2 lg:py-1">
//         {/* Left: Logo and Hamburger Menu */}
//         <div className="flex items-center gap-1">
//           <button
//             onClick={onMenuToggle}
//             className="lg:hidden text-primary text-2xl hover:opacity-80 p-1 rounded"
//             aria-label="Toggle menu"
//           >
//             {isSidebarOpen ? <IoMdClose /> : <FiMenu />}
//           </button>
//           <img src={newshivalogo} alt="Alllogo" className='max-w-[90px] max-h-[35px] lg:max-w-[250px] lg:max-h-[65px]'
//           onClick={()=>navigate('/')}
//           />
//         </div>

//         {/* Right: User Info */}
//         <div className="flex items-center gap-4 text-sm">
//          <div className='hidden md:flex items-center gap-2'>
//             {isSearchOpen && (
//                 <input type="search" placeholder='Search here' className='bg-body text-body p-2' />
//             )}
//             <FaSearchPlus className='text-2xl' onClick={() => setIsSearchOpen(!isSearchOpen)}/>
//          </div>
//           <div className='flex flex-col'>
//             <span className="hidden md:inline">Rules</span>
//             <span className="hidden md:flex justify-center items-center">Download Apk <IoLogoAndroid/></span>
//           </div>
//           <div className='flex flex-col'>
//             <span>Balance: {(userInfo?.avbalance)?.toFixed(2)}</span>
//             <span>Exp: {(userInfo?.exposure)?.toFixed(2)}</span>
//           </div>
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//               className="flex items-center gap-1 hover:opacity-80 px-2 py-1 rounded"
//             >
//               <span>{userInfo?.userName}</span>
//               <FiChevronDown className="text-xs" />
//             </button>
//             {isUserDropdownOpen && (
//               <div className="absolute right-0 mt-2 w-48 bg-white text-[#000000] text-[1rem] font-[400] rounded shadow-lg z-50 cursor-pointer">
//                   {dropdownItems.map((item) => (
//                     <span className="block px-4 py-2 hover:bg-gray-100"
//                     onClick={() => {
//                       if(item.name === 'Sign Out'){
//                         logout();
//                       }else{
//                         navigate(item.path);
//                       }
//                     }}
//                     >{item.name}</span>
//                   ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="px-2 pb-2 flex ">
//         <div className='flex md:hidden items-center gap-2'>
//             {isSearchOpen && (
//                 <input type="search" placeholder='Search here' className='bg-body text-body p-1 h-[26px] w-[150px]' style={{ boxShadow: '0 0 5px #6f6f6f' }} />
//             )}
//             <FaSearchPlus className='text-2xl' onClick={() => setIsSearchOpen(!isSearchOpen)}/>
//         </div>
//         <div className=' flex-1 md:hidden text-primary bg-[#ffffff45] h-fit'>
//             <marquee behavior="scroll" direction="left">
//                 <span>100% Secure and Trusted</span>
//             </marquee>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;

import React, { useState, useEffect, useRef } from 'react';
import { FiMenu, FiSearch, FiChevronDown } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { FaSearchPlus } from 'react-icons/fa';
import { IoLogoAndroid } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import newshivalogo from '../../assets/newshivalogo.png';
import Allpanellogo from '../../assets/allpanel.png'
import { useDispatch, useSelector } from 'react-redux';
import api from '../../redux/api';
import { wsService } from '../../services/WebsocketService';
import {
  getUser,
  loginUser,
  user_reset,
  changePasswordByFirstLogin,
} from '../../redux/reducer/authReducer';
import ExposureDetails from './ExposureDetails';
function Header({ onMenuToggle, isSidebarOpen }) {
  const [isExposureDetailsOpen, setExposureDetailsOpen] = useState(false);
  const openModal = () => setExposureDetailsOpen(true);
  const closeModal = () => setExposureDetailsOpen(false);
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  console.log('userInfo', userInfo);
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (userInfo?._id) {
      wsService.connect(dispatch, userInfo._id);
    }
  }, [dispatch, userInfo?._id]);

  // const handleLogout = () => {
  //   dispatch(logoutUser());
  //   navigate('/login');
  // };
  const logout = async () => {
    try {
      await api.get('/customer/logout', {
        withCredentials: true,
      }); // ✅ Important!
      localStorage.removeItem('auth');

      dispatch(user_reset());

      navigate('/');
    } catch (error) {
      console.log(error?.response?.data || error.message);
    }
  };

  const dropdownItems = [
    { name: 'Account Statement', path: '/account-statement' },
    { name: 'Current Bet', path: '/current-bets' },
    { name: 'Activity Log', path: '/activity-log ' },
    { name: 'Casino Results', path: '/casino-results' },
    { name: 'Change Password', path: '/change-password' },
    { name: 'Sign Out', path: '/login' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop =
        dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsideMobile =
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target);

      if (isOutsideDesktop && isOutsideMobile) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return (
    <header className='bg-primary text-primary w-full'>
      {/* Top Header Bar */}
      <div className='flex items-center justify-between px-1 py-2 lg:py-1'>
        {/* Left: Logo and Hamburger Menu */}
        <div className='flex items-center gap-1'>
          <button
            onClick={onMenuToggle}
            className='text-primary rounded p-1 text-2xl hover:opacity-80 lg:hidden'
            aria-label='Toggle menu'
          >
            {isSidebarOpen ? <IoMdClose /> : <FiMenu />}
          </button>
          <img
            src={Allpanellogo}
            alt='Alllogo'
            className='max-h-[40px] max-w-[90px] lg:max-h-[65px] lg:max-w-[240px]'
            onClick={() => navigate('/')}
          />
        </div>

        {/* Right: User Info */}
        <div className='flex items-center gap-4 text-sm'>
          <div className='hidden items-center gap-2 md:flex'>
            {isSearchOpen && (
              <input
                type='search'
                placeholder='Search here'
                className='bg-body text-body p-2'
              />
            )}
            <FaSearchPlus
              className='text-2xl'
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />
          </div>
          <div className='flex flex-col'>
            <span className='hidden md:inline'>Rules</span>
            <span className='hidden items-center justify-center md:flex'>
              Download Apk <IoLogoAndroid />
            </span>
          </div>
          {/* Mobile Layout: Balance on top (right-aligned), Exp and Username in line below */}
          {/* Desktop Layout: Balance/Exp in column, Username separate */}
          <div className='flex flex-col md:flex-row md:items-center md:gap-4'>
            {/* Balance - shown on top in mobile (right-aligned), inline in desktop */}
            <div className='flex flex-col items-end pr-2 md:items-start md:pr-0'>
              <span className='text-right md:text-left'>
                Balance: {userInfo?.avbalance?.toFixed(2)}
              </span>
              {/* Desktop: Exp below Balance */}
              <span className='hidden md:inline cursor-pointer'
              onClick={openModal}
              >
                Exp: {userInfo?.exposure?.toFixed(2)}
              </span>
            </div>
            {/* Mobile: Exp and Username in same line */}
            <div className='flex items-center gap-2 md:hidden'>
              <span
              onClick={openModal}
              >Exp: {userInfo?.exposure?.toFixed(2)}</span>
              <div className='relative' ref={mobileDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
                >
                  <span>{userInfo?.userName}</span>
                  <FiChevronDown className='text-xs' />
                </button>
                {isUserDropdownOpen && (
                  <div className='absolute right-0 z-50 mt-2 w-48 cursor-pointer rounded bg-white text-[1rem] font-normal text-[#000000] shadow-lg'>
                    {dropdownItems.map((item) => (
                      <span
                        key={item.name}
                        className='block px-4 py-2 hover:bg-gray-100'
                        onClick={() => {
                          if (item.name === 'Sign Out') {
                            logout();
                          } else {
                            navigate(item.path);
                          }
                        }}
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Desktop: Username separate */}
            <div className='relative hidden md:block' ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
              >
                <span>{userInfo?.userName}</span>
                <FiChevronDown className='text-xs' />
              </button>
              {isUserDropdownOpen && (
                <div className='absolute right-0 z-50 mt-2 w-48 cursor-pointer rounded bg-white text-[1rem] font-normal text-[#000000] shadow-lg'>
                  {dropdownItems.map((item) => (
                    <span
                      key={item.name}
                      className='block px-4 py-2 hover:bg-gray-100'
                      onClick={() => {
                        if (item.name === 'Sign Out') {
                          logout();
                        } else {
                          navigate(item.path);
                        }
                      }}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className='flex px-2 pb-2'>
        <div className='flex items-center gap-2 md:hidden'>
          {isSearchOpen && (
            <input
              type='search'
              placeholder='Search here'
              className='bg-body text-body h-[26px] w-[150px] p-1'
              style={{ boxShadow: '0 0 5px #6f6f6f' }}
            />
          )}
          <FaSearchPlus
            className='text-2xl'
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          />
        </div>
        <div className='text-primary h-fit flex-1 bg-[#ffffff45] md:hidden'>
          <marquee behavior='scroll' direction='left'>
            <span>100% Secure and Trusted</span>
          </marquee>
        </div>
      </div>
      {isExposureDetailsOpen && userInfo?.exposure > 0 && (
        <ExposureDetails onClose={closeModal} userId={userInfo?._id} />
      )}
    </header>
  );
}

export default Header;
