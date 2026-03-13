import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { formatCurrency, formatDate, fullName } from '../../lib/format';

export default function Dashboard({ session, onSessionExpired }) {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    let active = true;

    apiRequest('/patients/me/dashboard', { token: session.token })
      .then((data) => {
        if (active) {
          setState({ loading: false, error: '', data });
        }
      })
      .catch((error) => {
        if (error.status === 401) {
          onSessionExpired?.();
          return;
        }

        if (active) {
          setState({ loading: false, error: error.message, data: null });
        }
      });

    return () => {
      active = false;
    };
  }, [onSessionExpired, session.token]);

  if (state.loading) {
    return <div className="card">Loading dashboard...</div>;
  }

  if (state.error) {
    return <div className="card">{state.error}</div>;
  }

  const { profile, stats, recentRecords, recentClaims, insurancePolicies, emergencyAccess } = state.data;
  const primaryPolicy = insurancePolicies[0];

  return (
    <div className="page-fade">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 26, fontWeight: 800, color: '#1a1a2e' }}>
          Welcome, {fullName(profile)}
        </div>
        <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
          Live overview from your backend profile, records, claims, and insurance data.
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 22 }}>
        {[
          ['Records', stats.totalRecords],
          ['Claims', stats.totalClaims],
          ['Active Policies', stats.activePolicies],
          ['Emergency', emergencyAccess?.enabled ? 'Enabled' : 'Disabled'],
        ].map(([label, value]) => (
          <div key={label} className="stat-card">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-title">Recent Records</div>
          <div className="card-sub">Latest entries from your medical timeline</div>
          <div className="timeline">
            {recentRecords.length ? recentRecords.map((record) => (
              <div key={record.id} className="timeline-item">
                <div className="tl-line">
                  <div className="tl-dot" style={{ background: '#667eea' }} />
                </div>
                <div className="tl-content">
                  <div className="tl-date">{formatDate(record.createdAt)}</div>
                  <div className="tl-title">{record.title}</div>
                  <div className="tl-sub">{record.recordType} · {record.verificationStatus} · {record.fileCount} files</div>
                </div>
              </div>
            )) : <div className="tl-sub">No records yet.</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Insurance Snapshot</div>
          {primaryPolicy ? (
            <>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 28, fontWeight: 800 }}>
                {formatCurrency(primaryPolicy.coverageLimit)}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                {primaryPolicy.providerName} · {primaryPolicy.planName}
              </div>
              <div style={{ marginTop: 12, color: '#374151', fontSize: 13 }}>
                Used: {formatCurrency(primaryPolicy.usedCoverage)}
              </div>
              <div style={{ color: '#374151', fontSize: 13 }}>
                Valid to: {formatDate(primaryPolicy.validTo)}
              </div>
            </>
          ) : (
            <div className="card-sub">No insurance policy found.</div>
          )}

          <div style={{ marginTop: 18 }}>
            <div className="card-title">Recent Claims</div>
            {recentClaims.length ? recentClaims.map((claim) => (
              <div key={claim.id} style={{ padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontWeight: 700 }}>{claim.title}</div>
                <div className="card-sub">{claim.claimNumber} · {claim.status} · {formatCurrency(claim.amountClaimed)}</div>
              </div>
            )) : <div className="card-sub">No claims yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
