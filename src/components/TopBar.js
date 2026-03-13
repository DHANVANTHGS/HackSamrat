import React from 'react';

export default function TopBar({ page, notifications = 0, user }) {
  const labels = {
    dashboard: 'Home',
    records: 'Medical Records',
    access: 'Access Control',
    insurance: 'Insurance',
    ai: 'AI Assistant',
    claims: 'Claims',
    emergency: 'Emergency Access',
    notifications: 'Notifications',
  };

  return (
    <div
      style={{
        background: 'white',
        borderBottom: '1.5px solid #e0e7ff',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>
          {labels[page] || 'Dashboard'}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>
          API Live
        </span>
        <span style={{ background: '#e0e7ff', color: '#4338ca', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>
          {notifications} unread
        </span>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          {(user?.firstName || 'P').slice(0, 1).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
