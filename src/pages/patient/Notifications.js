import React, { useState } from 'react';

const INITIAL = [
  { id: 1, icon: '💳', bg: '#fffbeb', title: 'Premium due in 14 days',    body: '₹24,500 due Nov 15, 2025 · HDFC Health Floater',                         time: 'Just now', unread: true  },
  { id: 2, icon: '✅', bg: '#f0fdf4', title: 'Claim CLM-2847 approved',    body: '₹1,24,500 will be credited to account ending 4821 within 3-5 days',       time: '2h ago',   unread: true  },
  { id: 3, icon: '❤️', bg: '#fff0f0', title: 'Annual checkup overdue',     body: 'Your free preventive health checkup under policy is pending.',              time: '1d ago',   unread: true  },
  { id: 4, icon: '🦷', bg: '#f0f4ff', title: 'Dental benefit expiring',    body: '₹40,000 dental benefit expires March 31. Book appointment to use it.',      time: '2d ago',   unread: false },
  { id: 5, icon: '👁️', bg: '#f3e8ff', title: 'Dr. Sharma accessed records',body: 'ECG records accessed at Apollo Hospital today at 11:42 AM.',                time: '3d ago',   unread: false },
  { id: 6, icon: '📄', bg: '#f0fdf4', title: 'Policy documents updated',   body: 'Your HDFC Health policy schedule has been updated. Review changes.',        time: '5d ago',   unread: false },
];

export default function Notifications() {
  const [items, setItems] = useState(INITIAL);
  const unread = items.filter(n => n.unread).length;

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">Notifications</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{unread} unread</div>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm"
            onClick={() => setItems(i => i.map(n => ({ ...n, unread: false })))}>
            Mark all read
          </button>
        )}
      </div>

      {items.map(n => (
        <div key={n.id} className={`notif-item ${n.unread ? 'notif-item--unread' : ''}`}>
          <div className="notif-icon" style={{ background: n.bg }}>{n.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="notif-title">{n.title}</div>
              {n.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#667eea', flexShrink: 0, marginTop: 4 }} />}
            </div>
            <div className="notif-body">{n.body}</div>
            <div className="notif-time">{n.time}</div>
          </div>
          <button onClick={() => setItems(i => i.filter(x => x.id !== n.id))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 18, alignSelf: 'flex-start', padding: '0 4px' }}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}