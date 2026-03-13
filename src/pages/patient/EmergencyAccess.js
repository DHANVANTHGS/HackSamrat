import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export default function EmergencyAccess({ session, onSessionExpired }) {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await apiRequest('/emergency/me', { token: session.token });
      setSettings(data);
    } catch (requestError) {
      if (requestError.status === 401) {
        onSessionExpired?.();
        return;
      }
      setError(requestError.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = async (changes) => {
    try {
      const data = await apiRequest('/emergency/me', {
        method: 'PATCH',
        token: session.token,
        body: {
          ...settings,
          ...changes,
        },
      });
      setSettings(data);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (!settings) {
    return <div className="card">Loading emergency settings...</div>;
  }

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">Emergency Access</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Backend-controlled critical access rules for verified clinicians</div>
        </div>
      </div>

      {error ? <div className="card" style={{ marginBottom: 16 }}>{error}</div> : null}

      <div className="grid-2" style={{ gap: 18 }}>
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 12, fontSize: 15 }}>Current policy</div>
          <div style={{ display: 'grid', gap: 8, color: '#374151' }}>
            <div>Enabled: {settings.enabled ? 'Yes' : 'No'}</div>
            <div>Critical only: {settings.allowCriticalOnly ? 'Yes' : 'No'}</div>
            <div>Unlock window: {settings.unlockWindowMinutes} minutes</div>
            <div>Notes: {settings.notes || 'None'}</div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Update settings</div>
          <div className="toggle-wrap">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>Enable emergency access</div>
            </div>
            <input type="checkbox" checked={settings.enabled} onChange={(event) => update({ enabled: event.target.checked })} />
          </div>
          <div className="toggle-wrap">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>Allow critical data only</div>
            </div>
            <input type="checkbox" checked={settings.allowCriticalOnly} onChange={(event) => update({ allowCriticalOnly: event.target.checked })} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Unlock window (minutes)</label>
            <input className="input" type="number" value={settings.unlockWindowMinutes} onChange={(event) => setSettings((current) => ({ ...current, unlockWindowMinutes: event.target.value }))} />
            <button className="btn btn-primary" onClick={() => update({ unlockWindowMinutes: Number(settings.unlockWindowMinutes) })}>Save window</button>
          </div>
        </div>
      </div>
    </div>
  );
}
