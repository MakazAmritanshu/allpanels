// import React, { useState, useEffect, useRef } from 'react';
// import { FiMenu, FiSearch, FiChevronDown } from 'react-icons/fi';
// import { IoMdClose } from 'react-icons/io';
// import { FaSearchPlus } from 'react-icons/fa';
// import { IoLogoAndroid } from 'react-icons/io';
// import { useNavigate } from 'react-router-dom';
// import Alllogo from '../../assets/Alllogo.png';
// import Shivaylogo from '../../assets/shivaylogo.png';
// import newshivalogo from '../../assets/newshivalogo.png';
// import { useDispatch, useSelector } from 'react-redux';
// import api from '../../redux/api';
// import { wsService } from '../../services/WebsocketService';
// import {
//   getUser,
//   loginUser,
//   user_reset,
//   changePasswordByFirstLogin,
// } from '../../redux/reducer/authReducer';
// import ExposureDetails from './ExposureDetails';
// import ButtonValues from './ButtonValues';
// function Header({ onMenuToggle, isSidebarOpen }) {
//   const [isExposureDetailsOpen, setExposureDetailsOpen] = useState(false);
//   const [isButtonValuesOpen, setButtonValuesOpen] = useState(false);
//   const openModal = () => setExposureDetailsOpen(true);
//   const closeModal = () => setExposureDetailsOpen(false);
//   const openButtonValuesModal = () => setButtonValuesOpen(true);
//   const closeButtonValuesModal = () => setButtonValuesOpen(false);
//   const navigate = useNavigate();
//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const mobileDropdownRef = useRef(null);
//   const dispatch = useDispatch();
//   const { userInfo } = useSelector((state) => state.auth);
//   console.log('userInfo', userInfo);
//   useEffect(() => {
//     dispatch(getUser());
//   }, [dispatch]);

//   useEffect(() => {
//     if (userInfo?._id) {
//       wsService.connect(dispatch, userInfo._id);
//     }
//   }, [dispatch, userInfo?._id]);

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
//     { name: 'Set Button Values'},
//     { name: 'Change Password', path: '/change-password' },
//     { name: 'Sign Out', path: '/login' },
//   ];

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const isOutsideDesktop =
//         dropdownRef.current && !dropdownRef.current.contains(event.target);
//       const isOutsideMobile =
//         mobileDropdownRef.current &&
//         !mobileDropdownRef.current.contains(event.target);

//       if (isOutsideDesktop && isOutsideMobile) {
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
//     <header className='bg-primary text-primary w-full'>
//       {/* Top Header Bar */}
//       <div className='flex items-center justify-between px-1 py-2 lg:py-1'>
//         {/* Left: Logo and Hamburger Menu */}
//         <div className='flex items-center gap-1'>
//           <button
//             onClick={onMenuToggle}
//             className='text-primary rounded p-1 text-2xl hover:opacity-80 lg:hidden'
//             aria-label='Toggle menu'
//           >
//             {isSidebarOpen ? <IoMdClose /> : <FiMenu />}
//           </button>
//           <img
//             src={newshivalogo}
//             alt='Alllogo'
//             className='max-h-[40px] max-w-[100px] lg:max-h-[65px] lg:max-w-[250px]'
//             onClick={() => navigate('/')}
//           />
//         </div>

