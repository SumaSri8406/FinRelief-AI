import React, { useState, useEffect } from 'react';
import { loanService, settlementService } from '../services/api';
import { Plus, Edit2, Trash2, ShieldAlert, Sparkles, History, X, Check, TrendingDown, RefreshCw } from 'lucide-react';

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'home', label: 'Home Loan' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'student', label: 'Student Loan' },
  { value: 'business', label: 'Business Loan' }
];

const LOAN_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'settled', label: 'Settled' },
  { value: 'defaulted', label: 'Defaulted' }
];

export const DebtAnalysis = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [loanType, setLoanType] = useState('personal');
  const [lenderName, setLenderName] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');
  const [overdueMonths, setOverdueMonths] = useState('');
  const [loanStatus, setLoanStatus] = useState('active');

  // Prediction State
  const [predictions, setPredictions] = useState({});
  const [predLoading, setPredLoading] = useState({});
  const [predictionHistory, setPredictionHistory] = useState([]);

  const fetchLoansAndHistory = async () => {
    setLoading(true);
    try {
      const res = await loanService.list();
      setLoans(res.loans || []);
      const hist = await settlementService.getHistory();
      setPredictionHistory(hist.records || []);
    } catch (err) {
      setError('Failed to fetch data from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoansAndHistory();
  }, []);

  const openAddModal = () => {
    setEditingLoanId(null);
    setLoanType('personal');
    setLenderName('');
    setOriginalAmount('');
    setOutstandingAmount('');
    setInterestRate('');
    setEmiAmount('');
    setTenureMonths('');
    setOverdueMonths('');
    setLoanStatus('active');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (loan) => {
    setEditingLoanId(loan.id);
    setLoanType(loan.loan_type);
    setLenderName(loan.lender_name);
    setOriginalAmount(loan.original_amount.toString());
    setOutstandingAmount(loan.outstanding_amount.toString());
    setInterestRate(loan.interest_rate.toString());
    setEmiAmount(loan.emi_amount.toString());
    setTenureMonths(loan.tenure_months.toString());
    setOverdueMonths(loan.overdue_months.toString());
    setLoanStatus(loan.status);
    setError('');
    setShowModal(true);
  };

  const handleSaveLoan = async (e) => {
    e.preventDefault();
    if (!lenderName) {
      setError('Lender Name is required.');
      return;
    }
    if (parseFloat(originalAmount) <= 0 || parseFloat(outstandingAmount) < 0) {
      setError('Amounts must be non-negative.');
      return;
    }
    if (parseFloat(interestRate) < 0 || parseFloat(interestRate) > 100) {
      setError('Interest rate must be between 0 and 100.');
      return;
    }

    const payload = {
      loan_type: loanType,
      lender_name: lenderName,
      original_amount: parseFloat(originalAmount),
      outstanding_amount: parseFloat(outstandingAmount),
      interest_rate: parseFloat(interestRate),
      emi_amount: parseFloat(emiAmount || 0.0),
      tenure_months: parseInt(tenureMonths || 0),
      overdue_months: parseInt(overdueMonths || 0),
      status: loanStatus
    };

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editingLoanId) {
        await loanService.update(editingLoanId, payload);
        setSuccess('Loan details updated successfully.');
      } else {
        await loanService.create(payload);
        setSuccess('New loan record added successfully.');
      }
      setShowModal(false);
      fetchLoansAndHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save loan information.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan record?')) return;
    setLoading(true);
    try {
      await loanService.delete(id);
      setSuccess('Loan deleted successfully.');
      fetchLoansAndHistory();
    } catch (err) {
      setError('Failed to delete loan.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictSettlement = async (id) => {
    setPredLoading(prev => ({ ...prev, [id]: true }));
    setError('');
    try {
      const result = await settlementService.predict(id);
      setPredictions(prev => ({ ...prev, [id]: result }));
      // Refresh history
      const hist = await settlementService.getHistory();
      setPredictionHistory(hist.records || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to calculate settlement prediction. Make sure your income/expenses are set in Budget Tracker.');
    } finally {
      setPredLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return { bg: 'rgba(236, 72, 153, 0.1)', text: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.2)' };
      case 'high': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.2)' };
      default: return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' };
    }
  };

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
            Debt Ledger & Settlement Analysis
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Manage active loans, run settlement modeling simulations, and check payoff risk scores.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Loan Record
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#EF4444',
          padding: '1rem',
          borderRadius: '10px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          padding: '1rem',
          borderRadius: '10px',
          fontSize: '0.9rem'
        }}>
          {success}
        </div>
      )}

      {/* Loans Grid/Table */}
      <div className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1.25rem' }}>
          Registered Loan Portfolio
        </h3>

        {loans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <TrendingDown size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p>No loans registered yet.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Click "Add Loan Record" to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Lender / Type</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Outstanding / Original</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Rate</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Monthly EMI</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Overdue Months</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>Actions</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Settlement Simulation</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <React.Fragment key={loan.id}>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem', color: '#FFF' }}>
                      <td style={{ padding: '1.25rem 0.5rem' }}>
                        <div style={{ fontWeight: 600 }}>{loan.lender_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {loan.loan_type?.replace('_', ' ')}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem' }}>
                        <div style={{ fontWeight: 600 }}>${loan.outstanding_amount?.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          of ${loan.original_amount?.toLocaleString(undefined, {minimumFractionDigits:2})}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem' }}>{loan.interest_rate}%</td>
                      <td style={{ padding: '1.25rem 0.5rem' }}>${loan.emi_amount || '0'}</td>
                      <td style={{ padding: '1.25rem 0.5rem' }}>
                        <span style={{ color: loan.overdue_months > 0 ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                          {loan.overdue_months} mo
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: loan.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: loan.status === 'active' ? '#10B981' : '#EF4444',
                          border: loan.status === 'active' ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)',
                          textTransform: 'uppercase'
                        }}>
                          {loan.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openEditModal(loan)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
                            title="Edit Loan"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteLoan(loan.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                            title="Delete Loan"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => handlePredictSettlement(loan.id)}
                          disabled={predLoading[loan.id]}
                        >
                          {predLoading[loan.id] ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" /> Calculating...
                            </>
                          ) : (
                            <>
                              <Sparkles size={12} color="var(--accent-cyan)" /> Predict Settlement
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Simulated prediction results row */}
                    {predictions[loan.id] && (
                      <tr>
                        <td colSpan="8" style={{ padding: '0 0.5rem 1rem 0.5rem' }}>
                          <div className="glass-card animate-fade-in" style={{
                            padding: '1.25rem',
                            marginTop: '0.5rem',
                            background: 'rgba(99, 102, 241, 0.03)',
                            border: '1px solid rgba(99, 102, 241, 0.15)',
                            borderRadius: '10px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                              <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldAlert size={16} color="var(--accent-cyan)" />
                                Settlement Predictions for {predictions[loan.id].lender_name}
                              </h4>
                              <button
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                onClick={() => setPredictions(prev => {
                                  const updated = { ...prev };
                                  delete updated[loan.id];
                                  return updated;
                                })}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target Payoff Amount</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
                                  ${predictions[loan.id].recommended_amount?.toLocaleString(undefined, {minimumFractionDigits:2})}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  ({predictions[loan.id].recommended_percentage}% of total)
                                </div>
                              </div>

                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Prioritization Vector</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                  <span style={{
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    ...getPriorityStyle(predictions[loan.id].priority)
                                  }}>
                                    {predictions[loan.id].priority}
                                  </span>
                                </div>
                              </div>

                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Litigation Risk Rating</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                  <span style={{
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    ...getPriorityStyle(predictions[loan.id].risk_category)
                                  }}>
                                    {predictions[loan.id].risk_category}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {predictions[loan.id].strategy_text && (
                              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                <strong>AI Playbook Summary:</strong> {predictions[loan.id].strategy_text}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical logs */}
      {predictionHistory.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--primary-hover)" />
            Settlement Run History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {predictionHistory.slice(0, 5).map((record) => (
              <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>Loan ID {record.loan_id}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>
                    {new Date(record.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Settlement: </span>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>${record.recommended_amount?.toLocaleString()} ({record.recommended_percentage}%)</span>
                  </div>
                  <span style={{
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    ...getPriorityStyle(record.risk_category)
                  }}>
                    {record.risk_category} Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1000,
          background: 'rgba(7, 11, 19, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '550px',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#FFF', marginBottom: '1.5rem' }}>
              {editingLoanId ? 'Modify Loan Record' : 'Add Loan Record'}
            </h3>

            <form onSubmit={handleSaveLoan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Loan Type</label>
                  <select
                    className="form-input"
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                  >
                    {LOAN_TYPES.map(t => (
                      <option key={t.value} value={t.value} style={{ background: '#0B0F19' }}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Lender Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chase"
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Original Principal ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 10000"
                    value={originalAmount}
                    onChange={(e) => setOriginalAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Outstanding Balance ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 8500"
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 14.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Monthly EMI ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 350"
                    value={emiAmount}
                    onChange={(e) => setEmiAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Remaining Tenure (Months)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 24"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Overdue Tenure (Months)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 2"
                    value={overdueMonths}
                    onChange={(e) => setOverdueMonths(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Portfolio Status</label>
                <select
                  className="form-input"
                  value={loanStatus}
                  onChange={(e) => setLoanStatus(e.target.value)}
                >
                  {LOAN_STATUSES.map(s => (
                    <option key={s.value} value={s.value} style={{ background: '#0B0F19' }}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
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
      `}</style>

    </div>
  );
};

export default DebtAnalysis;
