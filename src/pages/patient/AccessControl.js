import React, { useState } from 'react';

const INITIAL = [
  { id: 1, name: 'Dr. Riya Patel',  role: 'Cardiologist', org: 'Apollo',     access: 'Full Records', exp: 'Permanent',      color: '#dbeafe', letter: 'R', on: true  },
  { id: 2, name: 'Dr. Anil Mehta',  role: 'Orthopedic',   org: 'Fortis',     access: 'X-Rays only',  exp: 'Expires Mar 31', color: '#dcfce7', letter: 'A', on: false },
  { id: 3, name: 'Priya Sharma',    role: 'Spouse',        org: 'Family',     access: 'Emergency',    exp: 'Permanent',      color: '#f3e8ff', letter: 'P', on: true  },
  { id: 4, name: 'Sunita Nair',     role: 'Caregiver',     org: 'Home Care',  access: 'Prescriptions',exp: 'Expires Apr 15', color: '#fef9c3', letter: 'S', on: true  },
];

function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} className={`toggle ${on ? 'toggle--on' : 'toggle--off'}`}>
      <div className="toggle-knob" />
    </button>
  );
}

export default function AccessControl() {
  const [users, setUsers] = useState(INITIAL);

  const toggle = id => setUsers(u => u.map(x => x.id === id ? { ...x, on: !x.on } : x));
  const revoke = id => setUsers(u => u.filter(x => x.id !== id));

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">Access Control</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Manage who can view your health data</div>
        </div>
        <button className="btn btn-primary">+ Grant Access</button>
      </div>

      {users.map(u => (
        <div key={u.id} className="access-card">
          <div className="access-avatar" style={{ background: u.color, color: '#374151' }}>{u.letter}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="access-name">{u.name}</div>
              <span className="tag tag-gray">{u.role}</span>
            </div>
            <div className="access-role">{u.org} · {u.access}</div>
            <div style={{ fontSize: 11, color: u.exp.startsWith('Expires') ? '#d97706' : '#16a34a', marginTop: 4, fontWeight: 600 }}>
              📅 {u.exp}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Toggle on={u.on} onChange={() => toggle(u.id)} />
            <button className="btn btn-danger btn-sm" onClick={() => revoke(u.id)}>Revoke</button>
          </div>
        </div>
      ))}

      <div className="card" style={{ marginTop: 20, background: '#f8f7ff', border: '1.5px dashed #c7d2fe' }}>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>➕</div>
          <div style={{ fontWeight: 600, color: '#374151' }}>Grant new access</div>
          <div style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 16px' }}>Share your records with a doctor or family member</div>
          <button className="btn btn-primary">Add Person</button>
        </div>
      </div>
    </div>
  );
}