import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Menu, X } from 'lucide-react';

export const MainLayout = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // We only show the sidebar if we are inside the dashboard path
  const showSidebar = location.pathname.startsWith('/dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Navbar />

      <div className="app-container">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <div style={{ display: 'block' }} className="desktop-sidebar">
            <Sidebar />
          </div>
        )}

        {/* Mobile Sidebar Toggle Button */}
        {showSidebar && (
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 100,
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'none', // Styled in media query but handled in inline style for simplicity
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              cursor: 'pointer'
            }}
            className="mobile-sidebar-toggle"
          >
            {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* Mobile Sidebar Overlay/Drawer */}
        {showSidebar && mobileSidebarOpen && (
          <div style={{
            position: 'fixed',
            top: '71px',
            left: 0,
            width: '260px',
            height: 'calc(100vh - 71px)',
            zIndex: 99,
            background: 'var(--bg-sidebar)',
            boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <main className="main-content" style={{
          width: showSidebar ? 'calc(100% - 260px)' : '100%',
          transition: 'all 0.3s'
        }}>
          <Outlet />
        </main>
      </div>

      {/* Embedded CSS for responsive styles that can't be easily done inline */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-sidebar-toggle {
            display: flex !important;
          }
          .main-content {
            width: 100% !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