//         {/* Right: User Info */}
//         <div className='flex items-center gap-4 text-sm'>
//           <div className='hidden items-center gap-2 md:flex'>
//             {isSearchOpen && (
//               <input
//                 type='search'
//                 placeholder='Search here'
//                 className='bg-body text-body p-2'
//               />
//             )}
//             <FaSearchPlus
//               className='text-2xl'
//               onClick={() => setIsSearchOpen(!isSearchOpen)}
//             />
//           </div>
//           <div className='flex flex-col'>
//             <span className='hidden md:inline'>Rules</span>
//             <span className='hidden items-center justify-center md:flex'>
//               Download Apk <IoLogoAndroid />
//             </span>
//           </div>
//           {/* Mobile Layout: Balance on top (right-aligned), Exp and Username in line below */}
//           {/* Desktop Layout: Balance/Exp in column, Username separate */}
//           <div className='flex flex-col md:flex-row md:items-center md:gap-4'>
//             {/* Balance - shown on top in mobile (right-aligned), inline in desktop */}
//             <div className='flex flex-col items-end pr-2 md:items-start md:pr-0'>
//               <span className='text-right md:text-left'>
//                 Balance: {userInfo?.avbalance?.toFixed(2)}
//               </span>
//               {/* Desktop: Exp below Balance */}
//               <span className='hidden md:inline cursor-pointer'
//               onClick={openModal}
//               >
//                 Exp: {userInfo?.exposure?.toFixed(2)}
//               </span>
//             </div>
//             {/* Mobile: Exp and Username in same line */}
//             <div className='flex items-center gap-2 md:hidden'>
//               <span
//               onClick={openModal}
//               >Exp: {userInfo?.exposure?.toFixed(2)}</span>
//               <div className='relative' ref={mobileDropdownRef}>
//                 <button
//                   onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//                   className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
//                 >
//                   <span>{userInfo?.userName}</span>
//                   <FiChevronDown className='text-xs' />
//                 </button>
//                 {isUserDropdownOpen && (
//                   <div className='absolute right-0 z-50 mt-2 w-48 cursor-pointer rounded bg-white text-[1rem] font-normal text-[#000000] shadow-lg'>
//                     {dropdownItems.map((item) => (
//                       <span
//                         key={item.name}
//                         className='block px-4 py-2 hover:bg-gray-100'
//                         onClick={() => {
//                           if (item.name === 'Sign Out') {
//                             logout();
//                           } else if (item.name === 'Set Button Values') {
//                             openButtonValuesModal();
//                           } else {
//                             navigate(item.path);
//                           }
//                         }}
//                       >
//                         {item.name}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//             {/* Desktop: Username separate */}
//             <div className='relative hidden md:block' ref={dropdownRef}>
//               <button
//                 onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//                 className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
//               >
//                 <span>{userInfo?.userName}</span>
//                 <FiChevronDown className='text-xs' />
//               </button>
//               {isUserDropdownOpen && (
//                 <div className='absolute right-0 z-50 mt-2 w-48 cursor-pointer rounded bg-white text-[1rem] font-normal text-[#000000] shadow-lg'>
//                   {dropdownItems.map((item) => (
//                     <span
//                       key={item.name}
//                       className='block px-4 py-2 hover:bg-gray-100'
//                       onClick={() => {
//                         if (item.name === 'Sign Out') {
//                           logout();
//                         } else if (item.name === 'Set Button Values') {
//                           openButtonValuesModal();
//                         } else {
//                           navigate(item.path);
//                         }
//                       }}
//                     >
//                       {item.name}
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className='flex px-2 pb-2'>
//         <div className='flex items-center gap-2 md:hidden'>
//           {isSearchOpen && (
//             <input
//               type='search'
//               placeholder='Search here'
//               className='bg-body text-body h-[26px] w-[150px] p-1'
//               style={{ boxShadow: '0 0 5px #6f6f6f' }}
//             />
//           )}
//           <FaSearchPlus
//             className='text-2xl'
//             onClick={() => setIsSearchOpen(!isSearchOpen)}
//           />
//         </div>
//         <div className='text-primary h-fit flex-1 bg-[#ffffff45] md:hidden'>
//           <marquee behavior='scroll' direction='left'>
//             <span>100% Secure and Trusted</span>
//           </marquee>
//         </div>
//       </div>
//       {isExposureDetailsOpen && userInfo?.exposure > 0 && (
//         <ExposureDetails onClose={closeModal} userId={userInfo?._id} />
//       )}
//       {isButtonValuesOpen && (
//         <ButtonValues onClose={closeButtonValuesModal} userId={userInfo?._id} />
//       )}
//     </header>
//   );
// }

// export default Header;

