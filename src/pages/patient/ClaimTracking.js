import React, { useEffect, useState } from 'react';
import { apiRequest, downloadFile } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';

const STATUS_STAGES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCS_VERIFIED', 'APPROVED', 'DISBURSED'];

function StageTracker({ status }) {
  const activeIndex = Math.max(STATUS_STAGES.indexOf(status), 0);

  return (
    <div className="stage-track">
      <div className="stage-connector" />
      <div className="stage-fill" style={{ width: `${(activeIndex / Math.max(STATUS_STAGES.length - 1, 1)) * 86}%` }} />
      {STATUS_STAGES.map((stage, index) => (
        <div key={stage} className="stage-item">
          <div className={`stage-dot ${index < activeIndex ? 'stage-dot--done' : index === activeIndex ? 'stage-dot--active' : 'stage-dot--pending'}`}>
            {index < activeIndex ? '✓' : index + 1}
          </div>
          <div className="stage-label">{stage.replaceAll('_', ' ')}</div>
        </div>
      ))}
    </div>
  );
}

export default function ClaimTracking({ session, onSessionExpired }) {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', amountClaimed: '', insurancePolicyId: '' });
  const [documentFiles, setDocumentFiles] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [claimData, policyData] = await Promise.all([
        apiRequest('/claims/me', { token: session.token }),
        apiRequest('/insurance/me/policies', { token: session.token }),
      ]);
      setClaims(claimData.items || []);
      setPolicies(policyData.items || []);
      setForm((current) => ({
        ...current,
        insurancePolicyId: current.insurancePolicyId || policyData.items?.[0]?.id || '',
      }));
    } catch (requestError) {
      if (requestError.status === 401) {
        onSessionExpired?.();
        return;
      }

      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createClaim = async () => {
    try {
      await apiRequest('/claims/me', {
        method: 'POST',
        token: session.token,
        body: {
          title: form.title,
          amountClaimed: form.amountClaimed,
          insurancePolicyId: form.insurancePolicyId || null,
          status: 'SUBMITTED',
        },
      });
      setForm({ title: '', amountClaimed: '', insurancePolicyId: policies[0]?.id || '' });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const uploadDocument = async (claimId) => {
    const file = documentFiles[claimId];

    if (!file) {
      setError('Choose a claim document first.');
      return;
    }

    const payload = new FormData();
    payload.append('file', file);

    try {
      await apiRequest(`/claims/me/${claimId}/documents`, {
        method: 'POST',
        token: session.token,
        body: payload,
      });
      setDocumentFiles((current) => ({ ...current, [claimId]: null }));
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">Claim Tracking</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{claims.length} claims loaded from the backend</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Create a claim</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <input className="input" placeholder="Claim title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <input className="input" placeholder="Amount claimed" value={form.amountClaimed} onChange={(event) => setForm((current) => ({ ...current, amountClaimed: event.target.value }))} />
          <select className="input" value={form.insurancePolicyId} onChange={(event) => setForm((current) => ({ ...current, insurancePolicyId: event.target.value }))}>
            <option value="">No policy</option>
            {policies.map((policy) => <option key={policy.id} value={policy.id}>{policy.providerName} · {policy.planName}</option>)}
          </select>
          <button className="btn btn-primary" onClick={createClaim}>Submit claim</button>
        </div>
      </div>

      {error ? <div className="card" style={{ marginBottom: 16 }}>{error}</div> : null}
      {loading ? <div className="card">Loading claims...</div> : null}

      {claims.map((claim) => (
        <div key={claim.id} className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#667eea', background: '#e0e7ff', padding: '2px 8px', borderRadius: 6 }}>{claim.claimNumber}</span>
                <span className="tag tag-gray">{claim.status}</span>
              </div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{claim.title}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Filed: {formatDate(claim.createdAt)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{formatCurrency(claim.amountClaimed)}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Claim amount</div>
            </div>
          </div>
          <StageTracker status={claim.status} />
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            {claim.documents.map((document) => (
              <div key={document.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12 }}>{document.originalName} · {formatDate(document.uploadedAt)}</span>
                <button className="btn btn-outline btn-sm" onClick={() => downloadFile(`/claims/me/${claim.id}/documents/${document.id}/download`, { token: session.token, filename: document.originalName })}>Download</button>
              </div>
            ))}
            <input type="file" onChange={(event) => setDocumentFiles((current) => ({ ...current, [claim.id]: event.target.files?.[0] || null }))} />
            <button className="btn btn-outline btn-sm" onClick={() => uploadDocument(claim.id)}>Upload document</button>
          </div>
        </div>
      ))}
    </div>
  );
}
