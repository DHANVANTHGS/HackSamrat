import React, { useState } from 'react';
import './Login.css';
import { apiRequest } from '../lib/api';

export default function DoctorLogin({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    email: 'doctor.demo@hacksamrat.local',
    password: 'Doctor@123',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const session = await apiRequest('/auth/doctor/login', {
        method: 'POST',
        body: form,
      });
      onSuccess?.(session);
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-page--doctor">
      <div className="doctor-wrap">
        <div className="doctor-left">
          <div>
            <div className="doctor-logo-name">HealthVault</div>
            <div className="doctor-logo-sub">CLINICAL PORTAL</div>
          </div>

          <div className="doctor-divider" />

          <div className="feature-row">
            <div>
              <div className="feature-title">Live backend login</div>
              <div className="feature-desc">This screen now calls the Express auth API and issues a real session token.</div>
            </div>
          </div>

          <div className="demo-box">
            Demo credentials:<br />
            <span className="demo-creds">doctor.demo@hacksamrat.local / Doctor@123</span>
          </div>
        </div>

        <div className="doctor-right">
          <button className="doctor-back-btn" onClick={onBack} type="button">
            Back to role selection
          </button>

          <div className="doctor-title">Doctor Sign In</div>
          <div className="doctor-subtitle">Use the seeded backend doctor account to open the live clinical portal.</div>

          {error ? <div className="error-banner">{error}</div> : null}

          <form className="form-fields" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="field-label">Email</label>
              <input className="field-input" value={form.email} onChange={updateField('email')} autoComplete="username" />
            </div>

            <div className="form-field">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                value={form.password}
                onChange={updateField('password')}
                autoComplete="current-password"
              />
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In Securely'}
            </button>
          </form>

          <div className="doctor-footer">Session issuance, access checks, and audit logs are handled by the backend.</div>
        </div>
      </div>
    </div>
  );
}
