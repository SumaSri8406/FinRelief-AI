import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loanService } from '../services/api';
import { Plus, Search, Edit2, Trash2, ShieldAlert, Sparkles, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';

const LOAN_TYPES = {
  personal: 'Personal Loan',
  home: 'Home Loan',
  auto: 'Auto Loan',
  credit_card: 'Credit Card',
  student: 'Student Loan',
  business: 'Business Loan'
};

// Frontend estimation matching backend settlement_engine logic
const estimateMetrics = (loan) => {
  const overdue = loan.overdue_months || 0;
  const rate = loan.interest_rate || 0;
  const original = loan.original_amount || 1;
  const outstanding = loan.outstanding_amount || 0;
  const ratio = (outstanding / original) * 100;

  // 1. Settlement % estimate
  let basePct = 70.0;
  const typeAdjustments = {
    credit_card: -15.0,
    personal: -10.0,
    business: -8.0,
    auto: -5.0,
    student: -3.0,
    home: 0.0,
  };
  basePct += typeAdjustments[loan.loan_type] || -5.0;
  if (rate > 30) basePct -= 10;
  else if (rate > 20) basePct -= 7;
  else if (rate > 15) basePct -= 4;

  if (overdue > 24) basePct -= 15;
  else if (overdue > 12) basePct -= 10;
  else if (overdue > 6) basePct -= 5;
  else if (overdue > 3) basePct -= 2;
  const settlementPct = Math.max(30.0, Math.min(90.0, basePct));

  // 2. Priority estimate
  let priority = "Low";
  if (overdue > 12) priority = "Critical";
  else if (overdue > 6) priority = "High";
  else if (overdue > 3) priority = "Medium";

  // 3. Risk estimate
  let riskScore = 0;
  if (overdue > 12) riskScore += 3;
  else if (overdue > 6) riskScore += 2;
  else if (overdue > 3) riskScore += 1;

  if (rate > 25) riskScore += 2;
  else if (rate > 15) riskScore += 1;

  if (ratio > 80) riskScore += 2;
  else if (ratio > 50) riskScore += 1;

  let risk = "Low";
  if (riskScore >= 6) risk = "Critical";
  else if (riskScore >= 4) risk = "High";
  else if (riskScore >= 2) risk = "Moderate";

  return { settlementPct, priority, risk };
};

export const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await loanService.list();
      setLoans(res.loans || []);
    } catch (err) {
      console.error(err.message);
      setError('Could not retrieve loans. Please verify backend service connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the loan from ${name}?`)) return;
    try {
      await loanService.delete(id);
      setSuccess('Loan details removed successfully.');
      setLoans(prev => prev.filter(l => l.id !== id));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete the loan.');
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

  const filteredLoans = loans.filter(l => 
    l.lender_name.toLowerCase().includes(search.toLowerCase()) ||
    LOAN_TYPES[l.loan_type]?.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = loans.reduce((acc, l) => acc + l.outstanding_amount, 0);
  const totalOriginal = loans.reduce((acc, l) => acc + l.original_amount, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
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
            Debt Ledger & Loan Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Register your liability contracts, inspect payoff progress, and analyze settlement potentials.
          </p>
        </div>
        <Link to="/dashboard/loans/add" className="btn btn-primary">
          <Plus size={16} /> Add Loan Record
        </Link>
      </div>

      {/* Notifications */}
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

      {/* Stats Overview */}
      {loans.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Registered Debts</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFF', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
              {loans.length}
            </h3>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Outstanding balance</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-rose)', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
              ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Paid Off Ratio</span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981', marginTop: '0.25rem', fontFamily: 'var(--font-display)' }}>
              {totalOriginal > 0 ? Math.round((1 - (totalOutstanding / totalOriginal)) * 100) : 0}%
            </h3>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF' }}>
            Registered Loan Portfolio
          </h3>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by lender/type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={36} className="animate-spin" />
            <span>Loading registered accounts...</span>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <TrendingDown size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, color: '#FFF' }}>No active loans registered.</p>
            {search ? (
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No loans match "{search}". Try another filter term.</p>
            ) : (
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Click "Add Loan Record" to populate your ledger contracts.</p>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '1rem 0.5rem' }}>Lender / Type</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Outstanding Balance</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Interest Rate</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Overdue Months</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>Settlement %</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>Priority</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>Risk Rating</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => {
                  const { settlementPct, priority, risk } = estimateMetrics(loan);
                  return (
                    <tr key={loan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem', color: '#FFF' }}>
                      <td style={{ padding: '1.25rem 0.5rem' }}>
                        <div style={{ fontWeight: 600 }}>{loan.lender_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {LOAN_TYPES[loan.loan_type] || loan.loan_type}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem' }}>
                        <div style={{ fontWeight: 600 }}>${loan.outstanding_amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          of ${loan.original_amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem' }}>{loan.interest_rate}%</td>
                      <td style={{ padding: '1.25rem 0.5rem' }}>
                        <span style={{ color: loan.overdue_months > 0 ? 'var(--accent-rose)' : 'var(--text-secondary)', fontWeight: loan.overdue_months > 0 ? 600 : 400 }}>
                          {loan.overdue_months} mo
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem', textAlign: 'center', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        {settlementPct}%
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          ...getPriorityStyle(priority)
                        }}>
                          {priority}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          ...getPriorityStyle(risk)
                        }}>
                          {risk}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: loan.status === 'active' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                          color: loan.status === 'active' ? '#10B981' : 'var(--text-secondary)',
                          border: loan.status === 'active' ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid var(--border-color)',
                          textTransform: 'uppercase'
                        }}>
                          {loan.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => navigate(`/dashboard/settlement-predictor`, { state: { prefilledLoanId: loan.id } })}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.25rem', color: 'var(--accent-cyan)', borderColor: 'rgba(6, 182, 212, 0.2)' }}
                          >
                            <Sparkles size={12} /> Predict
                          </button>
                          <Link
                            to={`/dashboard/loans/edit/${loan.id}`}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem', border: 'none', color: 'var(--text-secondary)' }}
                            title="Edit details"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(loan.id, loan.lender_name)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem', border: 'none', color: 'var(--text-muted)' }}
                            title="Delete loan"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default LoanManagement;
