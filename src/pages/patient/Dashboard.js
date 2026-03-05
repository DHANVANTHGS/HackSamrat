import React from 'react';

const stats = [
  { icon: '❤️', bg: '#fff0f0', value: '94', unit: '/100', label: 'Health Score', trend: '↑ +2 this month', up: true },
  { icon: '📋', bg: '#f0f4ff', value: '47', unit: 'docs', label: 'My Records', trend: '2 new this week', up: true },
  { icon: '🛡️', bg: '#f0fdf4', value: '₹8.5L', unit: '', label: 'Policy Cover', trend: '83% remaining', up: true },
  { icon: '📊', bg: '#fffbeb', value: '3', unit: 'active', label: 'Claims', trend: '2 pending review', up: false },
];

const activity = [
  { date: 'Today, 9:14 AM', title: 'CBC Blood Report uploaded', sub: 'Lab · Verified ✓', color: '#667eea' },
  { date: 'Yesterday, 3:30 PM', title: 'Claim CLM-2847 approved', sub: '₹1,24,500 processed', color: '#16a34a' },
  { date: 'Mar 1, 11:42 AM', title: 'Dr. Patel accessed ECG records', sub: 'Apollo Hospital · Logged', color: '#f59e0b' },
  { date: 'Feb 28', title: 'Policy renewed — HDFC Health', sub: 'Valid till Nov 2025', color: '#8b5cf6' },
];


export default function Dashboard() {
  return (
    <div className="page-fade">
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 26, fontWeight: 800, color: '#1a1a2e' }}>
          Good morning, Aarav 👋
        </div>
        <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
          Here's a summary of your health status today.
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 22 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-value">{s.value}<span style={{ fontSize: 14, fontWeight: 500, color: '#9ca3af', marginLeft: 3 }}>{s.unit}</span></div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-trend ${s.up ? 'stat-trend--up' : 'stat-trend--warn'}`}>{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Recent Activity */}
        <div className="card">
          <div className="card-title">Recent Activity</div>
          <div className="card-sub">Your latest health events</div>
          <div className="timeline">
            {activity.map((a, i) => (
              <div key={i} className="timeline-item">
                <div className="tl-line">
                  <div className="tl-dot" style={{ background: a.color }} />
                  {i < activity.length - 1 && <div className="tl-connector" />}
                </div>
                <div className="tl-content">
                  <div className="tl-date">{a.date}</div>
                  <div className="tl-title">{a.title}</div>
                  <div className="tl-sub">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none' }}>
          <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 6, fontWeight: 600 }}>HDFC HEALTH FLOATER</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 28, fontWeight: 800 }}>₹8,50,000</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Sum insured · 4 members</div>
          <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div><div style={{ fontSize: 10, opacity: 0.7 }}>RENEWAL</div><div style={{ fontSize: 13, fontWeight: 600 }}>Nov 15, 2025</div></div>
            <div><div style={{ fontSize: 10, opacity: 0.7 }}>PREMIUM</div><div style={{ fontSize: 13, fontWeight: 600 }}>₹24,500/yr</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}