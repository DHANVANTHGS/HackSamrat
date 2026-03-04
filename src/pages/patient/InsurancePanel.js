import React from 'react';

const BENEFITS = [
  { name: 'Hospitalization',     total: 500000,  used: 120000 },
  { name: 'Day Care Procedures', total: 150000,  used: 0      },
  { name: 'OPD / Pharmacy',      total: 25000,   used: 18500  },
  { name: 'Critical Illness',    total: 1000000, used: 0      },
  { name: 'Maternity',           total: 75000,   used: 75000  },
];

const ALERTS = [
  { icon: '⚠️', text: '₹40,000 dental benefit expires Mar 31' },
  { icon: '💡', text: '8 of 12 mental wellness sessions remaining' },
  { icon: '🎁', text: 'Free preventive health checkup overdue' },
  { icon: '🚑', text: 'Ambulance cover ₹5,000 — never claimed' },
];

export default function InsurancePanel() {
  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">Insurance Intelligence</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>AI-powered policy analysis & benefit tracking</div>
        </div>
        <button className="btn btn-outline">📄 View Full Policy</button>
      </div>

      <div className="grid-2" style={{ marginBottom: 20, gap: 18 }}>
        {/* Policy card */}
        <div className="ins-card" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
          <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 700, letterSpacing: 1 }}>HDFC HEALTH FLOATER</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 42, fontWeight: 900, margin: '8px 0 4px', lineHeight: 1 }}>₹8.5L</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Total sum insured · 4 members</div>

          <div style={{ marginTop: 18, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.25)' }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Utilised: ₹2,13,500 (25%)</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '25%', background: 'rgba(255,255,255,0.6)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
            <div><div style={{ fontSize: 10, opacity: 0.7 }}>RENEWAL</div><div style={{ fontSize: 14, fontWeight: 700 }}>Nov 15, 2025</div></div>
            <div><div style={{ fontSize: 10, opacity: 0.7 }}>PREMIUM</div><div style={{ fontSize: 14, fontWeight: 700 }}>₹24,500/yr</div></div>
            <div><div style={{ fontSize: 10, opacity: 0.7 }}>POLICY NO.</div><div style={{ fontSize: 12, fontWeight: 600 }}>HDFC-2847392</div></div>
          </div>
        </div>

        {/* Unused benefit alerts */}
        <div className="card">
          <div className="card-title">⚡ Unused Benefit Alerts</div>
          <div className="card-sub">Benefits you haven't claimed yet</div>
          {ALERTS.map((a, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '10px 0', borderBottom: i < ALERTS.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}>
              <span style={{ fontSize: 16 }}>{a.icon}</span>
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{a.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage breakdown */}
      <div className="card">
        <div className="card-title">Coverage Breakdown</div>
        <div className="card-sub">How much of each benefit you've used</div>
        <div style={{ marginTop: 8 }}>
          {BENEFITS.map((b, i) => {
            const pct = Math.round((b.used / b.total) * 100);
            const color = pct === 100 ? '#ef4444' : pct > 65 ? '#f59e0b' : '#667eea';
            return (
              <div key={i} className="cov-row">
                <div className="cov-header">
                  <span className="cov-name">{b.name}</span>
                  <span className="cov-val">₹{b.used.toLocaleString()} / ₹{b.total.toLocaleString()}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct || 2}%`, background: color }} />
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{pct}% utilised</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}