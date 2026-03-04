import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Dashboard from '../pages/patient/Dashboard';
import MedicalRecords from '../pages/patient/MedicalRecords';
import AccessControl from '../pages/patient/AccessControl';
import InsurancePanel from '../pages/patient/InsurancePanel';
import AIAssistant from '../pages/patient/AIAssistant';
import ClaimTracking from '../pages/patient/ClaimTracking';
import EmergencyAccess from '../pages/patient/EmergencyAccess';
import Notifications from '../pages/patient/Notifications';

const PAGES = {
  dashboard: Dashboard,
  records: MedicalRecords,
  access: AccessControl,
  insurance: InsurancePanel,
  ai: AIAssistant,
  claims: ClaimTracking,
  emergency: EmergencyAccess,
  notifications: Notifications,
};

export default function PatientLayout({ onLogout }) {
  const [page, setPage] = useState('dashboard');
  const PageComponent = PAGES[page] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar active={page} onNavigate={setPage} onLogout={onLogout} />
      <div className="main-content">
        <TopBar page={page} />
        <div className="page-body">
          <PageComponent />
        </div>
      </div>
    </div>
  );
}