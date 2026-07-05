import React, { useState } from 'react';
import { BookOpen, AlertCircle, ChevronDown, ChevronUp, CheckCircle, Scale, Milestone } from 'lucide-react';

export const FinancialLibrary = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (idx) => {
    setOpenSection(openSection === idx ? null : idx);
  };

  const guides = [
    {
      icon: Milestone,
      title: "Debt Repayment Strategies: Snowball vs. Avalanche",
      color: "var(--primary-hover)",
      content: (
        <div>
          <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
            When tackling multiple debts, choosing a structured method can save you thousands in interest and keep you motivated. The two most popular methods are:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }} className="dashboard-content-columns">
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h5 style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.5rem' }}>1. The Debt Snowball Method</h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                List your debts from **smallest balance to largest balance**, regardless of interest rate. Pay the minimum on all other debts and throw all extra cash at the smallest debt. Once paid off, roll that entire payment amount into the next smallest.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '0.5rem', fontWeight: 500 }}>
                ✔ Best for psychological wins and immediate momentum.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h5 style={{ color: 'var(--accent-rose)', fontWeight: 600, marginBottom: '0.5rem' }}>2. The Debt Avalanche Method</h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                List your debts from **highest interest rate to lowest interest rate**, regardless of balance. Pay the minimums on all, and put all excess funds towards the highest interest debt first. Once paid off, roll the payment into the next highest rate debt.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '0.5rem', fontWeight: 500 }}>
                ✔ Best for mathematical optimization, saving the most interest money.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Scale,
      title: "Understanding Creditor Legal Rights & Collection Guidelines",
      color: "var(--accent-cyan)",
      content: (
        <div>
          <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
            Under the **Fair Debt Collection Practices Act (FDCPA)**, you are protected against abusive, unfair, or deceptive debt collection practices. Keep these key legal protections in mind:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <li><strong>Time limits:</strong> Collectors cannot contact you before 8 a.m. or after 9 p.m., unless you agree to it.</li>
            <li><strong>Harassment:</strong> Collectors cannot threaten violence, use profane language, or repeatedly call to annoy you.</li>
            <li><strong>Workplace Contact:</strong> Collectors cannot call you at work if they know your employer prohibits it.</li>
            <li><strong>Written Validation:</strong> Within 5 days of contacting you, a collector must send you a written "validation notice" telling you how much you owe and the creditor name.</li>
            <li><strong>Disputing:</strong> If you send a written dispute within 30 days of receiving the validation notice, the collector must stop trying to collect until they verify the debt.</li>
          </ul>
        </div>
      )
    },
    {
      icon: AlertCircle,
      title: "Tactical Tips for Successful Settlement Negotiation",
      color: "var(--accent-rose)",
      content: (
        <div>
          <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
            Lenders and collection agencies are often willing to settle an account for a fraction of what you owe, particularly if the account is several months past due. Here is how to negotiate effectively:
          </p>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <li><strong>Know your target:</strong> Aim to start your offer at 25%-30% of the outstanding balance, with the goal of settling between 40% and 50%.</li>
            <li><strong>Demonstrate hardship:</strong> Highlight your financial challenges (job loss, medical expenses, divorce) to explain why you cannot make full payments.</li>
            <li><strong>Get it in writing:</strong> **NEVER** pay a penny until you receive a signed settlement agreement letter stating that the payment settles the account in full.</li>
            <li><strong>Avoid automated bank drafts:</strong> Pay with a cashier's check or one-time prepaid card to prevent collectors from unauthorized withdrawals.</li>
          </ol>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header section */}
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.5rem'
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>
          Financial Recovery Library
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Equip yourself with validated legal protections, debt prioritization rules, and negotiation guidelines.
        </p>
      </div>

      {/* Main library list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {guides.map((g, idx) => {
          const Icon = g.icon;
          const isOpen = openSection === idx;
          return (
            <div 
              key={idx} 
              className="glass-card" 
              style={{ 
                padding: '1.5rem', 
                cursor: 'pointer',
                borderLeft: `4px solid ${g.color}`
              }}
              onClick={() => toggleSection(idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <Icon size={20} color={g.color} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#FFF' }}>
                    {g.title}
                  </h3>
                </div>
                {isOpen ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
              </div>

              {isOpen && (
                <div 
                  className="animate-fade-in" 
                  style={{ marginTop: '1.5rem', cursor: 'default' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {g.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Quiz Card */}
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
          background: 'rgba(16, 185, 129, 0.1)',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <CheckCircle size={28} color="#10B981" />
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
            Empowerment Checklist
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
            Take back control by writing validation letters, keeping written records of all communication, and staying on top of your budget surplus targets.
          </p>
        </div>
      </div>

    </div>
  );
};

export default FinancialLibrary;
