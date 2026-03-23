import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Navbar from '../components/header/Navbar';
import MobileNav from '../components/header/MobileNav';
import Sidebar from '../components/sidebar/Sidebar';
import Footer from '../components/footer/Footer';
function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className='bg-body min-h-screen'>
      <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className='hidden lg:block'>
        <Navbar />
      </div>
      {/* <div className='block md:hidden'>
        <MobileNav />
      </div> */}
      <div className='flex'>
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <main className='scrollbar-hide w-full flex-1 lg:ml-0'>
          <Outlet />
        </main>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default MainLayout;