// import React, { useState, useEffect, useRef } from 'react';
// import { FiMenu, FiSearch, FiChevronDown } from 'react-icons/fi';
// import { IoMdClose } from 'react-icons/io';
// import { FaSearchPlus } from 'react-icons/fa';
// import { IoLogoAndroid } from 'react-icons/io';
// import { useNavigate } from 'react-router-dom';
// import Alllogo from '../../assets/Alllogo.png';
// import Shivaylogo from '../../assets/shivaylogo.png';
// import newshivalogo from '../../assets/newshivalogo.png';
// import { useDispatch, useSelector } from 'react-redux';
// import api from '../../redux/api';
// import { wsService } from '../../services/WebsocketService';
// import {
//   getUser,
//   loginUser,
//   user_reset,
//   changePasswordByFirstLogin,
// } from '../../redux/reducer/authReducer';
// import ExposureDetails from './ExposureDetails';
// import ButtonValues from './ButtonValues';
// function Header({ onMenuToggle, isSidebarOpen }) {
//   const [isExposureDetailsOpen, setExposureDetailsOpen] = useState(false);
//   const [isButtonValuesOpen, setButtonValuesOpen] = useState(false);
//   const openModal = () => setExposureDetailsOpen(true);
//   const closeModal = () => setExposureDetailsOpen(false);
//   const openButtonValuesModal = () => setButtonValuesOpen(true);
//   const closeButtonValuesModal = () => setButtonValuesOpen(false);
//   const navigate = useNavigate();
//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const mobileDropdownRef = useRef(null);
//   const dispatch = useDispatch();
//   const { userInfo } = useSelector((state) => state.auth);
//   console.log('userInfo', userInfo);
//   useEffect(() => {
//     dispatch(getUser());
//   }, [dispatch]);

//   useEffect(() => {
//     if (userInfo?._id) {
//       wsService.connect(dispatch, userInfo._id);
//     }
//   }, [dispatch, userInfo?._id]);

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
//     { name: 'Set Button Values'},
//     { name: 'Change Password', path: '/change-password' },
//     { name: 'Sign Out', path: '/login' },
//   ];

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const isOutsideDesktop =
//         dropdownRef.current && !dropdownRef.current.contains(event.target);
//       const isOutsideMobile =
//         mobileDropdownRef.current &&
//         !mobileDropdownRef.current.contains(event.target);

//       if (isOutsideDesktop && isOutsideMobile) {
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
//     <header className='bg-primary text-primary w-full'>
//       {/* Top Header Bar */}
//       <div className='flex items-center justify-between px-1 py-2 lg:py-1'>
//         {/* Left: Logo and Hamburger Menu */}
//         <div className='flex items-center gap-1'>
//           <button
//             onClick={onMenuToggle}
//             className='text-primary rounded p-1 text-2xl hover:opacity-80 lg:hidden'
//             aria-label='Toggle menu'
//           >
//             {isSidebarOpen ? <IoMdClose /> : <FiMenu />}
//           </button>
//           <img
//             src={newshivalogo}
//             alt='Alllogo'
//             className='max-h-[40px] max-w-[100px] lg:max-h-[65px] lg:max-w-[250px]'
//             onClick={() => navigate('/')}
//           />
//         </div>

