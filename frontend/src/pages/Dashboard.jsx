import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowUpRight, 
  Plus, 
  AlertCircle, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  MessageSquareCode
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  // Mock static financial indicators (Epic 1 placeholder with premium UI)
  const stats = [
    {
      title: "Total Outstanding Debt",
      value: "$42,850.00",
      change: "-$1,200 this month",
      changeType: "positive", // positive meaning good (debt decrease)
      icon: TrendingDown,
      color: "var(--accent-cyan)"
    },
    {
      title: "Consolidated Monthly Budget",
      value: "$3,400.00",
      change: "$850 surplus target",
      changeType: "neutral",
      icon: DollarSign,
      color: "var(--primary-hover)"
    },
    {
      title: "AI Optimized Repayments",
      value: "Snowball Mode",
      change: "Saves $4,120 in interest",
      changeType: "positive",
      icon: Sparkles,
      color: "var(--accent-rose)"
    },
    {
      title: "Next Planned Payment",
      value: "July 18, 2026",
      change: "Auto-debit setup active",
      changeType: "neutral",
      icon: Calendar,
      color: "var(--text-secondary)"
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>
            Financial Recovery Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Welcome back, <span style={{ color: '#FFF', fontWeight: 600 }}>{user?.full_name || user?.email}</span>. Here is your AI debt summary.
          </p>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
          <Plus size={16} /> Add Asset/Debt Record
        </button>
      </div>

      {/* Stats cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem'
      }}>
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {s.title}
                </span>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <Icon size={18} color={s.color} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#FFF' }}>
                  {s.value}
                </h3>
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: s.changeType === 'positive' ? '#10B981' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginTop: '0.25rem',
                  fontWeight: 500
                }}>
                  {s.changeType === 'positive' && <ArrowUpRight size={12} />}
                  {s.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2.0rem',
        marginTop: '0.5rem'
      }} className="dashboard-content-columns">
        
        {/* Left Column: Debt Breakdown & Progress Visualizer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1.5rem' }}>
              Debt Liquidation Track
            </h3>

            {/* Custom pure CSS bar charts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>Chase Sapphire Credit Card</span>
                  <span style={{ color: 'var(--text-secondary)' }}>$12,450.00 / $15,000 limit (83%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: '83%', height: '100%', background: 'linear-gradient(to right, var(--primary), var(--accent-rose))', borderRadius: '99px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>Sallie Mae Student Loan</span>
                  <span style={{ color: 'var(--text-secondary)' }}>$22,000.00 / $30,000 original (73%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: '73%', height: '100%', background: 'linear-gradient(to right, var(--primary), var(--accent-cyan))', borderRadius: '99px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>Ally Auto Finance</span>
                  <span style={{ color: 'var(--text-secondary)' }}>$8,400.00 / $18,000 original (46%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: '46%', height: '100%', background: 'linear-gradient(to right, var(--secondary), var(--accent-cyan))', borderRadius: '99px' }}></div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: '10px',
              padding: '1rem',
              marginTop: '2rem'
            }}>
              <AlertCircle size={20} color="var(--primary-hover)" />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>AI Insight:</strong> Chase Sapphire has the highest interest rate (24.9% APR). Paying an extra $150/month towards it reduces debt-free target by <strong>7 months</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Counselor Chat placeholder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquareCode size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#FFF' }}>
                FinRelief AI Counselor
              </h3>
            </div>
            
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid rgba(255, 255, 255, 0.03)'
            }}>
              <p style={{ fontStyle: 'italic' }}>
                "Hello! Ready to refine your budget goals or generate dispute letters for collections? Specify your question below."
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                Online • Gemini-Powered
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ask counselor..." 
                style={{ padding: '0.65rem 0.85rem', fontSize: '0.85rem' }} 
              />
              <button className="btn btn-primary" style={{ padding: '0.65rem 1rem' }}>
                Send
              </button>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .dashboard-content-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default Dashboard;
