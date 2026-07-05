import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Cpu, Landmark } from 'lucide-react';

export const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Cpu,
      title: "AI Debt Assessment",
      desc: "Our neural advisor analyzes your debt structures and interest rates to build an immediate recovery vector."
    },
    {
      icon: TrendingUp,
      title: "Optimized Payment Engine",
      desc: "Compare snowball, avalanche, and custom AI negotiation schedules to see exactly when you will be debt-free."
    },
    {
      icon: Landmark,
      title: "Creditor Settlements",
      desc: "Generate professional dispute and negotiation request letters backed by legal guidelines and AI prompts."
    }
  ];

  return (
    <div className="hero-container animate-fade-in">
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '99px',
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        marginBottom: '2rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--primary-hover)'
      }}>
        <Sparkles size={14} />
        Introducing FinRelief AI v1.0
      </div>

      <h1 className="hero-title">
        Navigate Debt Recovery <br/>
        <span className="gradient-text">Empowered by Artificial Intelligence</span>
      </h1>

      <p className="hero-subtitle">
        FinRelief AI is the state-of-the-art platform designed to analyze, structure, and expedite your path out of debt. Let our AI algorithms model your optimal recovery plan today.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard <ArrowRight size={18} />
          </Link>
        ) : (
          <>
            <Link to="/register" className="btn btn-primary">
              Get Started for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In to Account
            </Link>
          </>
        )}
      </div>

      {/* Benefits / Features grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        width: '100%',
        marginTop: '2rem'
      }}>
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="glass-card" style={{
              padding: '2rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <Icon size={24} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Trust Badge */}
      <div style={{
        marginTop: '5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <ShieldCheck size={16} color="var(--primary-hover)" />
        Fully Secure 256-bit Encryption • We do not sell your personal financial data.
      </div>
    </div>
  );
};

export default Home;
