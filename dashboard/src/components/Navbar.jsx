import { useEffect, useState } from 'react';
import {
  IoMdArrowDropdown,
  IoMdClose,
  IoMdRefresh,
  IoMdMenu,
} from 'react-icons/io';
import { AiOutlineLogout } from 'react-icons/ai';
import { NavLink, useLocation } from 'react-router-dom';
import { MdLogout } from 'react-icons/md';
// import logo from "../assets/icons/theme-1709828838678-aura555.png";
// import logo from "../../client/src/assets/icons/daimondpan (1).png"
import Allpanellogo from '../assets/allpanel.png';
import jdlogo from '../assets/jdlogo.png';
import newshivalogo from '../assets/newshivalogo.png';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAdmin,
  user_reset,
  userLogout,
  changePasswordBySubAdmin,
} from '../redux/reducer/authReducer';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, errorMessage, successMessage, loading, isPasswordChanged } =
    useSelector((state) => state.auth);

  const [activeItem, setActiveItem] = useState('Home');
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const shouldShowPasswordPopup = isPasswordChanged === false;
  const [changeFormData, setChangeFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  const changeSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(
        changePasswordBySubAdmin({
          oldPassword: changeFormData.oldPassword,
          newPassword: changeFormData.newPassword,
          confirmPassword: changeFormData.confirmPassword,
        })
      );

      if (result.type.endsWith('/fulfilled')) {
        toast.success('Password changed successfully');
        // ✅ Clear form
        setChangeFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else if (result.type.endsWith('/rejected')) {
        toast.error(result.payload || 'Failed to change password');
      }
    } catch (error) {
      console.log('Password change error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/home' },
    {
      name: 'Downline List',
      submenu: [
        { name: 'User Downline List', path: '/user-download-list' },
        {
          name: 'Agent Downline List',
          path: '/agent-download-list',
          reload: true,
        },
      ],
    },
    { name: 'My account', path: '/my-account' },
    { name: 'Security', path: '/secureauth' },
    {
      name: 'My Report',
      submenu: [
        { name: 'Event Profit/Loss', path: '/eventpl' },
        { name: 'Downline Profit/Loss', path: '/downpl' },
      ],
    },
    { name: 'BetList', path: '/betlist' },
    { name: 'Market Analysis', path: '/my-market' },
    {
      name: 'Banking',
      submenu: [
        { name: 'User Banking', path: '/banking' },
        { name: 'Master Banking', path: '/master-banking' },
      ],
    },
    // { name: "Commision", path: "/commission" },
    { name: 'Password History', path: '/password-history' },
    { name: 'Restore User', path: '/restore-user' },
    ...(userInfo?.role === 'supperadmin'
      ? [
          {
            name: 'Manual Control',
            submenu: [
              { name: 'Match Control', path: '/match-control' },
              { name: 'Result Control', path: '/result-control' },
            ],
          },
        ]
      : []),
  ];

  const logout = async () => {
    try {
      const data = await dispatch(userLogout()).unwrap();
      localStorage.removeItem('auth');
      toast.success(data.message);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (error) {
      toast.error(error);
    }
  };

  const reload = () => {
    dispatch(getAdmin());
  };

  const toggleMobileSubmenu = (itemName, event) => {
    if (mobileSubmenuOpen === itemName) {
      setMobileSubmenuOpen(null);
    } else {
      // Calculate position relative to viewport
      const rect = event.target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 200; // Approximate dropdown height

      // Position dropdown above if near bottom of screen
      if (rect.bottom + dropdownHeight > viewportHeight) {
        setDropdownPosition({
          top: rect.top - dropdownHeight,
          left: rect.left,
          position: 'fixed',
        });
      } else {
        setDropdownPosition({
          top: rect.bottom,
          left: rect.left,
          position: 'fixed',
        });
      }
      setMobileSubmenuOpen(itemName);
    }
  };

  const isSubmenuActive = (item) => {
    if (!item.submenu) return false;

    return item.submenu.some((sub) => {
      const currentPath = location.pathname;
      return currentPath === sub.path;
    });
  };

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div
        className={`sticky top-0 z-10 w-full ${
          location.pathname == '/login' ? 'hidden' : 'block'
        }`}
      >
        {/* Mobile Header - Split into two rows */}
        <div className='lg:hidden'>
          {/* Top row - Role and Name */}
          <header className='bg-color flex h-[75px] items-center justify-between border-b border-gray-800 p-2'>
            <div className='flex grid items-center'>
              <img src={Allpanellogo} alt='logo' className='h-[40px]' />
            </div>
            <div className='grid justify-items-end'>
              <div className='flex items-center gap-2'>
                <p
                  className='rounded-sm bg-[#292929] px-1.5 text-[10px] text-white uppercase'
                  style={{
                    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, .4)',
                  }}
                >
                  {userInfo?.role === 'white' ? 'white_label' : userInfo?.role}
                </p>
                <p className='text-sm text-white'>{userInfo?.userName}</p>
              </div>
              <div className='mt-1 flex items-center gap-2'>
                <div className='text-xs font-semibold text-white'>
                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    <p>
                      IRP (<span className=''>{userInfo?.avbalance || 0}</span>)
                    </p>
                  )}
                </div>
                <button
                  onClick={reload}
                  className='flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-[2px] bg-[#2a2a2a] text-[20px] leading-[20px] text-white'
                  style={{
                    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, .4)',
                  }}
                >
                  <IoMdRefresh className='p-[1px]' />
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Desktop Header */}
        <header className='bg-color hidden h-[75px] items-center justify-between border-b border-gray-800 md:px-20 lg:flex'>
          <img src={Allpanellogo} alt='logo' className='h-[60px]' />
          <div className='mr-4 flex items-center gap-4'>
            <div className='relative flex items-center gap-2'>
              <p
                className='rounded-sm bg-[#292929] px-1.5 text-[10px] text-white uppercase'
                style={{ boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, .4)' }}
              >
                {userInfo?.role === 'white' ? 'white_label' : userInfo?.role}
              </p>
              <p className='text-sm text-white'>{userInfo?.name}</p>
              <div className='text-sm text-[13px] font-semibold text-white'>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <p>
                    IRP (<span className=''>{userInfo?.avbalance || 0}</span>)
                  </p>
                )}
              </div>
              <button
                onClick={reload}
                className='flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-[2px] bg-[#2a2a2a] text-[20px] leading-[20px] text-white'
                style={{ boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, .4)' }}
              >
                <IoMdRefresh className='p-[1px]' />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation (Horizontal Scrollable) */}
        <nav className='bg-color2 relative mb-[15px] overflow-x-auto leading-[30px] whitespace-nowrap text-white xl:hidden'>
          <ul className='flex'>
            {navItems.map((item, i) => (
              <li
                key={i}
                className='relative inline-block'
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.path ? (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block border-r border-gray-500 px-3 text-[13px] font-semibold transition-colors ${
                        isActive ? 'bg-color text-white' : 'text-black'
                      }`
                    }
                    onClick={() => setActiveItem(item.name)}
                  >
                    {item.name}
                  </NavLink>
                ) : (
                  <div className='relative'>
                    <span
                      className='flex cursor-pointer items-center border-r border-gray-500 px-3 text-[13px] font-semibold text-black'
                      onClick={(e) => toggleMobileSubmenu(item.name, e)}
                    >
                      {item.name}
                      <IoMdArrowDropdown className='h-5 w-5' />
                    </span>

                    {/* Mobile Submenu Dropdown - positioned absolutely within viewport */}
                    {mobileSubmenuOpen === item.name && (
                      <ul
                        className='bg-color fixed top-0 left-0 z-20 w-40 border border-gray-700 font-semibold text-white shadow-lg'
                        style={{
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          position: dropdownPosition.position,
                        }}
                      >
                        {item.submenu
                          .filter(
                            (sub) =>
                              !(
                                userInfo?.role === 'agent' &&
                                sub.name === 'Agent Downline List'
                              )
                          )
                          .map((sub, index) => (
                            <li
                              key={index}
                              className='border-b border-gray-700 last:border-b-0 hover:bg-gray-800'
                            >
                              <NavLink
                                to={sub.path}
                                className='block px-3 text-[13px]'
                                onClick={(e) => {
                                  setActiveItem(item.name);
                                  setMobileSubmenuOpen(null);
                                  if (sub.reload) {
                                    e.preventDefault();
                                    navigate(sub.path);
                                    window.location.reload();
                                  }
                                }}
                              >
                                {sub.name}
                              </NavLink>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
            {/* Logout button in scrollable menu */}
            <li className='inline-block'>
              <button
                onClick={logout}
                className='flex items-center gap-1 border-r border-gray-500 px-3 text-[13px] font-semibold text-black'
              >
                Logout <MdLogout />
              </button>
            </li>
          </ul>
        </nav>

        {/* Desktop Navigation */}
        <nav className='bg-color2 mb-[15px] hidden text-black xl:block'>
          <ul className='relative mx-auto flex w-full max-w-[1350px] flex-row leading-[30px]'>
            {navItems.map((item, i) => (
              <li
                key={i}
                className='relative'
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.path ? (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block border-r border-gray-500 px-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                        isActive ? 'bg-color text-white' : 'text-black'
                      }`
                    }
                    onClick={() => setActiveItem(item.name)}
                  >
                    {item.name}
                  </NavLink>
                ) : (
                  <span
                    className={`flex cursor-pointer items-center gap-[10px] border-r border-gray-500 px-3 text-[13px] font-semibold whitespace-nowrap text-black ${isSubmenuActive(item) ? 'bg-color text-white' : 'text-black'} "`}
                  >
                    {item.name}
                    <IoMdArrowDropdown className='w-3' />
                  </span>
                )}

                {/* Submenu Dropdown */}
                {item.submenu && hoveredItem === item.name && (
                  <ul className='bg-color absolute top-full left-0 z-20 overflow-visible font-semibold whitespace-nowrap text-white shadow-lg'>
                    {item.submenu
                      .filter(
                        (sub) =>
                          !(
                            userInfo?.role === 'agent' &&
                            sub.name === 'Agent Downline List'
                          )
                      )
                      .map((sub, index) => (
                        <li
                          key={index}
                          className='border-b border-gray-700 last:border-b-0'
                        >
                          <NavLink
                            to={sub.path}
                            className='block px-3 text-[13px]'
                            onClick={(e) => {
                              setActiveItem(item.name);
                              if (sub.reload) {
                                e.preventDefault();
                                navigate(sub.path);
                                window.location.reload();
                              }
                            }}
                          >
                            {sub.name}
                          </NavLink>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
            <li
              onClick={logout}
              className='flex flex-1 cursor-pointer items-center justify-end gap-1 px-3 text-[13px] font-semibold whitespace-nowrap text-black transition-colors'
            >
              Logout <MdLogout />
            </li>
          </ul>
        </nav>

        {/* Popup */}
        {showPopup && (
          <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div className='bg-opacity-50 absolute inset-0 bg-black'></div>
            <div className='bg-color relative z-10 mx-4 w-full p-4 text-white shadow-lg md:max-w-lg'>
              <div className='flex items-center justify-between'>
                <h2 className='text-center text-lg font-bold'>
                  Non-Gambling Territories.
                </h2>
                <button
                  onClick={() => setShowPopup(false)}
                  className='bg-color rounded-md p-1 text-xl'
                >
                  <IoMdClose />
                </button>
              </div>
              <hr className='my-2 border-white' />
              <p className='text-sm'>
                Connecting to our site from non-gambling countries, it will be
                User's responsibility to ensure that their use of the service is
                lawful.
              </p>
              <h3 className='my-3 text-center font-bold'>
                Underage gambling is prohibited.
              </h3>
              <p className='text-center text-sm'>
                Please confirm if you are 18 years old and above as of today.
              </p>
              <hr className='my-2 border-white' />
              <div className='mt-4 flex justify-center gap-2'>
                <button
                  className='w-[130px] rounded bg-white py-1 text-black hover:bg-gray-300'
                  onClick={() => setShowPopup(false)}
                >
                  Confirm
                </button>
                <button
                  className='w-[130px] rounded border border-white bg-black py-1 text-white'
                  onClick={() => setShowPopup(false)}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {shouldShowPasswordPopup && (
        <div className='fixed z-50 flex h-full w-full items-center justify-center bg-black/30'>
          <div className='fixed top-6 left-1/2 w-90 -translate-x-1/2 rounded-lg bg-white shadow-lg md:w-[500px]'>
            <div className='flex items-center justify-between rounded-t-lg bg-gray-700 px-4 py-2 text-white'>
              <h2 className='font-semibold'>Change Password</h2>
            </div>
            <form className='space-y-4 p-6' onSubmit={changeSubmit}>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='relative'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Old Password <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type={showOld ? 'text' : 'password'}
                    placeholder='Old Password..'
                    value={changeFormData.oldPassword}
                    onChange={(e) =>
                      setChangeFormData({
                        ...changeFormData,
                        oldPassword: e.target.value,
                      })
                    }
                    className='mt-1 w-full rounded border px-3 py-2 focus:ring focus:ring-blue-200'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowOld(!showOld)}
                    className='absolute top-9 right-3 text-gray-500'
                  >
                    {showOld ? '🙈' : '👁️'}
                  </button>
                </div>

                <div className='relative'>
                  <label className='block text-sm font-medium text-gray-700'>
                    New Password <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder='New Password..'
                    value={changeFormData.newPassword}
                    onChange={(e) =>
                      setChangeFormData({
                        ...changeFormData,
                        newPassword: e.target.value,
                      })
                    }
                    className='mt-1 w-full rounded border px-3 py-2 focus:ring focus:ring-blue-200'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowNew(!showNew)}
                    className='absolute top-9 right-3 text-gray-500'
                  >
                    {showNew ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className='relative'>
                <label className='block text-sm font-medium text-gray-700'>
                  Confirm Password <span className='text-red-500'>*</span>
                </label>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder='Confirm Password..'
                  value={changeFormData.confirmPassword}
                  onChange={(e) =>
                    setChangeFormData({
                      ...changeFormData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className='mt-1 w-full rounded border px-3 py-2 focus:ring focus:ring-blue-200'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirm(!showConfirm)}
                  className='absolute top-9 right-3 text-gray-500'
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  className='rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900'
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
