import React, { useState } from 'react';
import './Login.css';

const VALID_CREDS = { username: 'dr.patel', password: 'Apollo@123' };

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
      stroke="#00ff88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────
function DoctorSuccess() {
  return (
    <div className="doctor-success">
      <div className="doctor-success-circle">
        <CheckIcon />
      </div>
      <div className="doctor-success-title">Access Granted</div>
      <div className="doctor-success-sub">
        Welcome back, <span>Dr. Riya Patel</span>
      </div>
      <div className="doctor-success-badge">
        🔒 Clinical session started · All access is audit-logged
      </div>
      <div style={{ marginTop: 16, color: '#4a6fa5', fontSize: 13 }}>
        Redirecting to clinical portal…
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function DoctorLogin({ onBack, onSuccess }) {
  const [form,    setForm]    = useState({ hospitalId: '', username: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});

  const update = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setError('');
  };
  const touch = (field) => () => setTouched(t => ({ ...t, [field]: true }));

  const validate = () => {
    if (!form.hospitalId.trim()) return 'Hospital / Clinic ID is required.';
    if (!form.username.trim())   return 'Doctor username is required.';
    if (!form.password)          return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      if (form.username === VALID_CREDS.username && form.password === VALID_CREDS.password) {
        setSuccess(true);
        // ✅ KEY CHANGE: show success screen for 1.8s then call onSuccess
        setTimeout(() => onSuccess?.(), 1800);
      } else {
        setError('Invalid username or password. Please check your credentials.');
      }
    }, 1500);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  const FEATURES = [
    { icon: '🏥', title: 'Clinical Portal',  desc: 'Access patient records with permission-based control' },
    { icon: '⛓',  title: 'Blockchain Audit', desc: 'Every access is immutably logged on-chain'           },
    { icon: '🔒', title: 'Role Security',    desc: 'Multi-layer role-based authentication'                },
  ];

  return (
    <div className="login-page login-page--doctor">
      <div className="doctor-wrap">

        {/* ── Left panel ── */}
        <div className="doctor-left">
          <div>
            <div className="doctor-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="doctor-logo-name">HealthVault</div>
            <div className="doctor-logo-sub">CLINICAL PORTAL</div>
          </div>

          <div className="doctor-divider" />

          {FEATURES.map((f, i) => (
            <div key={i} className="feature-row" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="feature-icon-box">{f.icon}</div>
              <div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}

          <div className="demo-box">
            Demo credentials:<br />
            <span className="demo-creds">dr.patel / Apollo@123</span>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="doctor-right">
          {/* Back button — hidden after success */}
          {!success && (
            <button className="doctor-back-btn" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to role selection
            </button>
          )}

          {/* ✅ Show success screen OR the form */}
          {success ? (
            <DoctorSuccess />
          ) : (
            <>
              <div className="doctor-title">Doctor Sign In</div>
              <div className="doctor-subtitle">
                Authorised clinical staff only · Credentials verified against hospital registry
              </div>

              {error && (
                <div className="error-banner">
                  <AlertIcon />
                  {error}
                </div>
              )}

              <div className="form-fields">
                {/* Hospital ID */}
                <div className="form-field">
                  <label className="field-label">Hospital / Clinic ID</label>
                  <input
                    className={`field-input ${touched.hospitalId && !form.hospitalId ? 'field-input--error' : ''}`}
                    placeholder="e.g. APOLLO-MUM-001"
                    value={form.hospitalId}
                    onChange={update('hospitalId')}
                    onBlur={touch('hospitalId')}
                    onKeyDown={handleKeyDown}
                  />
                  {touched.hospitalId && !form.hospitalId && (
                    <span className="field-error">Required</span>
                  )}
                </div>

                {/* Username */}
                <div className="form-field">
                  <label className="field-label">Doctor Username</label>
                  <input
                    className={`field-input ${touched.username && !form.username ? 'field-input--error' : ''}`}
                    placeholder="e.g. dr.patel"
                    value={form.username}
                    onChange={update('username')}
                    onBlur={touch('username')}
                    onKeyDown={handleKeyDown}
                    autoComplete="username"
                  />
                  {touched.username && !form.username && (
                    <span className="field-error">Required</span>
                  )}
                </div>

                {/* Password */}
                <div className="form-field">
                  <label className="field-label">Password</label>
                  <div className="pw-wrap">
                    <input
                      className={`field-input ${touched.password && !form.password ? 'field-input--error' : ''}`}
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={update('password')}
                      onBlur={touch('password')}
                      onKeyDown={handleKeyDown}
                      autoComplete="current-password"
                    />
                    <button className="pw-toggle" onClick={() => setShowPw(v => !v)} type="button">
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  {touched.password && !form.password && (
                    <span className="field-error">Required</span>
                  )}
                </div>

                {/* Forgot */}
                <div className="forgot-row">
                  <button className="forgot-btn">Forgot password?</button>
                </div>

                {/* Submit */}
                <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><span className="spin">◌</span> Verifying…</>
                    : <><LockIcon /> Sign In Securely</>}
                </button>
              </div>

              <div className="doctor-footer">
                All logins are recorded on blockchain · Unauthorised access is a criminal offence
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}