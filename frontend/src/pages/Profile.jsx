import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { financialService } from '../services/api';
import { User, Mail, DollarSign, Wallet, Activity, TrendingUp, ShieldCheck, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form State
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await financialService.getHealth();
      setProfile(data);
      if (data.monthly_income) {
        setIncome(data.monthly_income.toString());
      }
      if (data.monthly_expenses) {
        setExpenses(data.monthly_expenses.toString());
      }
    } catch (err) {
      console.log('No financial profile computed yet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!income || parseFloat(income) <= 0) {
      setError('Please enter a valid monthly income greater than 0.');
      return;
    }
    if (!expenses || parseFloat(expenses) < 0) {
      setError('Please enter valid monthly expenses.');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const data = await financialService.calculate(income, expenses);
      setProfile(data);
      setSuccess('Financial profile updated and saved successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update financial profile.');
    } finally {
      setUpdating(false);
    }
  };

  const getStressColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#EC4899';
      default: return 'var(--text-secondary)';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>
          My Profile & Financial Indicator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Manage your personal details, and configure the budget parameters driving your AI debt metrics.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="dashboard-content-columns">
        
        {/* Left Column: Account Details & Update Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Account Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--primary-hover)" />
              Account Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--primary-hover)', flexShrink: 0 }}>
                  <User size={20} style={{ margin: 'auto' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Full Name</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFF' }}>{user?.full_name || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--accent-cyan)', flexShrink: 0 }}>
                  <Mail size={20} style={{ margin: 'auto' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Address</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFF' }}>{user?.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#10B981', flexShrink: 0 }}>
                  <ShieldCheck size={20} style={{ margin: 'auto' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Session Security Status</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#10B981' }}>Authenticated Verified</div>
                </div>
              </div>
            </div>
          </div>

          {/* Update Form Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={20} color="var(--primary-hover)" />
              Budget Setup
            </h3>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Gross Monthly Income ($)</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    <DollarSign size={18} />
                  </div>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 5000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Operating Expenses ($) - Excluding EMIs</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    <DollarSign size={18} />
                  </div>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 2000"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Persisting settings...
                  </>
                ) : (
                  <>
                    Save Financial profile
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Calculated metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '445px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--accent-cyan)" />
              Calculated Financial Health
            </h3>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem', color: 'var(--text-secondary)', flexGrow: 1 }}>
                <RefreshCw size={36} className="animate-spin" />
                <span>Loading metrics...</span>
              </div>
            ) : profile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    border: `4px solid ${getHealthScoreColor(profile.financial_health_score)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#FFF',
                    background: 'rgba(0,0,0,0.2)',
                    flexShrink: 0
                  }}>
                    {Math.round(profile.financial_health_score)}
                  </div>
                  <div>
                    <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '1.1rem' }}>Health Index Score</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Overall grade computed on surplus targets and debt liabilities.
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calculated Surplus</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: profile.monthly_surplus > 0 ? '#10B981' : '#EF4444', fontFamily: 'var(--font-display)' }}>
                      ${profile.monthly_surplus?.toFixed(2)}
                    </h3>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Debt Stress Rating</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: getStressColor(profile.stress_level), fontFamily: 'var(--font-display)' }}>
                      {profile.stress_level}
                    </h3>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monthly EMI Ratio</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFF', fontFamily: 'var(--font-display)' }}>
                      {profile.emi_ratio?.toFixed(1)}%
                    </h3>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Debt to Annual Income</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFF', fontFamily: 'var(--font-display)' }}>
                      {profile.debt_income_ratio?.toFixed(1)}%
                    </h3>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Income Allocation breakdown</span>
                  
                  <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', display: 'flex', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div 
                      style={{ 
                        width: `${Math.min(100, (profile.monthly_expenses / profile.monthly_income) * 100)}%`, 
                        background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                        height: '100%' 
                      }}
                    ></div>
                    <div 
                      style={{ 
                        width: `${Math.min(100 - ((profile.monthly_expenses / profile.monthly_income) * 100), (profile.total_emi / profile.monthly_income) * 100)}%`, 
                        background: 'linear-gradient(to right, var(--primary), var(--accent-rose))',
                        height: '100%' 
                      }}
                    ></div>
                    {profile.monthly_surplus > 0 && (
                      <div 
                        style={{ 
                          flexGrow: 1, 
                          background: 'linear-gradient(to right, #10B981, var(--accent-cyan))',
                          height: '100%' 
                        }}
                      ></div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                      <span>Expenses (${profile.monthly_expenses?.toFixed(0)})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                      <span>EMIs (${profile.total_emi?.toFixed(0)})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                      <span>Surplus (${profile.monthly_surplus?.toFixed(0)})</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifycontent: 'center', color: 'var(--text-muted)', gap: '0.5rem', textAlign: 'center', flexGrow: 1 }}>
                <Wallet size={36} color="rgba(255,255,255,0.05)" />
                <p>No financial profile found.</p>
                <p style={{ fontSize: '0.8rem' }}>Enter income and expense values to run calculation parameters.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 992px) {
          .dashboard-content-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
