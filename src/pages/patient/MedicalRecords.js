import React, { useState } from 'react';

const DOCS = [
  { name: 'CBC Blood Report',      date: 'Feb 28, 2025', type: 'Lab',     size: '2.4 MB', verified: true,  icon: '🧪', color: '#dbeafe' },
  { name: 'Chest X-Ray',           date: 'Feb 15, 2025', type: 'Imaging', size: '8.1 MB', verified: true,  icon: '🩻', color: '#f3e8ff' },
  { name: 'Echocardiogram',        date: 'Jan 30, 2025', type: 'Cardio',  size: '1.8 MB', verified: true,  icon: '❤️', color: '#fff0f0' },
  { name: 'Dr. Patel Prescription',date: 'Jan 22, 2025', type: 'Rx',      size: '0.4 MB', verified: false, icon: '💊', color: '#fef9c3' },
  { name: 'Diabetes Panel',        date: 'Dec 10, 2024', type: 'Lab',     size: '1.2 MB', verified: true,  icon: '🧪', color: '#dbeafe' },
  { name: 'MRI Brain Scan',        date: 'Nov 5, 2024',  type: 'Imaging', size: '24 MB',  verified: true,  icon: '🩻', color: '#f3e8ff' },
];

const FILTERS = ['All', 'Lab', 'Imaging', 'Rx', 'Cardio'];

export default function MedicalRecords() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? DOCS : DOCS.filter(d => d.type === filter);

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">My Medical Records</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>47 documents · All blockchain-sealed</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline">📷 Scan Doc</button>
          <button className="btn btn-primary">⬆️ Upload</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: filter === f ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'white',
              color: filter === f ? 'white' : '#6b7280',
              fontWeight: filter === f ? 700 : 400, fontSize: 13,
              boxShadow: filter === f ? '0 2px 8px rgba(102,126,234,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Document grid */}
      <div className="grid-3" style={{ gap: 14 }}>
        {filtered.map((doc, i) => (
          <div key={i} className="doc-card">
            <div className="doc-icon" style={{ background: doc.color }}>{doc.icon}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="doc-name">{doc.name}</div>
                <div className="doc-meta">{doc.date} · {doc.size}</div>
              </div>
              <span className={`tag ${doc.verified ? 'tag-green' : 'tag-yellow'}`}>
                {doc.verified ? '✓ Verified' : '⏳ Pending'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {doc.verified && (
                <span style={{ fontSize: 10, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                  ⛓ Blockchain
                </span>
              )}
              <span className="tag tag-gray">{doc.type}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>👁 View</button>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>⬇️ Save</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}