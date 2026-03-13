import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { formatDate } from '../../lib/format';

export default function DoctorDashboard({ session, onLogout, onSessionExpired }) {
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      const data = await apiRequest('/doctors/me/dashboard', { token: session.token });
      setDashboard(data);
    } catch (requestError) {
      if (requestError.status === 401) {
        onSessionExpired?.();
        return;
      }
      setError(requestError.message);
    }
  };

  const searchPatients = async (query = search) => {
    try {
      const data = await apiRequest(`/doctors/patients/search?q=${encodeURIComponent(query)}`, { token: session.token });
      setPatients(data.items || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openPatient = async (patientId) => {
    try {
      const [profile, recordData] = await Promise.all([
        apiRequest(`/doctors/patients/${patientId}/profile`, { token: session.token }),
        apiRequest(`/doctors/patients/${patientId}/records`, { token: session.token }),
      ]);
      setSelectedPatient(profile);
      setRecords(recordData.items || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadDashboard();
    searchPatients('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8' }}>
      <div style={{ background: '#fff', borderBottom: '1.5px solid #e7e5e4', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#1c1917' }}>HealthVault Clinical Portal</div>
          <div style={{ fontSize: 10, color: '#a8a29e' }}>Live doctor dashboard</div>
        </div>
        <button onClick={onLogout} style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid #e7e5e4', background: 'transparent', color: '#78716c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        {error ? <div className="card" style={{ marginBottom: 16 }}>{error}</div> : null}

        {dashboard ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', letterSpacing: 1, marginBottom: 10 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
              </div>
              <h1 style={{ fontSize: 40, fontWeight: 400, color: '#1c1917', lineHeight: 1.15, fontFamily: 'Georgia, serif' }}>
                Dr. {dashboard.profile.firstName} {dashboard.profile.lastName}
              </h1>
              <div style={{ color: '#6b7280', marginTop: 8 }}>{dashboard.profile.specialty} · {dashboard.profile.hospital?.name || 'Hospital not set'}</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                ['Active Grants', dashboard.stats.activeAccessGrants],
                ['Uploaded Records', dashboard.stats.uploadedRecords],
                ['Verifications', dashboard.stats.verifications],
              ].map(([label, value]) => (
                <div key={label} style={{ background: '#fff', borderRadius: 16, padding: '16px 22px', textAlign: 'center', minWidth: 120 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#1c1917', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#a8a29e', marginTop: 5, letterSpacing: 0.5 }}>{label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        ) : <div className="card" style={{ marginBottom: 20 }}>Loading dashboard...</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="card-title">Patient search</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by patient name, code, or email" />
                <button className="btn btn-outline" onClick={() => searchPatients()}>Search</button>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Search results</div>
              {(patients || []).map((patient) => (
                <div key={patient.id} style={{ padding: '12px 0', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{patient.firstName} {patient.lastName}</div>
                    <div className="card-sub">{patient.patientCode} · {patient.email}</div>
                    <div className="card-sub">Records: {patient.stats.totalRecords} · Claims: {patient.stats.totalClaims}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => openPatient(patient.id)}>Open</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Patient workspace</div>
            {selectedPatient ? (
              <>
                <div style={{ marginTop: 12, fontWeight: 700 }}>{selectedPatient.profile.firstName} {selectedPatient.profile.lastName}</div>
                <div className="card-sub">{selectedPatient.profile.patientCode} · {selectedPatient.profile.email}</div>
                <div className="card-sub">Access reason: {selectedPatient.access.reason}</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedPatient.access.scopes.map((scope) => <span key={scope} className="tag tag-gray">{scope}</span>)}
                </div>

                <div style={{ marginTop: 18 }}>
                  <div className="card-title">Medical records</div>
                  {records.map((record) => (
                    <div key={record.id} style={{ padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
                      <div style={{ fontWeight: 700 }}>{record.title}</div>
                      <div className="card-sub">{record.recordType} · {record.verificationStatus} · {formatDate(record.createdAt)}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="card-sub" style={{ marginTop: 12 }}>Open a patient to load their consented profile and records.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
