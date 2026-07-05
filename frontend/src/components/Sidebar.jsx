import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingDown, 
  Sparkles, 
  Settings, 
  BookOpen, 
  LifeBuoy,
  FileText,
  History,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Loan Portfolio', path: '/dashboard/loans', icon: TrendingDown },
    { name: 'Settlement Modeling', path: '/dashboard/settlement-predictor', icon: Sparkles, badge: 'AI' },
    { name: 'Negotiation Writer', path: '/dashboard/negotiate', icon: FileText },
    { name: 'Know Your Rights', path: '/dashboard/rights', icon: BookOpen },
    { name: 'AI Gen History', path: '/dashboard/ai-history', icon: History },
    { name: 'Profile & Financials', path: '/dashboard/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      padding: '2rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: 'calc(100vh - 71px)',
      position: 'sticky',
      top: '71px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ padding: '0 0.5rem' }}>
          <p style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            Menu Options
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    end
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1rem',
                      borderRadius: '10px',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                      border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span style={{
                        background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary) 100%)',
                        color: '#000',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '6px',
                        letterSpacing: '0.05em'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Sidebar Footer Support Card */}
      <div className="glass-card" style={{
        padding: '1.1rem',
        marginTop: 'auto',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <LifeBuoy size={16} color="var(--accent-cyan)" />
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>Need help?</h4>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Our AI counselors are available 24/7. Ask any question.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
