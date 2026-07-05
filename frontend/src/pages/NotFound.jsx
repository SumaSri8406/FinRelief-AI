import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      textAlign: 'center',
      padding: '2rem'
    }} className="animate-fade-in">
      
      <div className="glass-card" style={{
        padding: '3rem',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#EF4444'
        }}>
          <ShieldAlert size={40} />
        </div>

        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: '#FFF', lineHeight: 1.2 }}>
            404 - Page Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
            The pathway you requested does not exist or has been relocated. Return to security dashboard to manage your liabilities.
          </p>
        </div>

        <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
          <Home size={18} /> Back to Dashboard
        </Link>
      </div>

    </div>
  );
};

export default NotFound;