//         {/* Right: User Info */}
//         <div className='flex items-center gap-4 text-sm'>
//           <div className='hidden items-center gap-2 md:flex'>
//             {isSearchOpen && (
//               <input
//                 type='search'
//                 placeholder='Search here'
//                 className='bg-body text-body p-2'
//               />
//             )}
//             <FaSearchPlus
//               className='text-2xl'
//               onClick={() => setIsSearchOpen(!isSearchOpen)}
//             />
//           </div>
//           <div className='flex flex-col'>
//             <span className='hidden md:inline'>Rules</span>
//             <span className='hidden items-center justify-center md:flex'>
//               Download Apk <IoLogoAndroid />
//             </span>
//           </div>
//           {/* Mobile Layout: Balance on top (right-aligned), Exp and Username in line below */}
//           {/* Desktop Layout: Balance/Exp in column, Username separate */}
//           <div className='flex flex-col md:flex-row md:items-center md:gap-4'>
//             {/* Balance - shown on top in mobile (right-aligned), inline in desktop */}
//             <div className='flex flex-col items-end pr-2 md:items-start md:pr-0'>
//               <span className='text-right md:text-left'>
//                 Balance: {userInfo?.avbalance?.toFixed(2)}
//               </span>
//               {/* Desktop: Exp below Balance */}
//               <span className='hidden md:inline cursor-pointer'
//               onClick={openModal}
//               >
//                 Exp: {userInfo?.exposure?.toFixed(2)}
//               </span>
//             </div>
//             {/* Mobile: Exp and Username in same line */}
//             <div className='flex items-center gap-2 md:hidden'>
//               <span
//               onClick={openModal}
//               >Exp: {userInfo?.exposure?.toFixed(2)}</span>
//               <div className='relative' ref={mobileDropdownRef}>
//                 <button
//                   onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//                   className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
//                 >
//                   <span>{userInfo?.userName}</span>
//                   <FiChevronDown className='text-xs' />
//                 </button>
//                 {isUserDropdownOpen && (
//                   <div className='absolute right-0 z-50 mt-2 w-48 cursor-pointer rounded bg-white text-[1rem] font-normal text-[#000000] shadow-lg'>
//                     {dropdownItems.map((item) => (
//                       <span
//                         key={item.name}
//                         className='block px-4 py-2 hover:bg-gray-100'
//                         onClick={() => {
//                           if (item.name === 'Sign Out') {
//                             logout();
//                           } else if (item.name === 'Set Button Values') {
//                             openButtonValuesModal();
//                           } else {
//                             navigate(item.path);
//                           }
//                         }}
//                       >
//                         {item.name}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//             {/* Desktop: Username separate */}
//             <div className='relative hidden md:block' ref={dropdownRef}>
//               <button
//                 onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//                 className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
//               >
//                 <span>{userInfo?.userName}</span>
//                 <FiChevronDown className='text-xs' />
//               </button>
//               {isUserDropdownOpen && (
//                 <div className='absolute right-0 z-50 mt-2 w-48 cursor-pointer rounded bg-white text-[1rem] font-normal text-[#000000] shadow-lg'>
//                   {dropdownItems.map((item) => (
//                     <span
//                       key={item.name}
//                       className='block px-4 py-2 hover:bg-gray-100'
//                       onClick={() => {
//                         if (item.name === 'Sign Out') {
//                           logout();
//                         } else if (item.name === 'Set Button Values') {
//                           openButtonValuesModal();
//                         } else {
//                           navigate(item.path);
//                         }
//                       }}
//                     >
//                       {item.name}
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className='flex px-2 pb-2'>
//         <div className='flex items-center gap-2 md:hidden'>
//           {isSearchOpen && (
//             <input
//               type='search'
//               placeholder='Search here'
//               className='bg-body text-body h-[26px] w-[150px] p-1'
//               style={{ boxShadow: '0 0 5px #6f6f6f' }}
//             />
//           )}
//           <FaSearchPlus
//             className='text-2xl'
//             onClick={() => setIsSearchOpen(!isSearchOpen)}
//           />
//         </div>
//         <div className='text-primary h-fit flex-1 bg-[#ffffff45] md:hidden'>
//           <marquee behavior='scroll' direction='left'>
//             <span>100% Secure and Trusted</span>
//           </marquee>
//         </div>
//       </div>
//       {isExposureDetailsOpen && userInfo?.exposure > 0 && (
//         <ExposureDetails onClose={closeModal} userId={userInfo?._id} />
//       )}
//       {isButtonValuesOpen && (
//         <ButtonValues onClose={closeButtonValuesModal} userId={userInfo?._id} />
//       )}
//     </header>
//   );
// }

// export default Header;


// import React, { useState, useEffect, useRef } from 'react';
// import { FiMenu, FiSearch, FiChevronDown } from 'react-icons/fi';
// import { IoMdClose } from 'react-icons/io';
// import { FaSearchPlus } from 'react-icons/fa';
// import { IoLogoAndroid } from 'react-icons/io';
// import { useNavigate } from 'react-router-dom';
// import Alllogo from '../../assets/Alllogo.png';
// import Shivaylogo from '../../assets/shivaylogo.png';
// import newshivalogo from '../../assets/newshivalogo.png';
// import { useDispatch, useSelector } from 'react-redux';
// import api from '../../redux/api';
// import { wsService } from '../../services/WebsocketService';
// import {
//   getUser,
//   loginUser,
//   user_reset,
//   changePasswordByFirstLogin,
// } from '../../redux/reducer/authReducer';
// import ExposureDetails from './ExposureDetails';
// import ButtonValues from './ButtonValues';
// function Header({ onMenuToggle, isSidebarOpen }) {
//   const [isExposureDetailsOpen, setExposureDetailsOpen] = useState(false);
//   const [isButtonValuesOpen, setButtonValuesOpen] = useState(false);
//   const openModal = () => setExposureDetailsOpen(true);
//   const closeModal = () => setExposureDetailsOpen(false);
//   const openButtonValuesModal = () => setButtonValuesOpen(true);
//   const closeButtonValuesModal = () => setButtonValuesOpen(false);
//   const navigate = useNavigate();
//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const mobileDropdownRef = useRef(null);
//   const dispatch = useDispatch();
//   const { userInfo } = useSelector((state) => state.auth);
//   console.log('userInfo', userInfo);
//   useEffect(() => {
//     dispatch(getUser());
//   }, [dispatch]);

