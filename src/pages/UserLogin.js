import React, { useState, useEffect } from 'react';
import './Login.css';

const CORRECT_PIN = '123456';

function FingerprintIcon({ color }) {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10"/>
      <path d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6"/>
      <path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2"/>
    </svg>
  );
}

function FaceIcon({ color }) {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  );
}

function CheckIcon({ size = 48, color = '#00ff88' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
      <line x1="18" y1="9" x2="12" y2="15"/>
      <line x1="12" y1="9" x2="18" y2="15"/>
    </svg>
  );
}

// ── Biometric Step ───────────────────────────────────────────────────────
function BiometricStep({ onSuccess }) {
  const [mode, setMode]   = useState('fingerprint');
  const [state, setState] = useState('idle');

  const handleScan = () => {
    if (state === 'scanning') return;
    setState('scanning');
    setTimeout(() => setState('success'), 2600);
  };

  useEffect(() => {
    if (state === 'success') {
      const t = setTimeout(() => onSuccess(), 900);
      return () => clearTimeout(t);
    }
  }, [state, onSuccess]);

  const ringColor = state === 'success' ? '#00ff88' : state === 'error' ? '#ff3860' : '#00d4ff';
  const ringBg    = state === 'success' ? 'rgba(0,255,136,0.08)' : state === 'error' ? 'rgba(255,56,96,0.08)' : 'rgba(0,212,255,0.06)';

  return (
    <div className="bio-step">
      <div className="step-indicator">
        <span className="step-dot step-dot--blue" />
        <span style={{ color: '#00d4ff', fontFamily: 'monospace', fontSize: 11 }}>STEP 1 OF 2</span>
      </div>

      <div className="step-title">
        {state === 'success' ? 'Identity Confirmed ✓' : 'Biometric Verification'}
      </div>
      <div className={`step-desc ${state === 'error' ? 'step-desc--error' : state === 'success' ? 'step-desc--success' : ''}`}>
        {state === 'idle'     && 'Tap the scanner to authenticate'}
        {state === 'scanning' && 'Hold still, reading biometric…'}
        {state === 'success'  && 'Moving to PIN verification…'}
        {state === 'error'    && 'Match failed — try again'}
      </div>

      <div className="mode-tabs">
        {[
          { key: 'fingerprint', label: 'Fingerprint' },
          { key: 'face',        label: 'Face ID'     },
        ].map(m => (
          <button key={m.key}
            className={`mode-tab ${mode === m.key ? 'mode-tab--active' : ''}`}
            onClick={() => { setMode(m.key); setState('idle'); }}>
            {m.key === 'fingerprint'
              ? <FingerprintIcon color={mode === m.key ? '#00d4ff' : '#4a6fa5'} />
              : <FaceIcon        color={mode === m.key ? '#00d4ff' : '#4a6fa5'} />}
            {m.label}
          </button>
        ))}
      </div>

      <div className="bio-ring-wrap" onClick={handleScan}
        style={{ cursor: state === 'scanning' ? 'default' : 'pointer' }}>
        {state === 'scanning' && (
          <>
            <div className="bio-pulse" />
            <div className="bio-pulse-2" />
          </>
        )}
        <div className="bio-circle"
          style={{
            borderColor: ringColor,
            background:  ringBg,
            animation:   state === 'scanning' ? 'glowPulse 1.4s ease-in-out infinite' : 'none',
          }}>
          {state === 'scanning' && <div className="bio-scan-line" />}
          {state === 'success'
            ? <div className="bio-icon-wrap--success"><CheckIcon /></div>
            : mode === 'fingerprint'
              ? <FingerprintIcon color={ringColor} />
              : <FaceIcon        color={ringColor} />}
        </div>
      </div>

      {state !== 'scanning' && state !== 'success' && (
        <button className="auth-btn" onClick={handleScan}>
          {state === 'error' ? 'Retry Scan' : `Scan ${mode === 'fingerprint' ? 'Fingerprint' : 'Face'}`}
        </button>
      )}
      {state === 'scanning' && (
        <p className="scanning-text">
          <span className="spin-icon">◌</span> Analysing…
        </p>
      )}
      <p className="bio-footer">256-BIT ENCRYPTED · ZERO-KNOWLEDGE PROOF</p>
    </div>
  );
}

