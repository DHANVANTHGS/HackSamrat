import React from 'react';

const NAV = [
  { key: 'dashboard',    icon: '🏠', label: 'Home' },
  { key: 'records',      icon: '📁', label: 'My Records' },
  { key: 'access',       icon: '🔐', label: 'Access Control' },
  { key: 'insurance',    icon: '💰', label: 'Insurance' },
  { key: 'ai',           icon: '🤖', label: 'AI Assistant' },
  { key: 'claims',       icon: '📊', label: 'Claims' },
  { key: 'emergency',    icon: '🚨', label: 'Emergency' },
  { key: 'notifications',icon: '🔔', label: 'Notifications', badge: 3 },
];

export default function Sidebar({ active, onNavigate, onLogout, user }) {
  return (
    <aside style={{
      width: 230, flexShrink: 0, background: 'white',
      borderRight: '1.5px solid #e0e7ff',
      display: 'flex', flexDirection: 'column',
      padding: '24px 14px', height: '100vh',
      position: 'sticky', top: 0, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 8px' }}>
        <span style={{ fontSize: 26 }}>❤️</span>
        <div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 18, color: '#1a1a2e' }}>HealthVault</div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>Patient Portal</div>
        </div>
      </div>

      {/* User pill */}
      <div style={{
        background: 'linear-gradient(135deg,#667eea15,#764ba215)',
        border: '1.5px solid #e0e7ff', borderRadius: 12,
        padding: '12px 14px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg,#667eea,#764ba2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontFamily: 'Nunito', fontWeight: 800, fontSize: 15,
        }}>
          {user?.name?.[0] || 'A'}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{user?.name || 'Aarav Sharma'}</div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>PID-2847-MHVX</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map(item => {
          const isActive = active === item.key;
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 11, border: 'none', cursor: 'pointer',
                background: isActive ? 'linear-gradient(135deg,#667eea15,#764ba215)' : 'transparent',
                color: isActive ? '#667eea' : '#6b7280',
                fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: isActive ? 600 : 400,
                textAlign: 'left', width: '100%',
                borderLeft: isActive ? '3px solid #667eea' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button onClick={onLogout}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 11, border: 'none', cursor: 'pointer', background: 'transparent', color: '#6b7280', fontSize: 14, fontFamily: 'Inter, sans-serif', marginTop: 12, width: '100%' }}
        onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span>🚪</span> Sign Out
      </button>
    </aside>
  );
}