//   useEffect(() => {
//     if (userInfo?._id) {
//       wsService.connect(dispatch, userInfo._id);
//     }
//   }, [dispatch, userInfo?._id]);

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
//     { name: 'Set Button Values'},
//     { name: 'Change Password', path: '/change-password' },
//     { name: 'Sign Out', path: '/login' },
//   ];

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const isOutsideDesktop =
//         dropdownRef.current && !dropdownRef.current.contains(event.target);
//       const isOutsideMobile =
//         mobileDropdownRef.current &&
//         !mobileDropdownRef.current.contains(event.target);

//       if (isOutsideDesktop && isOutsideMobile) {
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
//     <header className='bg-primary text-primary w-full'>
//       {/* Top Header Bar */}
//       <div className='flex items-center justify-between px-1 py-2 lg:py-1'>
//         {/* Left: Logo and Hamburger Menu */}
//         <div className='flex items-center gap-1'>
//           <button
//             onClick={onMenuToggle}
//             className='text-primary rounded p-1 text-2xl hover:opacity-80 lg:hidden'
//             aria-label='Toggle menu'
//           >
//             {isSidebarOpen ? <IoMdClose /> : <FiMenu />}
//           </button>
//           <img
//             src={newshivalogo}
//             alt='Alllogo'
//             className='max-h-[40px] max-w-[100px] lg:max-h-[65px] lg:max-w-[250px]'
//             onClick={() => navigate('/')}
//           />
//         </div>

