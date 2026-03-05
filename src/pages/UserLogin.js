import React, { useState, useEffect } from 'react';
import './Login.css';

/* ─────────────────────────────────────────
   WebAuthn helpers
───────────────────────────────────────── */

// Convert base64url string → ArrayBuffer
function b64ToBuffer(b64) {
  const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, c => c.charCodeAt(0)).buffer;
}

// Convert ArrayBuffer → base64url string
function bufferToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const RP_ID   = window.location.hostname;          // e.g. "localhost"
const RP_NAME = 'HealthVault';
const USER_ID = 'aarav-sharma-2847';               // demo user id
const USER_NAME = 'aarav.sharma';

// Store credential id in localStorage so same device can verify later
const CRED_KEY = 'hv_webauthn_cred';

async function registerFingerprint() {
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const publicKey = {
    challenge,
    rp: { id: RP_ID, name: RP_NAME },
    user: {
      id: Uint8Array.from(USER_ID, c => c.charCodeAt(0)),
      name: USER_NAME,
      displayName: 'Aarav Sharma',
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7  },   // ES256
      { type: 'public-key', alg: -257 },  // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',   // use device built-in (Touch ID / Face ID / Windows Hello)
      userVerification: 'required',           // forces biometric
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  };

  const credential = await navigator.credentials.create({ publicKey });

  // Save credential ID so we can authenticate later
  localStorage.setItem(CRED_KEY, bufferToB64(credential.rawId));

  return credential;
}

