import React from 'react';

const NAV = [
  { key: 'dashboard', label: 'Home' },
  { key: 'records', label: 'My Records' },
  { key: 'access', label: 'Access Control' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'ai', label: 'AI Assistant' },
  { key: 'claims', label: 'Claims' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'notifications', label: 'Notifications' },
];

export default function Sidebar({ active, onNavigate, onLogout, user, unreadCount = 0 }) {
  const initials = (user?.name || 'Patient').slice(0, 1).toUpperCase();

  return (
    <aside
      style={{
        width: 230,
        flexShrink: 0,
        background: 'white',
        borderRight: '1.5px solid #e0e7ff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 14px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 8px' }}>
        <span style={{ fontSize: 26 }}>HV</span>
        <div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 18, color: '#1a1a2e' }}>HealthVault</div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>Patient Portal</div>
        </div>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg,#667eea15,#764ba215)',
          border: '1.5px solid #e0e7ff',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 24,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{user?.name || 'Patient'}</div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>{user?.patientId || 'Patient session'}</div>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map((item) => {
          const isActive = active === item.key;
          const badge = item.key === 'notifications' ? unreadCount : null;

          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 11,
                cursor: 'pointer',
                background: isActive ? 'linear-gradient(135deg,#667eea15,#764ba215)' : 'transparent',
                color: isActive ? '#667eea' : '#6b7280',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                width: '100%',
                border: 'none',
                borderLeft: isActive ? '3px solid #667eea' : '3px solid transparent',
              }}
            >
              <span style={{ flex: 1 }}>{item.label}</span>
              {badge ? (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderRadius: 11,
          border: 'none',
          cursor: 'pointer',
          background: 'transparent',
          color: '#6b7280',
          fontSize: 14,
          marginTop: 12,
          width: '100%',
        }}
      >
        <span>Sign Out</span>
      </button>
    </aside>
  );
}