//         {/* Right: User Info */}
//         <div className='flex items-center gap-4 text-sm'>
//           <div className='hidden items-center gap-2 md:flex'>
//             {isSearchOpen && (
//               <input
//                 type='search'
//                 placeholder='Search here'
//                 className='bg-body text-body p-2'
//               />
//             )}
//             <FaSearchPlus
//               className='text-2xl'
//               onClick={() => setIsSearchOpen(!isSearchOpen)}
//             />
//           </div>
//           <div className='flex flex-col'>
//             <span className='hidden md:inline'>Rules</span>
//             <span className='hidden items-center justify-center md:flex'>
//               Download Apk <IoLogoAndroid />
//             </span>
//           </div>
//           {/* Mobile Layout: Balance on top (right-aligned), Exp and Username in line below */}
//           {/* Desktop Layout: Balance/Exp in column, Username separate */}
//           <div className='flex flex-col md:flex-row md:items-center md:gap-4'>
//             {/* Balance - shown on top in mobile (right-aligned), inline in desktop */}
//             <div className='flex flex-col items-end pr-2 md:items-start md:pr-0'>
//               <span className='text-right md:text-left'>
//                 Balance: {userInfo?.avbalance?.toFixed(2)}
//               </span>
//               {/* Desktop: Exp below Balance */}
//               <span className='hidden md:inline cursor-pointer'
//               onClick={openModal}
//               >
//                 Exp: {userInfo?.exposure?.toFixed(2)}
//               </span>
//             </div>
//             {/* Mobile: Exp and Username in same line */}
//             <div className='flex items-center gap-2 md:hidden'>
//               <span
//               onClick={openModal}
//               >Exp: {userInfo?.exposure?.toFixed(2)}</span>
//               <div className='relative' ref={mobileDropdownRef}>
//                 <button
//                   onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//                   className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
//                 >
//                   <span>{userInfo?.userName}</span>
//                   <FiChevronDown className='text-xs' />
//                 </button>
//                 {isUserDropdownOpen && (
//                   <div className='absolute right-0 z-50 mt-2 w-48 cursor-pointer rounded bg-white text-[1rem] font-normal text-[#000000] shadow-lg'>
//                     {dropdownItems.map((item) => (
//                       <span
//                         key={item.name}
//                         className='block px-4 py-2 hover:bg-gray-100'
//                         onClick={() => {
//                           if (item.name === 'Sign Out') {
//                             logout();
//                           } else if (item.name === 'Set Button Values') {
//                             openButtonValuesModal();
//                           } else {
//                             navigate(item.path);
//                           }
//                         }}
//                       >
//                         {item.name}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//             {/* Desktop: Username separate */}
//             <div className='relative hidden md:block' ref={dropdownRef}>
//               <button
//                 onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//                 className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
//               >
//                 <span>{userInfo?.userName}</span>
//                 <FiChevronDown className='text-xs' />
//               </button>
//               {isUserDropdownOpen && (
//                 <div className='absolute right-0 z-50 mt-2 w-48 cursor-pointer rounded bg-white text-[1rem] font-normal text-[#000000] shadow-lg'>
//                   {dropdownItems.map((item) => (
//                     <span
//                       key={item.name}
//                       className='block px-4 py-2 hover:bg-gray-100'
//                       onClick={() => {
//                         if (item.name === 'Sign Out') {
//                           logout();
//                         } else if (item.name === 'Set Button Values') {
//                           openButtonValuesModal();
//                         } else {
//                           navigate(item.path);
//                         }
//                       }}
//                     >
//                       {item.name}
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className='flex px-2 pb-2'>
//         <div className='flex items-center gap-2 md:hidden'>
//           {isSearchOpen && (
//             <input
//               type='search'
//               placeholder='Search here'
//               className='bg-body text-body h-[26px] w-[150px] p-1'
//               style={{ boxShadow: '0 0 5px #6f6f6f' }}
//             />
//           )}
//           <FaSearchPlus
//             className='text-2xl'
//             onClick={() => setIsSearchOpen(!isSearchOpen)}
//           />
//         </div>
//         <div className='text-primary h-fit flex-1 bg-[#ffffff45] md:hidden'>
//           <marquee behavior='scroll' direction='left'>
//             <span>100% Secure and Trusted</span>
//           </marquee>
//         </div>
//       </div>
//       {isExposureDetailsOpen && userInfo?.exposure > 0 && (
//         <ExposureDetails onClose={closeModal} userId={userInfo?._id} />
//       )}
//       {isButtonValuesOpen && (
//         <ButtonValues onClose={closeButtonValuesModal} userId={userInfo?._id} />
//       )}
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
import Alllogo from '../../assets/Alllogo.png';
import Shivaylogo from '../../assets/shivaylogo.png';
import newshivalogo from '../../assets/newshivalogo.png';
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
import ButtonValues from './ButtonValues';

