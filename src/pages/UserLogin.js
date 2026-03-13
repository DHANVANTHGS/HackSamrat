import React, { useState } from 'react';
import './Login.css';
import { apiRequest } from '../lib/api';
import {
  serializeAuthenticationResponse,
  serializeRegistrationResponse,
  toPublicKeyCreationOptions,
  toPublicKeyRequestOptions,
} from '../lib/webauthn';

async function runRegistration(email) {
  const registrationOptions = await apiRequest('/auth/patients/webauthn/register/options', {
    method: 'POST',
    body: { email },
  });

  const credential = await navigator.credentials.create({
    publicKey: toPublicKeyCreationOptions(registrationOptions.options),
  });

  return apiRequest('/auth/patients/webauthn/register/verify', {
    method: 'POST',
    body: {
      email,
      response: serializeRegistrationResponse(credential),
    },
  });
}

async function runAuthentication(email) {
  const loginOptions = await apiRequest('/auth/patients/webauthn/login/options', {
    method: 'POST',
    body: { email },
  });

  const assertion = await navigator.credentials.get({
    publicKey: toPublicKeyRequestOptions(loginOptions.options),
  });

  return apiRequest('/auth/patients/webauthn/login/verify', {
    method: 'POST',
    body: {
      email,
      response: serializeAuthenticationResponse(assertion),
    },
  });
}

export default function UserLogin({ onBack, onSuccess }) {
  const [email, setEmail] = useState('patient.demo@hacksamrat.local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Enter your patient email to sign in with device biometrics.');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!window.PublicKeyCredential) {
      setError('This browser does not support WebAuthn.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setStatus('Requesting your biometric challenge...');
      let session;

      try {
        session = await runAuthentication(email);
      } catch (requestError) {
        const errorCode = requestError.payload?.error?.code;

        if (errorCode !== 'WEBAUTHN_NOT_REGISTERED') {
          throw requestError;
        }

        setStatus('No credential found yet, registering this device first...');
        session = await runRegistration(email);
      }

      setStatus('Biometric verified. Loading your dashboard...');
      onSuccess?.(session);
    } catch (requestError) {
      setError(requestError.message || 'Patient sign in failed.');
      setStatus('Try again with the seeded patient account and a biometric-capable browser.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-page--patient">
      <div className="patient-box">
        <div className="box-header">
          <button className="back-btn" onClick={onBack}>Back</button>
          <div className="box-logo">
            <div className="box-logo-icon">HV</div>
            <div>
              <div className="box-logo-name">HealthVault</div>
              <div className="box-logo-sub">PATIENT LOGIN</div>
            </div>
          </div>
        </div>

        <div className="step-title" style={{ textAlign: 'center' }}>Patient Biometric Login</div>
        <div className="step-desc" style={{ textAlign: 'center', marginBottom: 16 }}>
          The frontend now uses the backend WebAuthn challenge lifecycle instead of local mock state.
        </div>

        <form onSubmit={handleSubmit}>
          <input
            className="input"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError('');
            }}
            placeholder="patient.demo@hacksamrat.local"
            type="email"
            autoComplete="username"
          />

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Waiting for biometric...' : 'Continue with Biometrics'}
          </button>
        </form>

        <div className="pin-hint" style={{ marginTop: 14 }}>
          Demo account: patient.demo@hacksamrat.local
        </div>
        <div className="step-desc" style={{ textAlign: 'center', marginTop: 12 }}>{status}</div>
        {error ? <div className="error-banner" style={{ marginTop: 14 }}>{error}</div> : null}
      </div>
    </div>
  );
}
