import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, LogOut, LogIn, UserPlus, Home } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(7, 11, 19, 0.75)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
        }}>
          <Shield size={20} color="#FFF" />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(to right, #fff, #9CA3AF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          FinRelief <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" style={{
          fontSize: '0.9rem',
          color: isActive('/') ? '#FFF' : 'var(--text-secondary)',
          fontWeight: isActive('/') ? 600 : 500,
          transition: 'color 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <Home size={16} />
          Home
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard" style={{
              fontSize: '0.9rem',
              color: isActive('/dashboard') ? '#FFF' : 'var(--text-secondary)',
              fontWeight: isActive('/dashboard') ? 600 : 500,
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Welcome, <strong style={{ color: '#fff' }}>{user.full_name || user.email}</strong>
              </span>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              fontSize: '0.9rem',
              color: isActive('/login') ? '#FFF' : 'var(--text-secondary)',
              fontWeight: isActive('/login') ? 600 : 500,
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <LogIn size={16} />
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" style={{
              padding: '0.55rem 1.1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <UserPlus size={16} />
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
