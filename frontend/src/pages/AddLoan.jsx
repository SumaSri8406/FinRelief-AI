import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../services/api';
import { ShieldAlert, ArrowLeft, Plus } from 'lucide-react';

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

export const AddLoan = () => {
  const [loanType, setLoanType] = useState('personal');
  const [lenderName, setLenderName] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');
  const [overdueMonths, setOverdueMonths] = useState('');
  const [loanStatus, setLoanStatus] = useState('active');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lenderName.trim()) {
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
      lender_name: lenderName.trim(),
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
    try {
      await loanService.create(payload);
      navigate('/dashboard/loans');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save loan information. Make sure all values are valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/dashboard/loans')} 
          className="btn btn-secondary" 
          style={{ padding: '0.5rem', border: 'none', borderRadius: '50%', width: '40px', height: '40px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#FFF' }}>
            Register New Debt
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Add another liability account to calculate stress scores and negotiation routes.
          </p>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Loan Classification</label>
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
                placeholder="e.g. Citibank"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Original Principal ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 15000"
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
                placeholder="e.g. 12500"
                value={outstandingAmount}
                onChange={(e) => setOutstandingAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Annual Interest Rate (%)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 18.9"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Monthly EMI Installment ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 450"
                value={emiAmount}
                onChange={(e) => setEmiAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Remaining Tenure (Months)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 36"
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
                placeholder="e.g. 4"
                value={overdueMonths}
                onChange={(e) => setOverdueMonths(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Status</label>
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

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => navigate('/dashboard/loans')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Creating Record...' : (
                <>
                  <Plus size={18} /> Add Loan
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        @media (max-width: 576px) {
          .form-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AddLoan;
