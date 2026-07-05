import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loanService, settlementService } from '../services/api';
import { Sparkles, Calendar, ShieldAlert, History, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const LOAN_TYPES = {
  personal: 'Personal Loan',
  home: 'Home Loan',
  auto: 'Auto Loan',
  credit_card: 'Credit Card',
  student: 'Student Loan',
  business: 'Business Loan'
};

export const SettlementPredictor = () => {
  const location = useLocation();
  const prefilledLoanId = location.state?.prefilledLoanId || null;

  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [skip, setSkip] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 5;

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const loanRes = await loanService.list();
      setLoans(loanRes.loans || []);
      if (prefilledLoanId) {
        setSelectedLoanId(prefilledLoanId.toString());
      } else if (loanRes.loans && loanRes.loans.length > 0) {
        setSelectedLoanId(loanRes.loans[0].id.toString());
      }

      await fetchHistory(0);
    } catch (err) {
      setError('Could not retrieve necessary data. Make sure backend endpoints are accessible.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (newSkip) => {
    try {
      const histRes = await settlementService.getHistory();
      // Since backend doesn't support pagination parameters or filtering directly in the API for history in some branches, we retrieve full and paginate in frontend
      const records = histRes.records || [];
      setHistoryRecords(records);
      setHistoryCount(histRes.total || records.length);
    } catch (err) {
      console.error("Could not fetch settlement history logs", err.message);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedLoanId) {
      setError('Please select a registered loan from the dropdown.');
      return;
    }

    setPredicting(true);
    setError('');
    setSuccess('');
    setPredictionResult(null);
    try {
      const result = await settlementService.predict(selectedLoanId);
      setPredictionResult(result);
      setSuccess('Settlement payoff model computed successfully!');
      await fetchHistory(skip);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to predict settlement target. Ensure your monthly budget (income/expenses) is configured.');
    } finally {
      setPredicting(false);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return { bg: 'rgba(236, 72, 153, 0.12)', text: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.25)' };
      case 'high': return { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.25)' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.25)' };
      default: return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981', border: '1px solid rgba(16, 185, 129, 0.25)' };
    }
  };

  const selectedLoan = loans.find(l => l.id.toString() === selectedLoanId);

  // Client-side search and paginate history
  const filteredHistory = historyRecords.filter(r => 
    r.loan_id.toString().includes(searchQuery) ||
    r.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.risk_category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const paginatedHistory = filteredHistory.slice(skip, skip + limit);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>
          Settlement Prediction Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Run statistical simulations to model the lowest lump-sum payoff amount creditors are likely to accept.
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
          <ShieldAlert size={18} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }} className="dashboard-content-columns">
        
        {/* Left Column: Form setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--accent-cyan)" />
              Payoff Simulation
            </h3>

            {loans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                <AlertCircle size={32} style={{ opacity: 0.1, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.9rem' }}>No loans found in your account.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Please register a loan in the Debt Ledger first.</p>
              </div>
            ) : (
              <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Loan Account</label>
                  <select
                    className="form-input"
                    value={selectedLoanId}
                    onChange={(e) => {
                      setSelectedLoanId(e.target.value);
                      setPredictionResult(null);
                    }}
                  >
                    {loans.map(l => (
                      <option key={l.id} value={l.id} style={{ background: '#0B0F19' }}>
                        {l.lender_name} - ${l.outstanding_amount?.toLocaleString()} ({LOAN_TYPES[l.loan_type]})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLoan && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Current Balance:</span>
                      <strong style={{ color: '#FFF' }}>${selectedLoan.outstanding_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Interest Rate:</span>
                      <strong style={{ color: '#FFF' }}>{selectedLoan.interest_rate}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Overdue Duration:</span>
                      <strong style={{ color: selectedLoan.overdue_months > 0 ? 'var(--accent-rose)' : '#FFF' }}>{selectedLoan.overdue_months} Months</strong>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  disabled={predicting}
                >
                  {predicting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> Run Simulation...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Compute Settlement Payoff
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Output Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '345px' }}>
            {predictionResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#FFF' }}>
                    Payoff Simulation Results
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Target parameters optimized for {predictionResult.lender_name}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(6, 182, 212, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recommended Payoff</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>
                      ${predictionResult.recommended_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      ({predictionResult.recommended_percentage}% of total balance)
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Negotiation Priority</span>
                    <div>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'inline-block',
                        ...getPriorityStyle(predictionResult.priority)
                      }}>
                        {predictionResult.priority}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lender Litigation Risk</span>
                    <div>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'inline-block',
                        ...getPriorityStyle(predictionResult.risk_category)
                      }}>
                        {predictionResult.risk_category}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <h5 style={{ color: '#FFF', fontWeight: 600, marginBottom: '0.5rem' }}>AI Strategy Playbook Summary</h5>
                  <p>{predictionResult.strategy_text}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', textAlign: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
                <ShieldAlert size={48} style={{ opacity: 0.1 }} />
                <div>
                  <h4 style={{ color: '#FFF', fontWeight: 600 }}>Compute Payoff Metrics</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', maxWidth: '350px' }}>
                    Select a registered loan account and tap the run simulation button to estimate optimization targets.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* History section */}
      {historyRecords.length > 0 && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} color="var(--primary-hover)" />
              Simulation Run History Logs
            </h3>
            <div style={{ position: 'relative', width: '100%', maxWidth: '250px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Filter history..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSkip(0); }}
                style={{ paddingLeft: '2.2rem', paddingRight: '0.8rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {paginatedHistory.map((record) => (
              <div key={record.id} style={{
                background: 'rgba(255,255,255,0.01)',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    <span>{new Date(record.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Loan ID:</span>{' '}
                    <strong style={{ color: '#FFF' }}>{record.loan_id}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Payoff Target:</span>{' '}
                    <strong style={{ color: 'var(--accent-cyan)' }}>${record.recommended_amount?.toLocaleString()} ({record.recommended_percentage}%)</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    ...getPriorityStyle(record.priority)
                  }}>
                    {record.priority} Priority
                  </span>
                  <span style={{
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    ...getPriorityStyle(record.risk_category)
                  }}>
                    {record.risk_category} Risk
                  </span>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.5rem' }}
                    onClick={() => {
                      setPredictionResult(record);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Load Results
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredHistory.length > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem' }}
                disabled={skip === 0}
                onClick={() => setSkip(prev => Math.max(0, prev - limit))}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing {skip + 1} - {Math.min(skip + limit, filteredHistory.length)} of {filteredHistory.length}
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem' }}
                disabled={skip + limit >= filteredHistory.length}
                onClick={() => setSkip(prev => prev + limit)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
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

export default SettlementPredictor;
