import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';

export default function InsurancePanel({ session, onSessionExpired }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    apiRequest('/insurance/me/summary', { token: session.token })
      .then((data) => {
        if (active) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch((requestError) => {
        if (requestError.status === 401) {
          onSessionExpired?.();
          return;
        }

        if (active) {
          setError(requestError.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [onSessionExpired, session.token]);

  if (loading) {
    return <div className="card">Loading insurance data...</div>;
  }

  if (error) {
    return <div className="card">{error}</div>;
  }

  const policies = summary?.policies || [];
  const primary = policies[0];

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">Insurance Intelligence</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{summary.activePolicies} active policies</div>
        </div>
      </div>

      {primary ? (
        <div className="grid-2" style={{ marginBottom: 20, gap: 18 }}>
          <div className="ins-card" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
            <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 700, letterSpacing: 1 }}>{primary.providerName.toUpperCase()}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 42, fontWeight: 900, margin: '8px 0 4px', lineHeight: 1 }}>
              {formatCurrency(primary.coverageLimit)}
            </div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{primary.planName}</div>
            <div style={{ marginTop: 18, fontSize: 12 }}>Used coverage: {formatCurrency(primary.usedCoverage)}</div>
            <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
              <div><div style={{ fontSize: 10, opacity: 0.7 }}>VALID TO</div><div style={{ fontSize: 14, fontWeight: 700 }}>{formatDate(primary.validTo)}</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.7 }}>PREMIUM</div><div style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(primary.premiumAmount)}</div></div>
              <div><div style={{ fontSize: 10, opacity: 0.7 }}>POLICY NO.</div><div style={{ fontSize: 12, fontWeight: 600 }}>{primary.policyNumber}</div></div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Policy Benefits</div>
            <div className="card-sub">Backend-stored benefit usage</div>
            {primary.benefits.map((benefit) => {
              const percent = Math.min(100, Math.round((Number(benefit.usedAmount || 0) / Number(benefit.annualLimit || 1)) * 100));

              return (
                <div key={benefit.id} className="cov-row">
                  <div className="cov-header">
                    <span className="cov-name">{benefit.label}</span>
                    <span className="cov-val">{formatCurrency(benefit.usedAmount)} / {formatCurrency(benefit.annualLimit)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percent || 2}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{percent}% utilised</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : <div className="card">No policy found.</div>}

      <div className="card">
        <div className="card-title">All Policies</div>
        {policies.map((policy) => (
          <div key={policy.id} style={{ padding: '12px 0', borderTop: '1px solid #f3f4f6' }}>
            <div style={{ fontWeight: 700 }}>{policy.providerName} · {policy.planName}</div>
            <div className="card-sub">{policy.policyNumber} · valid until {formatDate(policy.validTo)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