function Header({ onMenuToggle, isSidebarOpen }) {
  const [isExposureDetailsOpen, setExposureDetailsOpen] = useState(false);
  const [isButtonValuesOpen, setButtonValuesOpen] = useState(false);

  // New visibility states
  const [showBalance, setShowBalance] = useState(true);
  const [showExposure, setShowExposure] = useState(true);

  const openModal = () => setExposureDetailsOpen(true);
  const closeModal = () => setExposureDetailsOpen(false);
  const openButtonValuesModal = () => setButtonValuesOpen(true);
  const closeButtonValuesModal = () => setButtonValuesOpen(false);
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (userInfo?._id) {
      wsService.connect(dispatch, userInfo._id);
    }
  }, [dispatch, userInfo?._id]);

  const logout = async () => {
    try {
      await api.get('/customer/logout', {
        withCredentials: true,
      });
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
    { name: 'Activity Logs', path: '/activity-log' },
    { name: 'Casino Results', path: '/casino-results' },
    // { name: 'Live Casino Bets', path: '/live-casino-bets' },
    { name: 'Set Button Values' },
    { name: 'Change Password', path: '/change-password' },
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
      <div className='flex items-center justify-between px-[5px] pt-[5px] lg:py-1'>
        <div className='flex items-center gap-1'>
          <button
            onClick={onMenuToggle}
            className='text-primary rounded text-2xl hover:opacity-80 lg:hidden'
            aria-label='Toggle menu'
          >
            {isSidebarOpen ? <IoMdClose /> : <FiMenu />}
          </button>
          <img
            src={Alllogo}
            alt='Alllogo'
            className='h-[35px]'
            onClick={() => navigate('/')}
          />
        </div>

        <div className='flex items-center gap-4 text-[12px]'>
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

          <div className='flex flex-col md:flex-row md:items-center md:gap-4'>
            <div className='flex flex-col items-end pr-2 md:items-start md:pr-0'>
              {/* Conditional Balance display */}
              {showBalance && (
                <span className='text-right md:text-left'>
                  Balance: <span className='font-bold'>{userInfo?.avbalance?.toFixed(2)}</span>
                </span>
              )}
              {/* Conditional Exposure display (Desktop) */}
              {showExposure && (
                <span
                  className='hidden cursor-pointer md:inline'
                  onClick={openModal}
                >
                  Exp: {userInfo?.exposure?.toFixed(2)}
                </span>
              )}
            </div>

            <div className='flex items-center md:hidden'>
              {/* Conditional Exposure display (Mobile) */}
              {showExposure && (
                <span onClick={openModal}>
                  Exp: <span className='font-bold'>{userInfo?.exposure?.toFixed(2)}</span>
                </span>
              )}
              <div className='relative' ref={mobileDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
                >
                  <span>{userInfo?.isDemo ? 'Demo' : userInfo?.userName}</span>
                  <FiChevronDown className='text-xs' />
                </button>
                {isUserDropdownOpen && (
                  <div className='absolute right-0 z-50 mt-2 w-45 cursor-pointer rounded bg-white text-[1rem] font-normal text-[#000000] shadow-lg'>
                    {dropdownItems.map((item) => (
                      <span
                        key={item.name}
                        className='block px-4 py-2 hover:bg-gray-100'
                        onClick={() => {
                          if (item.name === 'Set Button Values') {
                            openButtonValuesModal();
                          } else {
                            navigate(item.path);
                          }
                        }}
                      >
                        {item.name}
                      </span>
                    ))}

                    {/* Mobile Only: Checkbox Toggles */}
                    <div className='md:hidden'>
                      <div className='flex items-center justify-between px-4 py-2 hover:bg-gray-100'>
                        <span>Balance</span>
                        <input
                          type='checkbox'
                          checked={showBalance}
                          onChange={(e) => setShowBalance(e.target.checked)}
                          className='h-4 w-4'
                        />
                      </div>
                      <div className='flex items-center justify-between px-4 py-2 hover:bg-gray-100'>
                        <span>Exposure</span>
                        <input
                          type='checkbox'
                          checked={showExposure}
                          onChange={(e) => setShowExposure(e.target.checked)}
                          className='h-4 w-4'
                        />
                      </div>
                    </div>

                    <div
                      className='block border-t border-gray-200 px-4 py-3 hover:bg-gray-100'
                      onClick={logout}
                    >
                      SignOut
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='relative hidden md:block' ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className='flex items-center gap-1 rounded px-2 py-1 hover:opacity-80'
              >
                <span>{userInfo?.isDemo ? 'Demo' : userInfo?.userName}</span>
                <FiChevronDown className='text-xs' />
              </button>
              {isUserDropdownOpen && (
                <div className='absolute right-0 z-50 mt-2 w-48 cursor-pointer rounded bg-white py-2 text-[1rem] font-normal text-[#000000] shadow-lg'>
                  {dropdownItems.map((item) => (
                    <span
                      key={item.name}
                      className='block px-4 py-2 hover:bg-gray-100'
                      onClick={() => {
                        if (item.name === 'Set Button Values') {
                          openButtonValuesModal();
                        } else {
                          navigate(item.path);
                        }
                      }}
                    >
                      {item.name}
                    </span>
                  ))}
                  <div
                    className='mt-1 border-t px-4 py-2 hover:bg-gray-100'
                    onClick={logout}
                  >
                    SignOut
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
        <div className='text-[12px] flex items-center flex-1 p-1 bg-[#ffffff45] md:hidden leading-none italic'>
          <marquee behavior='scroll' direction='left'>
            <span className='h-full'>100% Secure and Trusted</span>
          </marquee>
        </div>
      </div>
      {isExposureDetailsOpen && userInfo?.exposure > 0 && (
        <ExposureDetails onClose={closeModal} userId={userInfo?._id} />
      )}
      {isButtonValuesOpen && (
        <ButtonValues onClose={closeButtonValuesModal} userId={userInfo?._id} />
      )}
    </header>
  );
}

export default Header;