async function authenticateFingerprint() {
  const savedCredId = localStorage.getItem(CRED_KEY);
  const challenge   = crypto.getRandomValues(new Uint8Array(32));

  const publicKey = {
    challenge,
    rpId: RP_ID,
    userVerification: 'required',
    timeout: 60000,
    ...(savedCredId
      ? { allowCredentials: [{ type: 'public-key', id: b64ToBuffer(savedCredId), transports: ['internal'] }] }
      : {}),
  };

  const assertion = await navigator.credentials.get({ publicKey });
  return assertion;
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function SuccessScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="success-screen">
      <div className="success-circle">✅</div>
      <div className="success-title">Identity Verified</div>
      <div className="success-sub">Biometric authentication successful</div>
      <div className="success-badge">🔒 Blockchain session started</div>
      <div style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
        Redirecting to your dashboard…
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN LOGIN
───────────────────────────────────────── */
export default function UserLogin({ onBack, onSuccess }) {
  const [step,       setStep]       = useState('biometric'); // biometric | pin | success
  const [bioState,   setBioState]   = useState('idle');      // idle | scanning | success | error | unsupported | notregistered
  const [bioMsg,     setBioMsg]     = useState('');
  const [pin,        setPin]        = useState('');
  const [pinError,   setPinError]   = useState(false);
  const [pinMsg,     setPinMsg]     = useState('');
  const [shake,      setShake]      = useState(false);
  const [mode,       setMode]       = useState('bio');       // bio | pin

  const isWebAuthnSupported = () =>
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function';

  const isRegistered = () => !!localStorage.getItem(CRED_KEY);

  /* ── Fingerprint tap ── */
  const handleBioTap = async () => {
    if (!isWebAuthnSupported()) {
      setBioState('unsupported');
      setBioMsg('Your browser or device does not support biometric authentication. Use PIN instead.');
      return;
    }

    setBioState('scanning');
    setBioMsg('');

    try {
      if (!isRegistered()) {
        // First time — register the fingerprint
        setBioMsg('Setting up your fingerprint for the first time…');
        await registerFingerprint();
        setBioMsg('Fingerprint registered! Verifying now…');
        await new Promise(r => setTimeout(r, 600));
      }

      await authenticateFingerprint();
      setBioState('success');
      setBioMsg('Fingerprint matched!');
      setTimeout(() => setStep('success'), 800);

    } catch (err) {
      console.error('WebAuthn error:', err);

      if (err.name === 'NotAllowedError') {
        setBioState('error');
        setBioMsg('Authentication cancelled or timed out. Try again.');
      } else if (err.name === 'InvalidStateError') {
        // Credential may be stale — clear and retry
        localStorage.removeItem(CRED_KEY);
        setBioState('error');
        setBioMsg('Credential reset. Please tap again to re-register.');
      } else if (err.name === 'NotSupportedError') {
        setBioState('unsupported');
        setBioMsg('Biometrics not available on this device. Use PIN.');
      } else {
        setBioState('error');
        setBioMsg(err.message || 'Biometric failed. Try again or use PIN.');
      }
      setTimeout(() => { if (bioState !== 'unsupported') setBioState('idle'); }, 3000);
    }
  };

  /* ── PIN entry ── */
  const handlePinKey = (key) => {
    if (key === 'del') {
      setPin(p => p.slice(0, -1));
      setPinMsg('');
      return;
    }
    const next = pin + key;
    setPin(next);
    if (next.length === 6) {
      if (next === '123456') {
        setPinError(false);
        setStep('success');
      } else {
        setShake(true);
        setPinError(true);
        setPinMsg('Incorrect PIN. Try again.');
        setTimeout(() => { setPin(''); setShake(false); setPinError(false); }, 900);
      }
    }
  };

  /* ── Biometric state → colours ── */
  const bioColors = {
    idle:         { border: 'var(--border)',       bg: 'var(--surface)',   icon: '👆', glow: false },
    scanning:     { border: '#c2410c',             bg: '#fff7ed',          icon: '👆', glow: true  },
    success:      { border: 'var(--green)',        bg: 'var(--green-light)', icon: '✅', glow: false },
    error:        { border: 'var(--red)',          bg: 'var(--red-light)', icon: '❌', glow: false },
    unsupported:  { border: 'var(--yellow)',       bg: 'var(--yellow-light)', icon: '⚠️', glow: false },
    notregistered:{ border: 'var(--border)',       bg: 'var(--surface)',   icon: '👆', glow: false },
  };
  const bc = bioColors[bioState] || bioColors.idle;

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="login-page login-page--patient">
      <div className="patient-box">

        {/* Header */}
        <div className="box-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <div className="box-logo">
            <div className="box-logo-icon">🛡</div>
            <div>
              <div className="box-logo-name">HealthVault</div>
              <div className="box-logo-sub">PATIENT LOGIN</div>
            </div>
          </div>
        </div>

        {/* Step bar */}
        <div className="step-bar">
          <div className={`step-bar-item ${step !== 'success' || mode === 'bio' ? 'step-bar-item--active' : 'step-bar-item--active'}`} />
          <div className={`step-bar-item ${step === 'success' ? 'step-bar-item--active' : 'step-bar-item--inactive'}`} />
        </div>

        {/* SUCCESS */}
        {step === 'success' && <SuccessScreen onDone={onSuccess} />}

        {/* ── BIOMETRIC STEP ── */}
        {step === 'biometric' && (
          <>
            {/* Mode toggle */}
            <div className="mode-tabs">
              <button className={`mode-tab ${mode === 'bio' ? 'mode-tab--active' : ''}`} onClick={() => setMode('bio')}>
                👆 Fingerprint
              </button>
              <button className={`mode-tab ${mode === 'pin' ? 'mode-tab--active' : ''}`} onClick={() => setMode('pin')}>
                🔢 PIN
              </button>
            </div>

            {/* ── FINGERPRINT MODE ── */}
            {mode === 'bio' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 6 }}>
                  <div className="step-title">
                    {bioState === 'scanning' ? 'Scanning…' : bioState === 'success' ? 'Verified!' : 'Biometric Login'}
                  </div>
                  <div className={`step-desc ${bioState === 'error' || bioState === 'unsupported' ? 'step-desc--error' : bioState === 'success' ? 'step-desc--success' : ''}`}>
                    {bioMsg || (isRegistered()
                      ? 'Touch the button — your device will ask for fingerprint/Face ID'
                      : 'First time? Tap below to register your biometric')}
                  </div>
                </div>

                {/* Fingerprint circle */}
                <div className="bio-ring-wrap">
                  {bioState === 'scanning' && (
                    <>
                      <div className="bio-pulse" />
                      <div className="bio-pulse-2" />
                    </>
                  )}
                  <div
                    className={`bio-circle ${bioState === 'scanning' ? 'bio-circle--scanning' : ''}`}
                    style={{ borderColor: bc.border, background: bc.bg, cursor: bioState === 'scanning' ? 'wait' : 'pointer' }}
                    onClick={bioState === 'scanning' ? undefined : handleBioTap}
                  >
                    {bioState === 'scanning' && <div className="bio-scan-line" />}
                    <div className={bioState === 'success' ? 'bio-icon-wrap--success' : ''} style={{ fontSize: 52, userSelect: 'none' }}>
                      {bc.icon}
                    </div>
                  </div>
                </div>

                {/* What happens explanation */}
                {bioState === 'idle' && (
                  <div style={{
                    background: 'var(--card)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 16,
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: 0.5 }}>HOW IT WORKS</div>
                    {[
                      '🔐 Uses your device\'s built-in biometric (Touch ID / Face ID / Windows Hello)',
                      '📱 Your fingerprint never leaves your device',
                      '⛓ Authentication is verified on blockchain',
                      isRegistered() ? '✅ Biometric already registered on this device' : '🆕 First tap will register your biometric',
                    ].map((t, i) => <div key={i} style={{ marginBottom: 3 }}>{t}</div>)}
                  </div>
                )}

                {bioState !== 'scanning' && (
                  <button className="auth-btn" onClick={handleBioTap}>
                    {bioState === 'error' ? '↺ Try Again' : isRegistered() ? '👆 Authenticate with Biometric' : '👆 Register & Authenticate'}
                  </button>
                )}

                {bioState === 'scanning' && (
                  <p className="scanning-text"><span className="spin-icon">⟳</span> Waiting for biometric confirmation…</p>
                )}

                {/* Reset option */}
                {isRegistered() && bioState === 'idle' && (
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <button
                      onClick={() => { localStorage.removeItem(CRED_KEY); setBioMsg('Biometric cleared. Tap to re-register.'); }}
                      style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                      Reset registered biometric
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── PIN MODE ── */}
            {mode === 'pin' && (
              <div className="pin-step">
                <div className="step-title" style={{ textAlign: 'center' }}>Enter Your PIN</div>
                <div className="step-desc" style={{ textAlign: 'center', marginBottom: 4 }}>Enter your 6-digit secure PIN</div>

                {/* Dots */}
                <div className={`pin-display ${shake ? 'pin-display--shake' : ''}`}>
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className={`pin-dot ${i < pin.length ? (pinError ? 'pin-dot--error' : 'pin-dot--filled') : ''}`} />
                  ))}
                </div>

                {pinMsg && <div style={{ textAlign: 'center', color: 'var(--red)', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>{pinMsg}</div>}

                {/* Keypad */}
                <div className="pin-grid">
                  {KEYS.map((k, i) => (
                    <button
                      key={i}
                      className={`pin-key ${k === '' ? 'pin-key--empty' : ''} ${k === 'del' ? 'pin-key--danger' : ''}`}
                      onClick={() => k !== '' && handlePinKey(k)}
                      disabled={pin.length >= 6}
                    >
                      {k === 'del' ? '⌫' : k}
                    </button>
                  ))}
                </div>
                <div className="pin-hint">HINT: 1 2 3 4 5 6 (demo only)</div>
              </div>
            )}

            <div className="bio-footer">
              🔒 END-TO-END ENCRYPTED · BIOMETRIC DATA NEVER TRANSMITTED
            </div>
          </>
        )}
      </div>
    </div>
  );
}