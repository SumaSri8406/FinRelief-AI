import React, { useState, useEffect } from 'react';
import { aiService } from '../services/api';
import { History, Calendar, Search, RefreshCw, AlertCircle, FileText, ChevronLeft, ChevronRight, X, Copy, Download } from 'lucide-react';

export const AIHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const limit = 6;

  // Modal display state
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiService.getHistory();
      setHistory(res.records || []);
    } catch (err) {
      setError('Could not retrieve AI generation logs from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Document copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDownload = (record) => {
    const element = document.createElement("a");
    const file = new Blob([record.response_text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${record.request_type}_${record.id}.txt`;
    document.body.appendChild(element);
    element.click();
    setSuccess('Document download initialized.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const filteredHistory = history.filter(r => 
    r.prompt_summary.toLowerCase().includes(search.toLowerCase()) ||
    r.request_type.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedHistory = filteredHistory.slice(skip, skip + limit);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: '#FFF' }}>
          AI Generation History Logs
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Inspect and recover past AI negotiation playbooks, hardship emails, and counselor recommendations.
        </p>
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
          <CheckCircle size={18} color="#10B981" />
          <span>{success}</span>
        </div>
      )}

      {/* History List card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--primary-hover)" />
            AI Logs History
          </h3>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search history by lender/type..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
              style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={36} className="animate-spin" />
            <span>Retrieving AI history records...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <History size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, color: '#FFF' }}>No AI generation logs found.</p>
            {search ? (
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No records match your search filter.</p>
            ) : (
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Construct recovery playbooks or hardship proposals to populate your history.</p>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {paginatedHistory.map((record) => (
              <div key={record.id} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: record.request_type === 'strategy' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(236, 72, 153, 0.12)',
                      color: record.request_type === 'strategy' ? 'var(--primary-hover)' : 'var(--accent-rose)',
                      border: record.request_type === 'strategy' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(236, 72, 153, 0.2)'
                    }}>
                      {record.request_type}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Calendar size={12} />
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '1rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                    {record.prompt_summary}
                  </h4>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.5
                  }}>
                    {record.response_text}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => setSelectedRecord(record)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}
                    onClick={() => handleCopy(record.response_text)}
                    title="Copy details"
                  >
                    <FileText size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredHistory.length > limit && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
            <button
              className="btn btn-secondary"
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
              disabled={skip + limit >= filteredHistory.length}
              onClick={() => setSkip(prev => prev + limit)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Details drawer/Modal popup */}
      {selectedRecord && (
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
            width: '90%',
            maxWidth: '650px',
            padding: '2.5rem',
            maxHeight: '85vh',
            overflowY: 'auto',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => setSelectedRecord(null)}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: selectedRecord.request_type === 'strategy' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(236, 72, 153, 0.12)',
                color: selectedRecord.request_type === 'strategy' ? 'var(--primary-hover)' : 'var(--accent-rose)',
                border: selectedRecord.request_type === 'strategy' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(236, 72, 153, 0.2)'
              }}>
                {selectedRecord.request_type}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={12} />
                {new Date(selectedRecord.created_at).toLocaleDateString()}
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, color: '#FFF', marginBottom: '1rem' }}>
              {selectedRecord.prompt_summary}
            </h3>

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              maxHeight: '350px',
              overflowY: 'auto',
              marginBottom: '1.5rem'
            }}>
              {selectedRecord.response_text}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => handleCopy(selectedRecord.response_text)}
              >
                Copy to Clipboard
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => handleDownload(selectedRecord)}
              >
                Download as TXT
              </button>
            </div>
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

export default AIHistory;
