import React from 'react';

const STAGES = ['Submitted', 'Under Review', 'Docs Verified', 'Approved', 'Disbursed'];

const CLAIMS = [
  { id: 'CLM-2847', name: 'Apollo Hospital — Bypass Surgery',  amount: '₹1,24,500', stage: 3, status: 'approved',  date: 'Feb 28, 2025' },
  { id: 'CLM-2801', name: 'Max Lab — Blood Panel + MRI',       amount: '₹8,200',    stage: 1, status: 'review',    date: 'Mar 1, 2025'  },
  { id: 'CLM-2780', name: 'Pharmacy — Chronic Meds (Feb)',     amount: '₹3,450',    stage: 4, status: 'disbursed', date: 'Feb 15, 2025' },
];

const STATUS_TAG = { approved: 'tag-green', review: 'tag-yellow', disbursed: 'tag-blue', submitted: 'tag-gray' };

function StageTracker({ current }) {
  const pct = (current / (STAGES.length - 1)) * 86;
  return (
    <div className="stage-track">
      <div className="stage-connector" />
      <div className="stage-fill" style={{ width: `${pct}%` }} />
      {STAGES.map((s, i) => (
        <div key={i} className="stage-item">
          <div className={`stage-dot ${i < current ? 'stage-dot--done' : i === current ? 'stage-dot--active' : 'stage-dot--pending'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          <div className="stage-label">{s}</div>
        </div>
      ))}
    </div>
  );
}

export default function ClaimTracking() {
  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">Claim Tracking</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>3 claims · ₹1,36,150 approved</div>
        </div>
        <button className="btn btn-primary">+ New Claim</button>
      </div>

      {CLAIMS.map((c, i) => (
        <div key={i} className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#667eea', background: '#e0e7ff', padding: '2px 8px', borderRadius: 6 }}>{c.id}</span>
                <span className={`tag ${STATUS_TAG[c.status]}`}>{c.status.toUpperCase()}</span>
              </div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{c.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Filed: {c.date} · HDFC Health</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{c.amount}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Claim amount</div>
            </div>
          </div>
          <StageTracker current={c.stage} />
          <div style={{ fontSize: 11, color: '#16a34a', marginTop: 8, fontWeight: 600 }}>⛓ Blockchain logged</div>
        </div>
      ))}
    </div>
  );
}