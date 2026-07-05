import React, { useState, useEffect } from 'react';
import { financialService } from '../services/api';
import { ArrowUpRight, DollarSign, Wallet, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const BudgetTracker = () => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await financialService.getHealth();
      setProfile(data);
      if (data.monthly_income) {
        setIncome(data.monthly_income.toString());
      }
      if (data.monthly_expenses) {
        setExpenses(data.monthly_expenses.toString());
      }
    } catch (err) {
      console.log('No existing financial profile found. Enter details to calculate.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!income || parseFloat(income) <= 0) {
      setError('Please enter a valid monthly income greater than 0.');
      return;
    }
    if (!expenses || parseFloat(expenses) < 0) {
      setError('Please enter valid monthly expenses.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await financialService.calculate(income, expenses);
      setProfile(data);
      setMessage('Financial profile calculated and saved successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to calculate financial health. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return '#10B981'; // Green
      case 'medium': return '#F59E0B'; // Orange
      case 'high': return '#EF4444'; // Red
      case 'critical': return '#EC4899'; // Pink/Rose
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
      
      {/* Header section */}
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.5rem'
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>
          Budget Tracker & Health Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Configure your financial profile to calculate surplus metrics, stress indicators, and debt ratios.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
      }} className="dashboard-content-columns">
        
        {/* Left Column: Form Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={20} color="var(--primary-hover)" />
              Budget Setup
            </h3>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={18} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="income">Gross Monthly Income ($)</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    <DollarSign size={18} />
                  </div>
                  <input
                    type="number"
                    id="income"
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Your total monthly pre-tax income from salary or other sources.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expenses">Monthly Expenses ($) - Excluding EMIs</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                    <DollarSign size={18} />
                  </div>
                  <input
                    type="number"
                    id="expenses"
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Total cost of living (rent, utilities, groceries, etc.) without current loan installments.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Calculate Financial Health'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Calculated metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--accent-cyan)" />
              Financial Health Output
            </h3>

            {profile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'space-between', height: '100%' }}>
                {/* Score section */}
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
                    background: 'rgba(0,0,0,0.2)'
                  }}>
                    {Math.round(profile.financial_health_score)}
                  </div>
                  <div>
                    <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '1.1rem' }}>Health Score</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Overall score calculated on debt ratio and surplus.
                    </p>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monthly Surplus</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: profile.monthly_surplus > 0 ? '#10B981' : '#EF4444', fontFamily: 'var(--font-display)' }}>
                      ${profile.monthly_surplus?.toFixed(2)}
                    </h3>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Debt Stress Level</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: getStressColor(profile.stress_level), fontFamily: 'var(--font-display)' }}>
                      {profile.stress_level}
                    </h3>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>EMI Ratio</span>
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

                {/* Progress bar visualizer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Monthly Income Allocation Breakdown</span>
                    </div>
                    
                    {/* Multi-segmented progress bar */}
                    <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', display: 'flex', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      {/* Expenses segment */}
                      <div 
                        style={{ 
                          width: `${Math.min(100, (profile.monthly_expenses / profile.monthly_income) * 100)}%`, 
                          background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                          height: '100%' 
                        }}
                        title={`Expenses: ${Math.round((profile.monthly_expenses / profile.monthly_income) * 100)}%`}
                      ></div>
                      {/* EMI segment */}
                      <div 
                        style={{ 
                          width: `${Math.min(100 - ((profile.monthly_expenses / profile.monthly_income) * 100), (profile.total_emi / profile.monthly_income) * 100)}%`, 
                          background: 'linear-gradient(to right, var(--primary), var(--accent-rose))',
                          height: '100%' 
                        }}
                        title={`EMIs: ${Math.round((profile.total_emi / profile.monthly_income) * 100)}%`}
                      ></div>
                      {/* Surplus segment */}
                      {profile.monthly_surplus > 0 && (
                        <div 
                          style={{ 
                            flexGrow: 1, 
                            background: 'linear-gradient(to right, #10B981, var(--accent-cyan))',
                            height: '100%' 
                          }}
                          title={`Surplus: ${Math.round((profile.monthly_surplus / profile.monthly_income) * 100)}%`}
                        ></div>
                      )}
                    </div>
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

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4
                }}>
                  <TrendingUp size={16} color="var(--primary-hover)" />
                  <span>
                    {profile.stress_level === 'Low' 
                      ? 'Excellent budget health! You have significant surplus to accelerate payments or invest.'
                      : profile.stress_level === 'Medium'
                      ? 'Good balance, but consider minimizing non-essentials to boost your financial safety net.'
                      : 'High debt stress detected. Check our Debt Analysis to restructure details or predict settlements.'
                    }
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                gap: '0.5rem',
                flexGrow: 1,
                minHeight: '200px',
                textAlign: 'center'
              }}>
                <Wallet size={36} color="rgba(255,255,255,0.05)" />
                <p>No profile computed yet.</p>
                <p style={{ fontSize: '0.8rem' }}>Enter income and expense values to run the engine.</p>
              </div>
            )}
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

export default BudgetTracker;
