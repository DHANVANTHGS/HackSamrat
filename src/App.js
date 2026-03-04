import React, { useState } from 'react';
import UserLogin from './pages/UserLogin';
import DoctorLogin from './pages/DoctorLogin';
import PatientLayout from './components/PatientLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('select');
  // 'select' | 'user-login' | 'doctor-login' | 'patient-app' | 'doctor-app'

  if (screen === 'user-login')
    return <UserLogin onBack={() => setScreen('select')} onSuccess={() => setScreen('patient-app')} />;
  if (screen === 'doctor-login')
    return <DoctorLogin onBack={() => setScreen('select')} onSuccess={() => setScreen('doctor-app')} />;
  if (screen === 'patient-app')
    return <PatientLayout onLogout={() => setScreen('select')} />;
  if (screen === 'doctor-app')
    return <DoctorDashboard onLogout={() => setScreen('select')} />;

  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-logo">
          <span>❤️</span>
        </div>
        <h1 className="landing-title">HealthVault</h1>
        <p className="landing-sub">Your health, secured and simplified</p>

        <div className="landing-cards">
          <div className="landing-card" onClick={() => setScreen('user-login')}>
            <div className="lc-icon">🧑‍💼</div>
            <div className="lc-title">I'm a Patient</div>
            <div className="lc-desc">Access your records, insurance & health data</div>
            <button className="lc-btn lc-btn--blue">Continue as Patient →</button>
          </div>

          <div className="landing-card" onClick={() => setScreen('doctor-login')}>
            <div className="lc-icon">👨‍⚕️</div>
            <div className="lc-title">I'm a Doctor</div>
            <div className="lc-desc">Access patient records & clinical tools</div>
            <button className="lc-btn lc-btn--green">Continue as Doctor →</button>
          </div>
        </div>

        <p className="landing-note">🔒 End-to-end encrypted · Blockchain verified · HIPAA compliant</p>
      </div>
    </div>
  );
}