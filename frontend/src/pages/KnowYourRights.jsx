import React, { useState } from 'react';
import { BookOpen, AlertCircle, ChevronDown, ChevronUp, CheckCircle, Scale, Milestone, FileText, Copy } from 'lucide-react';

export const KnowYourRights = () => {
  const [openSection, setOpenSection] = useState(0);
  const [success, setSuccess] = useState('');

  const toggleSection = (idx) => {
    setOpenSection(openSection === idx ? null : idx);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Dispute template copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const sections = [
    {
      icon: Scale,
      title: "Fair Debt Collection Practices Act (FDCPA) Rights",
      color: "var(--accent-cyan)",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: 1.6, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p>
            The **Fair Debt Collection Practices Act (FDCPA)** is a federal law that limits what debt collectors can do when collecting a debt. It protects consumers from abusive, deceptive, and unfair collection behaviors.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="grid-responsive">
            <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '1rem', borderRadius: '10px' }}>
              <h5 style={{ color: '#EF4444', fontWeight: 600, marginBottom: '0.5rem' }}>❌ Prohibited Harassment Practices</h5>
              <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                <li>Calling outside of 8:00 AM – 9:00 PM local time.</li>
                <li>Continuing calls at work if told your employer bans them.</li>
                <li>Threatening arrest, lawsuits (unless planned), or physical harm.</li>
                <li>Using profane language or publishing your name.</li>
                <li>Contacting third parties (except to find your location).</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '1rem', borderRadius: '10px' }}>
              <h5 style={{ color: '#10B981', fontWeight: 600, marginBottom: '0.5rem' }}>✔ Your Legal Action Rights</h5>
              <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                <li><strong>Right to Validate:</strong> Request debt details in writing within 30 days of first contact.</li>
                <li><strong>Cease & Desist:</strong> Write a letter instructing them to stop contacting you.</li>
                <li><strong>Report Violations:</strong> Report collection abuses to FTC and CFPB.</li>
                <li><strong>Dispute:</strong> Formally dispute incorrect claims to stop collections until validated.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Milestone,
      title: "Debt Repayment Strategies: Snowball vs. Avalanche",
      color: "var(--primary-hover)",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: 1.6, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p>
            Tackling debt systematically accelerates your payoff journey. Choose the strategy that aligns best with your budget structure and psychological milestones:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="grid-responsive">
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
              <h4 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.5rem' }}>1. The Debt Snowball Method</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                List your debts from **smallest balance to largest balance**, ignoring interest rates. Put all surplus income toward paying off the smallest debt first, while paying minimums on others. When a debt is cleared, roll its payment into the next smallest.
              </p>
              <strong style={{ fontSize: '0.75rem', color: '#10B981' }}>✔ BEST FOR: Psychological wins, motivation, and clearing total number of bills quickly.</strong>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
              <h4 style={{ color: 'var(--accent-rose)', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '0.5rem' }}>2. The Debt Avalanche Method</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                List your debts from **highest interest rate to lowest interest rate**, ignoring balance size. Direct your budget surplus to pay off the highest interest account first, maintaining minimums on others. When cleared, roll the payment into the next highest rate.
              </p>
              <strong style={{ fontSize: '0.75rem', color: '#10B981' }}>✔ BEST FOR: Saving money. Minimizes total interest paid over time and pays off debt faster mathematically.</strong>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: FileText,
      title: "Written Dispute Letter Templates",
      color: "var(--accent-rose)",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Use these pre-drafted legal templates to exercise your rights under the FDCPA. Copy the text, fill in your details, and send them via Certified Mail to establish a paper trail.
          </p>

          {/* Template 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ color: '#FFF', fontWeight: 600 }}>Template A: Debt Validation Request Letter</h5>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                onClick={() => handleCopy(`[Your Name]
[Your Address]
[Date]

[Debt Collection Agency Name]
[Debt Collection Agency Address]

Re: Account Number [Insert Account Number or Reference]

To Whom It May Concern,

I am writing in response to your collection notice dated [Notice Date] regarding the above-referenced account. Under Section 809 of the Fair Debt Collection Practices Act (FDCPA), I request that you provide verification and validation of this debt.

Please provide me with the following details in writing:
1. Proof that I have a legal obligation to pay this debt.
2. The complete transaction history and statement ledger showing all charges.
3. Verification of the original creditor and proof that you are licensed to collect in my state.

Please cease all collection activity until this debt is validated.

Sincerely,
[Your Name]`)}
              >
                <Copy size={12} /> Copy Template
              </button>
            </div>
            <pre style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
{`[Your Name]
[Your Address]
[Date]

[Debt Collection Agency Name]
[Debt Collection Agency Address]

Re: Account Number [Insert Account Number or Reference]

To Whom It May Concern,

I am writing in response to your collection notice dated [Notice Date] regarding the above-referenced account. Under Section 809 of the Fair Debt Collection Practices Act (FDCPA), I request that you provide verification and validation of this debt.

Please provide me with the following details in writing:
1. Proof that I have a legal obligation to pay this debt.
2. The complete transaction history and statement ledger showing all charges.
3. Verification of the original creditor and proof that you are licensed to collect in my state.

Please cease all collection activity until this debt is validated.

Sincerely,
[Your Name]`}
            </pre>
          </div>

          {/* Template 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ color: '#FFF', fontWeight: 600 }}>Template B: Cease & Desist (Stop Contact) Letter</h5>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                onClick={() => handleCopy(`[Your Name]
[Your Address]
[Date]

[Debt Collection Agency Name]
[Debt Collection Agency Address]

Re: Account Number [Insert Account Reference]

To Whom It May Concern,

Under Section 805(c) of the Fair Debt Collection Practices Act (FDCPA), I am writing to formally request that you cease all communication and contact regarding the above-referenced account.

This request applies to phone calls, emails, text messages, and written notices to me, my relatives, my neighbors, and my employer. All future communications must be routed exclusively to my legal counsel [or must cease entirely].

Sincerely,
[Your Name]`)}
              >
                <Copy size={12} /> Copy Template
              </button>
            </div>
            <pre style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
{`[Your Name]
[Your Address]
[Date]

[Debt Collection Agency Name]
[Debt Collection Agency Address]

Re: Account Number [Insert Account Reference]

To Whom It May Concern,

Under Section 805(c) of the Fair Debt Collection Practices Act (FDCPA), I am writing to formally request that you cease all communication and contact regarding the above-referenced account.

This request applies to phone calls, emails, text messages, and written notices to me, my relatives, my neighbors, and my employer. All future communications must be routed exclusively to my legal counsel [or must cease entirely].

Sincerely,
[Your Name]`}
            </pre>
          </div>

        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>
          Borrower Rights & Legal Library
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Equip yourself with legal guidelines, strategic payoff structures, and validated templates to dispute collection claims.
        </p>
      </div>

      {success && (
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Main accordion list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          const isOpen = openSection === idx;
          return (
            <div 
              key={idx} 
              className="glass-card" 
              style={{ 
                padding: '1.5rem', 
                cursor: 'pointer',
                borderLeft: `4px solid ${sec.color}`
              }}
              onClick={() => toggleSection(idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <Icon size={20} color={sec.color} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#FFF' }}>
                    {sec.title}
                  </h3>
                </div>
                {isOpen ? <ChevronDown size={20} color="var(--text-secondary)" style={{ transform: 'rotate(180deg)', transition: 'transform 0.2s' }} /> : <ChevronDown size={20} color="var(--text-secondary)" style={{ transition: 'transform 0.2s' }} />}
              </div>

              {isOpen && (
                <div 
                  className="animate-fade-in" 
                  style={{ marginTop: '1.5rem', cursor: 'default' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {sec.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empowerment Card */}
      <div className="glass-card" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: 'rgba(6, 182, 212, 0.1)',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(6, 182, 212, 0.2)'
        }}>
          <BookOpen size={28} color="var(--accent-cyan)" />
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            Empowerment Checklist
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
            Take back control by establishing written paper trails, disputing suspicious collection items, and keeping regular logs of lender letters and contacts.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>

    </div>
  );
};

export default KnowYourRights;