// ── PIN Step ─────────────────────────────────────────────────────────────
function PinStep({ onSuccess }) {
  const [pin,    setPin]    = useState([]);
  const [status, setStatus] = useState('idle');
  const PIN_LEN = 6;

  const pressKey = (val) => {
    if (status === 'success') return;
    if (val === 'del') {
      setPin(p => p.slice(0, -1));
      setStatus('idle');
      return;
    }
    if (pin.length >= PIN_LEN) return;
    const next = [...pin, val];
    setPin(next);

    if (next.length === PIN_LEN) {
      if (next.join('') === CORRECT_PIN) {
        setStatus('success');
        setTimeout(() => onSuccess(), 900);
      } else {
        setStatus('error');
        setTimeout(() => { setPin([]); setStatus('idle'); }, 900);
      }
    }
  };

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="pin-step">
      <div className="step-indicator">
        <span className="step-dot step-dot--green" />
        <span style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 11 }}>STEP 2 OF 2</span>
      </div>

      <div className="step-title">
        {status === 'success' ? 'Access Granted ✓' : 'Enter Your PIN'}
      </div>
      <div className={`step-desc ${status === 'error' ? 'step-desc--error' : status === 'success' ? 'step-desc--success' : ''}`}>
        {status === 'idle'    && 'Enter your 6-digit secure PIN'}
        {status === 'error'   && 'Incorrect PIN — try again'}
        {status === 'success' && 'Welcome back, Aarav!'}
      </div>

      <div className={`pin-display ${status === 'error' ? 'pin-display--shake' : ''}`}>
        {Array.from({ length: PIN_LEN }).map((_, i) => (
          <div key={i} className={`pin-dot ${
            i < pin.length
              ? status === 'error' ? 'pin-dot--error' : 'pin-dot--filled'
              : ''
          }`} />
        ))}
      </div>

      <div className="pin-grid">
        {KEYS.map((k, i) => {
          if (k === '') return <div key={i} className="pin-key pin-key--empty" />;
          return (
            <button key={i}
              className={`pin-key ${k === 'del' ? 'pin-key--danger' : ''}`}
              onClick={() => pressKey(k)}>
              {k === 'del' ? <DeleteIcon /> : k}
            </button>
          );
        })}
      </div>
      <p className="pin-hint">HINT: 1 2 3 4 5 6 (demo only)</p>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="success-screen">
      <div className="success-circle">
        <CheckIcon size={40} />
      </div>
      <div className="success-title">Login Successful!</div>
      <div className="success-sub">Redirecting to your dashboard…</div>
      <div className="success-badge">🔒 Session secured · Blockchain logged</div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function UserLogin({ onBack, onSuccess }) {
  const [step, setStep] = useState('bio');

  // ✅ KEY CHANGE: when step becomes 'done', wait 1.5s then call onSuccess
  useEffect(() => {
    if (step === 'done') {
      const t = setTimeout(() => onSuccess?.(), 1500);
      return () => clearTimeout(t);
    }
  }, [step, onSuccess]);

  return (
    <div className="login-page login-page--patient">
      <div className="patient-box">

        {/* Header */}
        <div className="box-header">
          <button className="back-btn" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <div className="box-logo">
            <div className="box-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div className="box-logo-name">HealthVault</div>
              <div className="box-logo-sub">PATIENT LOGIN</div>
            </div>
          </div>
        </div>

        {/* Progress bar — hidden on done screen */}
        {step !== 'done' && (
          <div className="step-bar">
            <div className={`step-bar-item ${step === 'bio' || step === 'pin' ? 'step-bar-item--active' : 'step-bar-item--inactive'}`} />
            <div className={`step-bar-item ${step === 'pin' ? 'step-bar-item--active' : 'step-bar-item--inactive'}`} />
          </div>
        )}

        {/* Steps */}
        {step === 'bio'  && <BiometricStep onSuccess={() => setStep('pin')} />}
        {step === 'pin'  && <PinStep       onSuccess={() => setStep('done')} />}
        {step === 'done' && <SuccessScreen />}

      </div>
    </div>
  );
}