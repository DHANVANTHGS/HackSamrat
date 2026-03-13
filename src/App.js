import React, { useEffect, useState } from 'react';
import UserLogin from './pages/UserLogin';
import DoctorLogin from './pages/DoctorLogin';
import PatientLayout from './components/PatientLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import { apiRequest, clearSession, loadSession, saveSession } from './lib/api';
import './App.css';

const getScreenForSession = (session) => {
  const role = session?.user?.role;

  if (role === 'PATIENT') {
    return 'patient-app';
  }

  if (role === 'DOCTOR' || role === 'ADMIN') {
    return 'doctor-app';
  }

  return 'select';
};

export default function App() {
  const [session, setSession] = useState(() => loadSession());
  const [screen, setScreen] = useState(() => getScreenForSession(loadSession()));

  useEffect(() => {
    setScreen(getScreenForSession(session));
  }, [session]);

  const handleAuthSuccess = (nextSession) => {
    saveSession(nextSession);
    setSession(nextSession);
  };

  const handleLogout = async () => {
    try {
      if (session?.token) {
        await apiRequest('/auth/logout', { method: 'POST', token: session.token });
      }
    } catch (error) {
      console.warn('Logout request failed, clearing local session anyway.', error);
    } finally {
      clearSession();
      setSession(null);
      setScreen('select');
    }
  };

  if (screen === 'user-login') {
    return <UserLogin onBack={() => setScreen('select')} onSuccess={handleAuthSuccess} />;
  }

  if (screen === 'doctor-login') {
    return <DoctorLogin onBack={() => setScreen('select')} onSuccess={handleAuthSuccess} />;
  }

  if (screen === 'patient-app' && session) {
    return <PatientLayout session={session} onSessionChange={handleAuthSuccess} onSessionExpired={handleLogout} onLogout={handleLogout} />;
  }

  if (screen === 'doctor-app' && session) {
    return <DoctorDashboard session={session} onSessionChange={handleAuthSuccess} onSessionExpired={handleLogout} onLogout={handleLogout} />;
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-logo">
          <span>Health</span>
        </div>
        <h1 className="landing-title">HealthVault</h1>
        <p className="landing-sub">Live backend-connected patient and doctor workspace</p>

        <div className="landing-cards">
          <div className="landing-card" onClick={() => setScreen('user-login')}>
            <div className="lc-title">Patient Access</div>
            <div className="lc-desc">Sign in with your registered biometric and load your live dashboard</div>
            <button className="lc-btn lc-btn--blue">Continue as Patient</button>
          </div>

          <div className="landing-card" onClick={() => setScreen('doctor-login')}>
            <div className="lc-title">Doctor Access</div>
            <div className="lc-desc">Sign in with backend-issued credentials and access consented records</div>
            <button className="lc-btn lc-btn--green">Continue as Doctor</button>
          </div>
        </div>

        <p className="landing-note">Backend APIs, audit trails, AI grounding, and access control are now live.</p>
      </div>
    </div>
  );
}
