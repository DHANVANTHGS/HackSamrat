import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { formatDate } from '../../lib/format';

const SCOPES = ['FULL_RECORDS', 'PRESCRIPTIONS', 'IMAGING', 'INSURANCE', 'CLAIMS'];

export default function AccessControl({ session, onSessionExpired }) {
  const [grants, setGrants] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [query, setQuery] = useState('doctor');
  const [form, setForm] = useState({ doctorUserId: '', scope: 'FULL_RECORDS', expiresAt: '' });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await apiRequest('/access-grants/me', { token: session.token });
      setGrants(data.items || []);
    } catch (requestError) {
      if (requestError.status === 401) {
        onSessionExpired?.();
        return;
      }
      setError(requestError.message);
    }
  };

  const searchDoctors = async () => {
    try {
      const data = await apiRequest(`/access-grants/doctors/search?q=${encodeURIComponent(query)}`, { token: session.token });
      setDirectory(data.items || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    load();
    searchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revoke = async (grantId) => {
    await apiRequest(`/access-grants/me/${grantId}`, { method: 'DELETE', token: session.token });
    load();
  };

  const create = async () => {
    await apiRequest('/access-grants/me', {
      method: 'POST',
      token: session.token,
      body: {
        doctorUserId: form.doctorUserId,
        scope: form.scope,
        expiresAt: form.expiresAt || null,
      },
    });
    setForm({ doctorUserId: '', scope: 'FULL_RECORDS', expiresAt: '' });
    load();
  };

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">Access Control</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Manage patient-to-doctor consent grants</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">Grant access</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="input" placeholder="Search doctors" value={query} onChange={(event) => setQuery(event.target.value)} />
            <button className="btn btn-outline" onClick={searchDoctors}>Search</button>
          </div>
          <select className="input" value={form.doctorUserId} onChange={(event) => setForm((current) => ({ ...current, doctorUserId: event.target.value }))}>
            <option value="">Select a doctor</option>
            {directory.map((doctor) => <option key={doctor.userId} value={doctor.userId}>{doctor.firstName} {doctor.lastName} · {doctor.specialty}</option>)}
          </select>
          <select className="input" value={form.scope} onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))}>
            {SCOPES.map((scope) => <option key={scope} value={scope}>{scope}</option>)}
          </select>
          <input className="input" type="datetime-local" value={form.expiresAt} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} />
          <button className="btn btn-primary" onClick={create} disabled={!form.doctorUserId}>Create grant</button>
        </div>
      </div>

      {error ? <div className="card" style={{ marginBottom: 18 }}>{error}</div> : null}

      {grants.map((grant) => (
        <div key={grant.id} className="access-card">
          <div className="access-avatar" style={{ background: '#dbeafe', color: '#374151' }}>{grant.doctor?.firstName?.slice(0, 1) || 'D'}</div>
          <div style={{ flex: 1 }}>
            <div className="access-name">Dr. {grant.doctor?.firstName} {grant.doctor?.lastName}</div>
            <div className="access-role">{grant.doctor?.specialty} · {grant.scope}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Expires: {grant.expiresAt ? formatDate(grant.expiresAt) : 'No expiry'} · Status: {grant.status}</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => revoke(grant.id)}>Revoke</button>
        </div>
      ))}
    </div>
  );
}
