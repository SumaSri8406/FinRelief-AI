import React, { useState, useEffect } from 'react';
import { loanService, aiService } from '../services/api';
import { Sparkles, FileText, History, Copy, Download, AlertCircle, HelpCircle } from 'lucide-react';

const LOAN_TYPES = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'home', label: 'Home Loan' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'student', label: 'Student Loan' },
  { value: 'business', label: 'Business Loan' }
];

export const RecoveryPlans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState('strategy'); // 'strategy' or 'letter'

  // Strategy Form State
  const [stratIncome, setStratIncome] = useState('');
  const [stratExpenses, setStratExpenses] = useState('');
  const [stratAmount, setStratAmount] = useState('');
  const [stratType, setStratType] = useState('personal');
  const [stratOverdue, setStratOverdue] = useState('');
  const [stratRate, setStratRate] = useState('');
  const [stratLender, setStratLender] = useState('');
  const [generatedStrategy, setGeneratedStrategy] = useState('');
  const [stratFallback, setStratFallback] = useState(false);

  // Letter Form State
  const [letBorrower, setLetBorrower] = useState('');
  const [letLender, setLetLender] = useState('');
  const [letType, setLetType] = useState('personal');
  const [letAmount, setLetAmount] = useState('');
  const [letSettlement, setLetSettlement] = useState('');
  const [letOverdue, setLetOverdue] = useState('');
  const [letReason, setLetReason] = useState('job loss and medical emergency');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [letFallback, setLetFallback] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const userLoans = await loanService.list();
        setLoans(userLoans.loans || []);
        
        // Try to pull default details from active loans
        if (userLoans.loans && userLoans.loans.length > 0) {
          const firstLoan = userLoans.loans[0];
          setStratAmount(firstLoan.outstanding_amount.toString());
          setStratType(firstLoan.loan_type);
          setStratOverdue(firstLoan.overdue_months.toString());
          setStratRate(firstLoan.interest_rate.toString());
          setStratLender(firstLoan.lender_name);

          setLetLender(firstLoan.lender_name);
          setLetType(firstLoan.loan_type);
          setLetAmount(firstLoan.outstanding_amount.toString());
          setLetOverdue(firstLoan.overdue_months.toString());
        }

        const hist = await aiService.getHistory();
        setAiHistory(hist.records || []);
      } catch (err) {
        console.log("Could not load initial loan context or AI history.");
      }
    };
    initData();
  }, []);

  const handleSelectLoanForStrategy = (e) => {
    const loanId = parseInt(e.target.value);
    const selected = loans.find(l => l.id === loanId);
    if (selected) {
      setStratAmount(selected.outstanding_amount.toString());
      setStratType(selected.loan_type);
      setStratOverdue(selected.overdue_months.toString());
      setStratRate(selected.interest_rate.toString());
      setStratLender(selected.lender_name);
    }
  };

  const handleSelectLoanForLetter = (e) => {
    const loanId = parseInt(e.target.value);
    const selected = loans.find(l => l.id === loanId);
    if (selected) {
      setLetLender(selected.lender_name);
      setLetType(selected.loan_type);
      setLetAmount(selected.outstanding_amount.toString());
      setLetOverdue(selected.overdue_months.toString());
    }
  };

  const handleGenerateStrategy = async (e) => {
    e.preventDefault();
    if (!stratIncome || !stratExpenses || !stratAmount || !stratLender) {
      setError('Please fill in all required fields (Income, Expenses, Outstanding Amount, and Lender).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await aiService.generateStrategy({
        monthly_income: stratIncome,
        monthly_expenses: stratExpenses,
        outstanding_amount: stratAmount,
        loan_type: stratType,
        overdue_months: stratOverdue,
        interest_rate: stratRate,
        lender_name: stratLender
      });
      setGeneratedStrategy(data.strategy);
      setStratFallback(data.is_fallback);
      setSuccess('AI Strategy playbook generated successfully!');
      
      // Refresh history
      const hist = await aiService.getHistory();
      setAiHistory(hist.records || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate negotiation strategy.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLetter = async (e) => {
    e.preventDefault();
    if (!letBorrower || !letLender || !letAmount || !letSettlement) {
      setError('Please fill in all required fields (Borrower, Lender, Outstanding Amount, and Settlement Target).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await aiService.generateLetter({
        borrower_name: letBorrower,
        lender_name: letLender,
        loan_type: letType,
        outstanding_amount: letAmount,
        proposed_settlement_amount: letSettlement,
        overdue_months: letOverdue,
        reason: letReason
      });
      setGeneratedLetter(data.letter);
      setLetFallback(data.is_fallback);
      setSuccess('AI Settlement proposal letter generated successfully!');

      // Refresh history
      const hist = await aiService.getHistory();
      setAiHistory(hist.records || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate proposal letter.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Content copied to clipboard.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDownloadTxt = (text, filename) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    setSuccess('File download initialized.');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header section */}
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.5rem'
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>
          AI Recovery Plans & Document Generator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Construct custom tactical debt negotiation playbooks and draft legally aligned creditor hardship letters.
        </p>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'strategy' ? '2px solid var(--primary-hover)' : '2px solid transparent',
            color: activeTab === 'strategy' ? '#FFF' : 'var(--text-secondary)',
            padding: '0.75rem 1rem',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onClick={() => { setActiveTab('strategy'); setError(''); setSuccess(''); }}
        >
          <Sparkles size={18} color={activeTab === 'strategy' ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
          Negotiation Playbook
        </button>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'letter' ? '2px solid var(--primary-hover)' : '2px solid transparent',
            color: activeTab === 'letter' ? '#FFF' : 'var(--text-secondary)',
            padding: '0.75rem 1rem',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onClick={() => { setActiveTab('letter'); setError(''); setSuccess(''); }}
        >
          <FileText size={18} color={activeTab === 'letter' ? 'var(--accent-rose)' : 'var(--text-secondary)'} />
          Hardship Proposal Letter
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

      {/* Main interactive segment */}
      {activeTab === 'strategy' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }} className="dashboard-content-columns">
          {/* Left Column: Strategy Form */}
          <div className="glass-card" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1.25rem' }}>
              Strategy Architect
            </h3>

            {loans.length > 0 && (
              <div className="form-group">
                <label className="form-label">Pre-fill from Registered Loan</label>
                <select className="form-input" onChange={handleSelectLoanForStrategy} defaultValue="">
                  <option value="" disabled style={{ background: '#0B0F19' }}>-- Select a loan --</option>
                  {loans.map(l => (
                    <option key={l.id} value={l.id} style={{ background: '#0B0F19' }}>
                      {l.lender_name} (${l.outstanding_amount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleGenerateStrategy} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Monthly Income ($)*</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Income"
                    value={stratIncome}
                    onChange={(e) => setStratIncome(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Expenses ($)*</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Expenses"
                    value={stratExpenses}
                    onChange={(e) => setStratExpenses(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Outstanding ($)*</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Balance"
                    value={stratAmount}
                    onChange={(e) => setStratAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Lender Name*</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Citibank"
                    value={stratLender}
                    onChange={(e) => setStratLender(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Interest Rate (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Rate"
                    value={stratRate}
                    onChange={(e) => setStratRate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Overdue Months</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Overdue"
                    value={stratOverdue}
                    onChange={(e) => setStratOverdue(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Loan Type</label>
                <select className="form-input" value={stratType} onChange={(e) => setStratType(e.target.value)}>
                  {LOAN_TYPES.map(t => (
                    <option key={t.value} value={t.value} style={{ background: '#0B0F19' }}>{t.label}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Synthesizing...' : 'Generate Playbook'}
              </button>
            </form>
          </div>

          {/* Right Column: Strategy Output */}
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF' }}>
                AI Strategy Output Playbook
              </h3>
              {generatedStrategy && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleCopyToClipboard(generatedStrategy)}>
                    <Copy size={14} /> Copy
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleDownloadTxt(generatedStrategy, 'negotiation_strategy.txt')}>
                    <Download size={14} /> Save
                  </button>
                </div>
              )}
            </div>

            {generatedStrategy ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-line',
                  fontFamily: 'monospace'
                }}>
                  {generatedStrategy}
                </div>
                {stratFallback && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#F59E0B'
                  }}>
                    <AlertCircle size={16} />
                    <span>Rule-based fallback parameters applied. Playbook generated locally.</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
                minHeight: '280px',
                border: '1px dashed var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '2rem'
              }}>
                <Sparkles size={36} color="rgba(255,255,255,0.03)" style={{ marginBottom: '1rem' }} />
                <p style={{ fontWeight: 500 }}>No Playbook Generated</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Configure parameters in the strategy architect and click "Generate Playbook".</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }} className="dashboard-content-columns">
          {/* Left Column: Letter Form */}
          <div className="glass-card" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1.25rem' }}>
              Hardship Letter Setup
            </h3>

            {loans.length > 0 && (
              <div className="form-group">
                <label className="form-label">Pre-fill from Registered Loan</label>
                <select className="form-input" onChange={handleSelectLoanForLetter} defaultValue="">
                  <option value="" disabled style={{ background: '#0B0F19' }}>-- Select a loan --</option>
                  {loans.map(l => (
                    <option key={l.id} value={l.id} style={{ background: '#0B0F19' }}>
                      {l.lender_name} (${l.outstanding_amount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleGenerateLetter} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Your Name (Borrower)*</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={letBorrower}
                  onChange={(e) => setLetBorrower(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Lender Name*</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chase Bank"
                    value={letLender}
                    onChange={(e) => setLetLender(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Outstanding ($)*</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Outstanding Balance"
                    value={letAmount}
                    onChange={(e) => setLetAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Settlement Target ($)*</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Target Settlement"
                    value={letSettlement}
                    onChange={(e) => setLetSettlement(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Overdue Months</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 3"
                    value={letOverdue}
                    onChange={(e) => setLetOverdue(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Loan Type</label>
                <select className="form-input" value={letType} onChange={(e) => setLetType(e.target.value)}>
                  {LOAN_TYPES.map(t => (
                    <option key={t.value} value={t.value} style={{ background: '#0B0F19' }}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Reason for Hardship</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Describe your job loss, medical bills, or general financial crisis..."
                  value={letReason}
                  onChange={(e) => setLetReason(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Composing...' : 'Draft Hardship Letter'}
              </button>
            </form>
          </div>

          {/* Right Column: Letter Output */}
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF' }}>
                AI Generated Settlement Letter
              </h3>
              {generatedLetter && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleCopyToClipboard(generatedLetter)}>
                    <Copy size={14} /> Copy
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleDownloadTxt(generatedLetter, 'hardship_settlement_letter.txt')}>
                    <Download size={14} /> Save
                  </button>
                </div>
              )}
            </div>

            {generatedLetter ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-line',
                  fontFamily: 'monospace'
                }}>
                  {generatedLetter}
                </div>
                {letFallback && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#F59E0B'
                  }}>
                    <AlertCircle size={16} />
                    <span>Rule-based fallback parameters applied. Letter drafted locally.</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
                minHeight: '280px',
                border: '1px dashed var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '2rem'
              }}>
                <FileText size={36} color="rgba(255,255,255,0.03)" style={{ marginBottom: '1rem' }} />
                <p style={{ fontWeight: 500 }}>No Letter Generated</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Configure details in the hardship builder and click "Draft Hardship Letter".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI History Logs */}
      {aiHistory.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--primary-hover)" />
            AI Document History Logs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {aiHistory.slice(0, 5).map((record) => (
              <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div>
                  <span style={{
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginRight: '0.75rem',
                    background: record.request_type === 'strategy' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                    color: record.request_type === 'strategy' ? 'var(--primary-hover)' : 'var(--accent-rose)',
                    border: record.request_type === 'strategy' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(236, 72, 153, 0.2)'
                  }}>
                    {record.request_type}
                  </span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>{record.prompt_summary}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>
                    {new Date(record.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                    onClick={() => {
                      if (record.request_type === 'strategy') {
                        setActiveTab('strategy');
                        setGeneratedStrategy(record.response_text);
                        setStratFallback(record.is_fallback);
                      } else {
                        setActiveTab('letter');
                        setGeneratedLetter(record.response_text);
                        setLetFallback(record.is_fallback);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    View Output
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

export default RecoveryPlans;
