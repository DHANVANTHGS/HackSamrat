import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest, downloadFile } from '../../lib/api';
import { formatDate } from '../../lib/format';

const FILTERS = ['ALL', 'REPORT', 'PRESCRIPTION', 'LAB_RESULT', 'IMAGING', 'DISCHARGE_SUMMARY', 'OTHER'];

export default function MedicalRecords({ session, onSessionExpired }) {
  const [filter, setFilter] = useState('ALL');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', recordType: 'REPORT', description: '' });
  const fileRef = useRef(null);

  const loadRecords = async (nextFilter = filter) => {
    setLoading(true);
    setError('');

    try {
      const query = nextFilter === 'ALL' ? '' : `?recordType=${encodeURIComponent(nextFilter)}`;
      const data = await apiRequest(`/patients/me/records${query}`, { token: session.token });
      setRecords(data.items || []);
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
    loadRecords(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const submitUpload = async () => {
    const files = fileRef.current?.files;

    if (!files?.length || !form.title.trim()) {
      setError('Title and at least one file are required.');
      return;
    }

    setUploading(true);
    setError('');

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('recordType', form.recordType);
    payload.append('description', form.description);

    Array.from(files).forEach((file) => payload.append('files', file));

    try {
      await apiRequest('/patients/me/records', {
        method: 'POST',
        token: session.token,
        body: payload,
      });
      setForm({ title: '', recordType: 'REPORT', description: '' });
      fileRef.current.value = '';
      await loadRecords(filter);
    } catch (requestError) {
      if (requestError.status === 401) {
        onSessionExpired?.();
        return;
      }

      setError(requestError.message);
    } finally {
      setUploading(false);
    }
  };

  const summary = useMemo(() => `${records.length} records loaded from the backend`, [records.length]);

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">My Medical Records</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{summary}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              background: filter === item ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'white',
              color: filter === item ? 'white' : '#6b7280',
            }}
          >
            {item === 'ALL' ? 'All' : item}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">Upload a record</div>
        <div className="card-sub">This uses the live multipart upload endpoint.</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <input className="input" placeholder="Record title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <select className="input" value={form.recordType} onChange={(event) => setForm((current) => ({ ...current, recordType: event.target.value }))}>
            {FILTERS.filter((item) => item !== 'ALL').map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <textarea className="input" placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <input ref={fileRef} type="file" multiple />
          <button className="btn btn-primary" onClick={submitUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload record'}</button>
        </div>
      </div>

      {error ? <div className="card" style={{ marginBottom: 18 }}>{error}</div> : null}
      {loading ? <div className="card">Loading records...</div> : null}

      <div className="grid-3" style={{ gap: 14 }}>
        {records.map((record) => (
          <div key={record.id} className="doc-card">
            <div className="doc-name">{record.title}</div>
            <div className="doc-meta">{formatDate(record.createdAt)} · {record.recordType}</div>
            <span className="tag tag-gray">{record.verificationStatus}</span>
            <div style={{ marginTop: 12 }}>
              {record.files.map((file) => (
                <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 12 }}>{file.originalName}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => downloadFile(`/patients/me/records/${record.id}/files/${file.id}/download`, {
                      token: session.token,
                      filename: file.originalName,
                    })}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
