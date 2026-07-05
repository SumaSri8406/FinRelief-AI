import React, { useState, useEffect } from 'react';
import { loanService, aiService } from '../services/api';
import { Sparkles, FileText, Copy, Download, AlertCircle, RefreshCw, Info } from 'lucide-react';

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'home', label: 'Home Loan' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'student', label: 'Student Loan' },
  { value: 'business', label: 'Business Loan' }
];

export const NegotiationEmailGenerator = () => {
  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Form State
  const [borrowerName, setBorrowerName] = useState('');
  const [lenderName, setLenderName] = useState('');
  const [loanType, setLoanType] = useState('personal');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [proposedSettlement, setProposedSettlement] = useState('');
  const [overdueMonths, setOverdueMonths] = useState('');
  const [reason, setReason] = useState('job loss and medical emergency');

  // Result state
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  const [modelUsed, setModelUsed] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      setLoadingLoans(true);
      try {
        const res = await loanService.list();
        setLoans(res.loans || []);
        if (res.loans && res.loans.length > 0) {
          const l = res.loans[0];
          setLenderName(l.lender_name);
          setLoanType(l.loan_type);
          setOutstandingAmount(l.outstanding_amount.toString());
          setProposedSettlement((Math.round(l.outstanding_amount * 0.45)).toString());
          setOverdueMonths(l.overdue_months.toString());
        }
      } catch (err) {
        console.log("Could not preload loan details.", err.message);
      } finally {
        setLoadingLoans(false);
      }
    };
    fetchLoans();
  }, []);

  const handlePrefill = (e) => {
    const loanId = parseInt(e.target.value);
    const selected = loans.find(l => l.id === loanId);
    if (selected) {
      setLenderName(selected.lender_name);
      setLoanType(selected.loan_type);
      setOutstandingAmount(selected.outstanding_amount.toString());
      setProposedSettlement((Math.round(selected.outstanding_amount * 0.45)).toString());
      setOverdueMonths(selected.overdue_months.toString());
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (!borrowerName.trim() || !lenderName.trim() || !outstandingAmount || !proposedSettlement) {
      setError('Please fill in all required fields (Borrower, Lender, Balance, and Settlement target).');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess('');
    setGeneratedLetter('');
    try {
      const payload = {
        borrower_name: borrowerName.trim(),
        lender_name: lenderName.trim(),
        loan_type: loanType,
        outstanding_amount: parseFloat(outstandingAmount),
        proposed_settlement_amount: parseFloat(proposedSettlement),
        overdue_months: parseInt(overdueMonths || 0),
        reason: reason.trim()
      };
      const res = await aiService.generateLetter(payload);
      setGeneratedLetter(res.letter);
      setIsFallback(res.is_fallback);
      setModelUsed(res.model_used || 'Gemini 3.5 Flash');
      setSuccess('Negotiation letter composed successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to compose negotiation letter. Verify backend service.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${lenderName.replace(/\s+/g, '_')}_hardship_settlement_letter.txt`;
    document.body.appendChild(element);
    element.click();
    setSuccess('Hardship letter downloaded successfully.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>
          AI Hardship Letter & Negotiation Composed
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Draft legally compliant negotiation emails detailing your financial hardships and lump-sum settlement offers.
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
          <AlertCircle size={18} color="#10B981" />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }} className="dashboard-content-columns">
        
        {/* Left Column: Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--primary-hover)" />
              Letter Architect
            </h3>

            {loans.length > 0 && (
              <div className="form-group">
                <label className="form-label">Pre-fill from Registered Loan</label>
                <select className="form-input" onChange={handlePrefill} defaultValue="" style={{ fontSize: '0.875rem' }}>
                  <option value="" disabled style={{ background: '#0B0F19' }}>-- Select account --</option>
                  {loans.map(l => (
                    <option key={l.id} value={l.id} style={{ background: '#0B0F19' }}>
                      {l.lender_name} (${l.outstanding_amount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="form-group">
                <label className="form-label">Borrower Name (Your Name)*</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Lender Name*</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Citibank"
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Outstanding Balance ($)*</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 5000"
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Proposed Settlement ($)*</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 2250"
                    value={proposedSettlement}
                    onChange={(e) => setProposedSettlement(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Overdue Months</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 3"
                    value={overdueMonths}
                    onChange={(e) => setOverdueMonths(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Loan Classification</label>
                <select className="form-input" value={loanType} onChange={(e) => setLoanType(e.target.value)}>
                  {LOAN_TYPES.map(t => (
                    <option key={t.value} value={t.value} style={{ background: '#0B0F19' }}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Hardship</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="e.g. loss of employment, emergency medical expenses, income reduction..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={generating}>
                {generating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Composing Letter...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Compose Hardship Proposal
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Output result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '445px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF' }}>
                  AI Hardship Document Output
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Draft is styled for immediate email delivery or formal post
                </span>
              </div>
              {generatedLetter && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleCopy}>
                    <Copy size={14} /> Copy
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleDownload}>
                    <Download size={14} /> Save
                  </button>
                </div>
              )}
            </div>

            {generatedLetter ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
                <textarea
                  className="form-input"
                  style={{
                    flexGrow: 1,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    height: '350px',
                    resize: 'none'
                  }}
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                />

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: isFallback ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                  border: isFallback ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  fontSize: '0.8rem',
                  color: isFallback ? '#F59E0B' : '#10B981'
                }}>
                  <Info size={16} />
                  <span>
                    {isFallback 
                      ? 'Notice: Local fallback template used. Google Gemini was unavailable.' 
                      : `Successfully synthesized. Model utilized: ${modelUsed}`}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--text-muted)', gap: '1rem', textAlign: 'center' }}>
                <FileText size={48} style={{ opacity: 0.1 }} />
                <div>
                  <h4 style={{ color: '#FFF', fontWeight: 600 }}>No Hardship Letter Drafted</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', maxWidth: '350px' }}>
                    Configure the borrower parameters on the left builder panel and click compose to generate proposal.
                  </p>
                </div>
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

export default NegotiationEmailGenerator;
