import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loanService, financialService, aiService } from '../services/api';
import { 
  Sparkles, 
  ArrowUpRight, 
  Plus, 
  AlertCircle, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  MessageSquareCode,
  Send,
  Loader2,
  Activity,
  ShieldAlert,
  Percent,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LOAN_TYPES = {
  personal: 'Personal Loan',
  home: 'Home Loan',
  auto: 'Auto Loan',
  credit_card: 'Credit Card',
  student: 'Student Loan',
  business: 'Business Loan'
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const [recentAI, setRecentAI] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI financial counselor. Ask me anything about your budget, loans, or how to negotiate debt settlements.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const pData = await financialService.getHealth();
      setProfile(pData);
    } catch (err) {
      console.log("No financial profile loaded yet.");
    }

    try {
      const lData = await loanService.list();
      setLoans(lData.loans || []);
    } catch (err) {
      console.log("No loans found.");
    }

    try {
      const aiHist = await aiService.getHistory(0, 3);
      setRecentAI(aiHist.records || []);
    } catch (err) {
      console.log("Could not load recent AI activity.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const data = await aiService.chat({
        message: userMsg,
        monthly_income: profile?.monthly_income,
        monthly_expenses: profile?.monthly_expenses,
        total_outstanding: profile?.total_outstanding || loans.reduce((acc, curr) => acc + curr.outstanding_amount, 0)
      });
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an issue compiling a response. Please check your credentials or backend server status.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getStressStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return { bg: 'rgba(16, 185, 129, 0.08)', text: '#10B981', border: '1px solid rgba(16, 185, 129, 0.15)' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.08)', text: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.15)' };
      case 'high': return { bg: 'rgba(239, 68, 68, 0.08)', text: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.15)' };
      case 'critical': return { bg: 'rgba(236, 72, 153, 0.08)', text: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.15)' };
      default: return { bg: 'rgba(255, 255, 255, 0.03)', text: 'var(--text-secondary)', border: '1px solid var(--border-color)' };
    }
  };

  // Compute values
  const totalOutstanding = profile?.total_outstanding || loans.reduce((acc, curr) => acc + curr.outstanding_amount, 0) || 0;
  const totalOriginal = loans.reduce((acc, curr) => acc + curr.original_amount, 0) || 0;
  const totalEMI = profile?.total_emi || loans.reduce((acc, curr) => acc + curr.emi_amount, 0) || 0;
  
  const monthlyIncome = profile?.monthly_income || 0;
  const monthlyExpenses = profile?.monthly_expenses || 0;
  const monthlySurplus = profile?.monthly_surplus || 0;
  
  const stressLevel = profile?.stress_level || 'Low';
  const healthScore = profile?.financial_health_score || 0;
  const emiRatio = profile?.emi_ratio || (monthlyIncome > 0 ? (totalEMI / monthlyIncome) * 100 : 0);
  const debtRatio = profile?.debt_income_ratio || (monthlyIncome > 0 ? (totalOutstanding / (monthlyIncome * 12)) * 100 : 0);

  const stats = [
    {
      title: "Total Outstanding Debt",
      value: `$${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      change: profile ? `Stress level: ${stressLevel}` : "Enter budget details",
      changeType: stressLevel?.toLowerCase() === 'low' ? "positive" : "warning",
      icon: TrendingDown,
      color: "var(--accent-rose)",
      link: "/dashboard/loans"
    },
    {
      title: "Monthly Budget Surplus",
      value: `$${monthlySurplus.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      change: `Income: $${monthlyIncome.toLocaleString()} | Exp: $${monthlyExpenses.toLocaleString()}`,
      changeType: monthlySurplus > 0 ? "positive" : "neutral",
      icon: DollarSign,
      color: "#10B981",
      link: "/dashboard/profile"
    },
    {
      title: "Debt to Annual Income (DTI)",
      value: `${debtRatio.toFixed(1)}%`,
      change: debtRatio > 50 ? "High debt ratio" : "Healthy debt ratio",
      changeType: debtRatio > 50 ? "warning" : "positive",
      icon: Percent,
      color: "var(--accent-cyan)",
      link: "/dashboard/profile"
    },
    {
      title: "Financial Health Score",
      value: `${Math.round(healthScore)}/100`,
      change: healthScore >= 70 ? "Accelerated Repayment Mode" : "Snowball Target Active",
      changeType: "positive",
      icon: Activity,
      color: "var(--primary-hover)",
      link: "/dashboard/profile"
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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/dashboard/profile" className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
            Manage Budget
          </Link>
          <Link to="/dashboard/loans/add" className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
            <Plus size={16} /> Add Loan Record
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem', color: 'var(--text-secondary)' }}>
          <Loader2 size={40} className="animate-spin" />
          <span>Retrieving your recovery metrics...</span>
        </div>
      ) : (
        <>
          {/* Stats cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Link key={idx} to={s.link} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                      color: s.changeType === 'positive' ? '#10B981' : s.changeType === 'warning' ? '#F59E0B' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.25rem',
                      fontWeight: 500
                    }}>
                      {s.change}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Visualization segment (Health dial & DTI indicator) */}
          {profile && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }} className="dashboard-content-columns">
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: '#FFF' }}>
                  Monthly Income Allocation Breakdown
                </h4>
                
                {/* Segmented bar */}
                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', display: 'flex', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <div 
                    style={{ 
                      width: `${Math.min(100, (monthlyExpenses / monthlyIncome) * 100)}%`, 
                      background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                      height: '100%' 
                    }}
                    title={`Expenses: ${Math.round((monthlyExpenses / monthlyIncome) * 100)}%`}
                  ></div>
                  <div 
                    style={{ 
                      width: `${Math.min(100 - ((monthlyExpenses / monthlyIncome) * 100), (totalEMI / monthlyIncome) * 100)}%`, 
                      background: 'linear-gradient(to right, var(--primary), var(--accent-rose))',
                      height: '100%' 
                    }}
                    title={`EMIs: ${Math.round((totalEMI / monthlyIncome) * 100)}%`}
                  ></div>
                  {monthlySurplus > 0 && (
                    <div 
                      style={{ 
                        flexGrow: 1, 
                        background: 'linear-gradient(to right, #10B981, var(--accent-cyan))',
                        height: '100%' 
                      }}
                      title={`Surplus: ${Math.round((monthlySurplus / monthlyIncome) * 100)}%`}
                    ></div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></span>
                    <span>Cost of Living: {Math.round((monthlyExpenses / monthlyIncome) * 100)}% (${monthlyExpenses.toLocaleString()})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                    <span>EMIs / Installments: {Math.round((totalEMI / monthlyIncome) * 100)}% (${totalEMI.toLocaleString()})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></span>
                    <span>Surplus / Savings: {Math.round((monthlySurplus / monthlyIncome) * 100)}% (${monthlySurplus.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              {/* Stress dial */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  ...getStressStyle(stressLevel),
                  textAlign: 'center',
                  flexGrow: 1
                }}>
                  <ShieldAlert size={28} style={{ margin: '0 auto 0.5rem auto' }} />
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>DEBT STRESS INDICATOR</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>
                    {stressLevel} Risk
                  </h3>
                </div>
                <div style={{ flexGrow: 1.5, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#FFF' }}>EMI ratio: {emiRatio.toFixed(1)}%</strong>
                  <p style={{ marginTop: '0.25rem' }}>
                    {emiRatio > 40 
                      ? 'Critical load. Leverage AI predictor to model settlements and draft hardship documents.' 
                      : 'Moderate load. Focus surplus funds on paying down principal balances.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1.2fr',
            gap: '2.0rem'
          }} className="dashboard-content-columns">
            
            {/* Left Column: Recent Loans & Recent AI Activity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Recent Loans */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#FFF' }}>
                    Active Debt Accounts
                  </h3>
                  <Link to="/dashboard/loans" style={{ fontSize: '0.8rem', color: 'var(--primary-hover)', fontWeight: 600 }}>
                    View All Portfolio
                  </Link>
                </div>

                {loans.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    <TrendingDown size={36} style={{ opacity: 0.1, marginBottom: '0.5rem' }} />
                    <p>No active loans registered.</p>
                    <Link to="/dashboard/loans/add" style={{ fontSize: '0.8rem', textDecoration: 'underline', color: 'var(--primary-hover)' }}>Add a loan record</Link>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          <th style={{ padding: '0.75rem 0.25rem' }}>Creditor</th>
                          <th style={{ padding: '0.75rem 0.25rem' }}>Outstanding</th>
                          <th style={{ padding: '0.75rem 0.25rem' }}>Rate</th>
                          <th style={{ padding: '0.75rem 0.25rem' }}>EMI</th>
                          <th style={{ padding: '0.75rem 0.25rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loans.slice(0, 4).map((loan) => (
                          <tr key={loan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: '0.85rem', color: '#FFF' }}>
                            <td style={{ padding: '1rem 0.25rem' }}>
                              <div style={{ fontWeight: 600 }}>{loan.lender_name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                {LOAN_TYPES[loan.loan_type] || loan.loan_type}
                              </div>
                            </td>
                            <td style={{ padding: '1rem 0.25rem', fontWeight: 600 }}>
                              ${loan.outstanding_amount?.toLocaleString()}
                            </td>
                            <td style={{ padding: '1rem 0.25rem' }}>{loan.interest_rate}%</td>
                            <td style={{ padding: '1rem 0.25rem' }}>${loan.emi_amount}</td>
                            <td style={{ padding: '1rem 0.25rem', textAlign: 'right' }}>
                              <Link to={`/dashboard/settlement-predictor`} state={{ prefilledLoanId: loan.id }} style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>
                                Predict
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent AI Action History */}
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <History size={16} color="var(--primary-hover)" />
                    Recent AI Actions
                  </h3>
                  <Link to="/dashboard/ai-history" style={{ fontSize: '0.8rem', color: 'var(--primary-hover)', fontWeight: 600 }}>
                    Full History Logs
                  </Link>
                </div>

                {recentAI.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '0.8rem' }}>No recent letters or strategies generated.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentAI.slice(0, 3).map((record) => (
                      <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: record.request_type === 'strategy' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(236, 72, 153, 0.12)',
                            color: record.request_type === 'strategy' ? 'var(--primary-hover)' : 'var(--accent-rose)'
                          }}>
                            {record.request_type}
                          </span>
                          <span style={{ color: '#FFF', fontWeight: 500 }}>{record.prompt_summary}</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: AI Counselor Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
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
                  minHeight: '220px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.03)'
                }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.sender === 'user' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
                      border: msg.sender === 'user' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem',
                      maxWidth: '85%',
                      color: msg.sender === 'user' ? '#FFF' : 'var(--text-secondary)',
                      lineHeight: 1.4
                    }}>
                      {msg.text}
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <Loader2 size={12} className="animate-spin" /> Counselor typing...
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ask counselor..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={chatLoading}
                    style={{ padding: '0.65rem 0.85rem', fontSize: '0.85rem' }} 
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1rem' }} disabled={chatLoading}>
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </>
      )}

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

export default Dashboard;
