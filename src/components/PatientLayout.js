import React, { useEffect, useState } from 'react';
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
import { apiRequest } from '../lib/api';

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

export default function PatientLayout({ session, onLogout, onSessionExpired }) {
  const [page, setPage] = useState('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);
  const PageComponent = PAGES[page] || Dashboard;

  useEffect(() => {
    let active = true;

    const loadUnread = async () => {
      try {
        const summary = await apiRequest('/notifications/me/unread-summary', {
          token: session.token,
        });

        if (active) {
          setUnreadCount(summary.unreadCount || 0);
        }
      } catch (error) {
        if (error.status === 401) {
          onSessionExpired?.();
        }
      }
    };

    loadUnread();
    const timer = window.setInterval(loadUnread, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [onSessionExpired, session.token]);

  return (
    <div className="app-shell">
      <Sidebar
        active={page}
        onNavigate={setPage}
        onLogout={onLogout}
        unreadCount={unreadCount}
        user={{
          name: `${session.user.firstName} ${session.user.lastName}`.trim(),
          patientId: session.user.patientId,
          role: session.user.role,
        }}
      />
      <div className="main-content">
        <TopBar
          page={page}
          notifications={unreadCount}
          user={{
            firstName: session.user.firstName,
            lastName: session.user.lastName,
          }}
        />
        <div className="page-body">
          <PageComponent session={session} onSessionExpired={onSessionExpired} onNotificationsChange={setUnreadCount} />
        </div>
      </div>
    </div>
  );
}
