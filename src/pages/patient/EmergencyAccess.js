import React, { useState } from 'react';

const CONSENT = [
  { label: 'Share blood type with first responders',    desc: 'Always visible on QR scan' },
  { label: 'Share allergy information',                  desc: 'Shown to verified medical staff' },
  { label: 'Share current medication list',             desc: 'Requires staff biometric confirm' },
  { label: 'Allow hospital EHR access on admission',   desc: 'Full records for 6hrs post-admit' },
];

function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} className={`toggle ${on ? 'toggle--on' : 'toggle--off'}`}>
      <div className="toggle-knob" />
    </button>
  );
}

export default function EmergencyAccess() {
  const [unlocked, setUnlocked] = useState(false);
  const [consents, setConsents] = useState([true, true, false, true]);
  const toggle = i => setConsents(c => c.map((v, j) => j === i ? !v : v));

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">🚨 Emergency Access</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Critical data for first responders</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 18 }}>
        {/* Critical info */}
        <div>
          <div className="card" style={{ borderLeft: '4px solid #ef4444', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 12, fontSize: 15 }}>⚕ Critical Health Info</div>
            {[
              ['Blood Group', 'O+'],
              ['Allergies', 'Penicillin, Sulfa drugs'],
              ['Chronic Conditions', 'Type 2 Diabetes, Hypertension'],
              ['Current Medications', 'Metformin 500mg, Amlodipine 5mg'],
              ['Emergency Contact', '+91 98765 43210 (Priya)'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>{label}</span>
                <span style={{ fontWeight: 600, color: '#1a1a2e', maxWidth: '55%', textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Quick tags */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Critical Tags</div>
            <div>
              {['O+ Blood', 'Penicillin Allergy', 'Diabetic', 'Hypertensive'].map(t => (
                <div key={t} className="emg-tag">🚨 {t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Unlock + consents */}
        <div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 16, border: unlocked ? '2px solid #ef4444' : '1.5px solid #f3f4f6' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
              background: unlocked ? '#fff0f0' : '#f0f4ff',
              border: `3px solid ${unlocked ? '#ef4444' : '#c7d2fe'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
            }}>
              {unlocked ? '🔓' : '🔒'}
            </div>
            <div style={{ fontFamily: 'Nunito', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {unlocked ? 'Emergency Mode Active' : 'Emergency Data Locked'}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
              {unlocked
                ? 'Critical data is now visible to verified responders for 1 hour. All access is logged.'
                : 'Unlock to share critical health data with verified emergency responders.'}
            </div>
            <button
              onClick={() => setUnlocked(!unlocked)}
              className={`btn btn-lg ${unlocked ? 'btn-danger' : 'btn-primary'}`}
              style={{ width: '100%', justifyContent: 'center' }}>
              {unlocked ? '🔒 Revoke Emergency Access' : '🚨 Unlock Emergency Access'}
            </button>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Consent Settings</div>
            {CONSENT.map((item, i) => (
              <div key={i} className="toggle-wrap">
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{item.desc}</div>
                </div>
                <Toggle on={consents[i]} onChange={() => toggle(i)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}