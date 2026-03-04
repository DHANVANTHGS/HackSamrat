import React, { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════
   PATIENT DATA
═══════════════════════════════════════════════════ */
const PATIENTS = [
  {
    id: 'PID-2847-MHVX',
    name: 'Aarav Sharma',
    age: 38, gender: 'Male', blood: 'O+',
    lastVisit: 'Today, 10:30 AM',
    reason: 'Post-surgery follow-up',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    medications: ['Metformin 500mg', 'Amlodipine 5mg'],
    status: 'In Clinic', statusColor: 'green',
    phone: '+91 98765 43210',
    emergencyContact: { name: 'Priya Sharma', relation: 'Spouse', phone: '+91 91234 00001' },
    surgeries: [
      { name: 'Coronary Artery Bypass Graft (CABG)', date: 'Jan 15, 2025', hospital: 'Apollo Hospital', surgeon: 'Dr. Riya Patel', notes: 'Triple bypass, successful. Patient on anticoagulants post-op.' },
      { name: 'Appendectomy', date: 'Mar 10, 2019', hospital: 'Fortis Hospital', surgeon: 'Dr. Anil Mehta', notes: 'Laparoscopic. No complications.' },
    ],
    criticalNotes: 'Currently on Metformin — avoid contrast dye for imaging. Pacemaker implanted Jan 2025.',
    docs: [
      { name: 'CBC Blood Report',       date: 'Feb 28, 2025', type: 'Lab',     size: '2.4 MB', icon: '🧪', verified: true  },
      { name: 'Chest X-Ray',            date: 'Feb 15, 2025', type: 'Imaging', size: '8.1 MB', icon: '🩻', verified: true  },
      { name: 'Echocardiogram Report',  date: 'Jan 30, 2025', type: 'Cardio',  size: '1.8 MB', icon: '❤️', verified: true  },
      { name: 'Dr. Patel Prescription', date: 'Jan 22, 2025', type: 'Rx',      size: '0.4 MB', icon: '💊', verified: false },
    ],
  },
  {
    id: 'PID-1923-KLPQ',
    name: 'Meena Iyer',
    age: 54, gender: 'Female', blood: 'B+',
    lastVisit: 'Today, 11:15 AM',
    reason: 'Cardiac evaluation',
    conditions: ['Coronary Artery Disease', 'Hypothyroidism'],
    allergies: ['Aspirin'],
    medications: ['Atorvastatin 40mg', 'Thyroxine 50mcg'],
    status: 'Waiting', statusColor: 'yellow',
    phone: '+91 91234 56789',
    emergencyContact: { name: 'Raj Iyer', relation: 'Husband', phone: '+91 98765 11111' },
    surgeries: [
      { name: 'Angioplasty (PTCA)', date: 'Jun 8, 2023', hospital: 'Narayana Health', surgeon: 'Dr. S. Kumar', notes: 'Stent placed in LAD artery. On dual antiplatelet therapy.' },
    ],
    criticalNotes: 'Aspirin allergy — DO NOT administer. Stent in LAD — inform cardiologist before any surgery.',
    docs: [
      { name: 'ECG Report',    date: 'Mar 1, 2025',  type: 'Cardio', size: '0.8 MB', icon: '❤️', verified: true },
      { name: 'Thyroid Panel', date: 'Feb 20, 2025', type: 'Lab',    size: '1.1 MB', icon: '🧪', verified: true },
    ],
  },
  {
    id: 'PID-3381-BNRT',
    name: 'Rahul Desai',
    age: 29, gender: 'Male', blood: 'A+',
    lastVisit: 'Yesterday, 4:00 PM',
    reason: 'Chest pain — review',
    conditions: ['Anxiety Disorder'],
    allergies: ['None known'],
    medications: ['Propranolol 10mg'],
    status: 'Discharged', statusColor: 'muted',
    phone: '+91 99887 66554',
    emergencyContact: { name: 'Seema Desai', relation: 'Mother', phone: '+91 99887 00002' },
    surgeries: [],
    criticalNotes: 'No major surgical history. Anxiety disorder — avoid stimulants. Holter monitor in Feb showed occasional PVCs.',
    docs: [
      { name: 'Stress Test Report', date: 'Feb 27, 2025', type: 'Cardio',  size: '3.2 MB', icon: '❤️', verified: true  },
      { name: 'Holter Monitor',     date: 'Feb 25, 2025', type: 'Cardio',  size: '5.6 MB', icon: '❤️', verified: true  },
      { name: 'Discharge Summary',  date: 'Yesterday',    type: 'Summary', size: '0.6 MB', icon: '📋', verified: false },
    ],
  },
  {
    id: 'PID-4402-XMZY',
    name: 'Sunita Pillai',
    age: 67, gender: 'Female', blood: 'AB-',
    lastVisit: 'Mar 1, 2025',
    reason: 'Hypertension management',
    conditions: ['Hypertension Stage 2', 'Osteoarthritis'],
    allergies: ['Ibuprofen', 'Naproxen'],
    medications: ['Amlodipine 10mg', 'Losartan 50mg', 'Calcium 500mg'],
    status: 'Scheduled', statusColor: 'blue',
    phone: '+91 88776 55443',
    emergencyContact: { name: 'Arjun Pillai', relation: 'Son', phone: '+91 88776 00003' },
    surgeries: [
      { name: 'Total Knee Replacement (TKR) — Right', date: 'Sep 3, 2022', hospital: 'Manipal Hospital', surgeon: 'Dr. V. Rao', notes: 'Cemented prosthesis. Patient on calcium supplementation.' },
      { name: 'Hysterectomy', date: 'Nov 20, 2015', hospital: 'Apollo Hospital', surgeon: 'Dr. P. Nair', notes: 'Laparoscopic. Post-menopausal since procedure.' },
    ],
    criticalNotes: 'NSAID allergy (Ibuprofen, Naproxen) — use Paracetamol only for pain. AB- blood group — very rare, must confirm cross-match before transfusion.',
    docs: [
      { name: 'BP Monitoring Log',  date: 'Mar 1, 2025',  type: 'Cardio',  size: '0.3 MB', icon: '❤️', verified: true },
      { name: 'Joint X-Ray (Knee)', date: 'Feb 10, 2025', type: 'Imaging', size: '9.4 MB', icon: '🩻', verified: true },
    ],
  },
];

const STATUS_STYLE = {
  green:  { bg: '#dcfce7', color: '#166534', border: '#86efac' },
  yellow: { bg: '#fef9c3', color: '#854d0e', border: '#fcd34d' },
  blue:   { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  muted:  { bg: '#e7e5e4', color: '#57534e', border: '#d6d3d1' },
};

const DOC_TYPES = ['Prescription', 'Lab Results', 'Imaging Report', 'Discharge Summary', 'Diagnosis Note', 'Visit Summary', 'Consent Form'];

/* ═══════════════════════════════════════════════════
   UPLOAD MODAL
═══════════════════════════════════════════════════ */
function UploadModal({ patient, onClose }) {
  const [dragOver,  setDragOver]  = useState(false);
  const [files,     setFiles]     = useState([]);
  const [docType,   setDocType]   = useState('');
  const [notes,     setNotes]     = useState('');
  const [uploading, setUploading] = useState(false);
  const [done,      setDone]      = useState(false);

  const handleUpload = () => {
    if (!files.length || !docType) return;
    setUploading(true);
    setTimeout(() => { setUploading(false); setDone(true); }, 1800);
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(6px)',
    }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540, boxShadow: '0 40px 100px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ background: '#1c1917', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, color: '#a8a29e', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 6 }}>UPLOAD DOCUMENT</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{patient.name}</div>
            <div style={{ fontSize: 11, color: '#fb923c', fontFamily: 'monospace', marginTop: 3 }}>{patient.id}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #44403c', background: '#292524', cursor: 'pointer', color: '#a8a29e', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '26px 28px', background: '#fff' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', marginBottom: 8 }}>Document Uploaded!</div>
              <div style={{ fontSize: 13, color: '#78716c', marginBottom: 14 }}>Signed &amp; sealed on blockchain</div>
              <span style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 8, padding: '4px 12px', fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>⛓ BLOCKCHAIN VERIFIED</span>
              <div style={{ marginTop: 28 }}>
                <button onClick={onClose} style={{ width: '100%', padding: 13, borderRadius: 12, border: 'none', background: '#1c1917', color: '#f5f0e8', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Done</button>
              </div>
            </div>
          ) : (
            <>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); setFiles(Array.from(e.dataTransfer.files)); }}
                onClick={() => document.getElementById('hv-file-upload').click()}
                style={{ border: `2px dashed ${dragOver ? '#1c1917' : '#d6d3d1'}`, borderRadius: 14, padding: '30px 20px', textAlign: 'center', background: dragOver ? '#f5f0e8' : '#fafaf9', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 20 }}>
                <input id="hv-file-upload" type="file" multiple style={{ display: 'none' }} onChange={e => setFiles(Array.from(e.target.files))} />
                <div style={{ fontSize: 34, marginBottom: 10 }}>📤</div>
                {files.length > 0 ? files.map((f, i) => <div key={i} style={{ fontSize: 13, color: '#1c1917', fontWeight: 700, padding: '2px 0' }}>📎 {f.name}</div>)
                  : <><div style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', marginBottom: 4 }}>Drop files here or click to browse</div><div style={{ fontSize: 12, color: '#a8a29e' }}>PDF, JPG, PNG, DICOM — Max 50MB</div></>}
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#78716c', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>Select Document Type</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DOC_TYPES.map(t => (
                    <button key={t} onClick={() => setDocType(t)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '2px solid', transition: 'all 0.15s', background: docType === t ? '#1c1917' : '#fff', borderColor: docType === t ? '#1c1917' : '#e7e5e4', color: docType === t ? '#f5f0e8' : '#57534e' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#78716c', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Clinical Notes (optional)</div>
                <textarea placeholder="Add context or instructions..." value={notes} onChange={e => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e7e5e4', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: 80, background: '#fafaf9', color: '#1c1917' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0 }}>⛓</span>
                <span>This document will be cryptographically signed and recorded on the blockchain. The patient will be notified.</span>
              </div>
              <button onClick={handleUpload} disabled={!files.length || !docType || uploading}
                style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: (!files.length || !docType) ? '#e7e5e4' : '#1c1917', color: (!files.length || !docType) ? '#a8a29e' : '#f5f0e8', fontWeight: 700, fontSize: 15, cursor: (!files.length || !docType) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                {uploading ? '⟳  Uploading & Sealing...' : '↑  Upload & Sign Document'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   VIEW FILES MODAL
═══════════════════════════════════════════════════ */
function ViewFilesModal({ patient, onClose }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680, boxShadow: '0 40px 100px rgba(0,0,0,0.4)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#1c1917', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 10, color: '#a8a29e', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 6 }}>MEDICAL RECORDS</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{patient.name}</div>
            <div style={{ fontSize: 11, color: '#fb923c', fontFamily: 'monospace', marginTop: 3 }}>{patient.id}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #44403c', background: '#292524', cursor: 'pointer', color: '#a8a29e', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '22px 28px', overflowY: 'auto', background: '#fff' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            {[['Age', `${patient.age} yrs · ${patient.gender}`], ['Blood', patient.blood], ['Conditions', `${patient.conditions.length} active`], ['Allergy', patient.allergies[0]]].map(([l, v]) => (
              <div key={l} style={{ background: '#f5f0e8', border: '1px solid #e7e5e4', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#a8a29e', letterSpacing: 0.8, marginBottom: 4 }}>{l.toUpperCase()}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
            {patient.conditions.map(c => <span key={c} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>{c}</span>)}
            {patient.allergies.map(a => <span key={a} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>⚠ {a}</span>)}
          </div>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#a8a29e', letterSpacing: 1, marginBottom: 14, fontWeight: 600 }}>{patient.docs.length} DOCUMENTS ON FILE</div>
          {patient.docs.map((doc, i) => (
            <div key={i} style={{ border: `2px solid ${expanded === i ? '#1c1917' : '#e7e5e4'}`, borderRadius: 14, marginBottom: 10, overflow: 'hidden', background: '#fff', transition: 'all 0.2s' }}>
              <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f0e8', border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{doc.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1917' }}>{doc.name}</div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#a8a29e', marginTop: 3 }}>{doc.date} · {doc.size} · {doc.type}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {doc.verified
                    ? <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 8, padding: '3px 10px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }}>⛓ Verified</span>
                    : <span style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fcd34d', borderRadius: 8, padding: '3px 10px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }}>⏳ Pending</span>}
                  <span style={{ color: '#a8a29e', fontSize: 14, display: 'inline-block', transition: 'transform 0.25s', transform: expanded === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </div>
              </div>
              {expanded === i && (
                <div style={{ padding: '14px 18px 16px', borderTop: '1px solid #e7e5e4', background: '#f5f0e8', display: 'flex', gap: 10 }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#1c1917', color: '#f5f0e8', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>👁 View Document</button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: '1.5px solid #d6d3d1', background: '#fff', color: '#1c1917', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>⬇ Download</button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: '1.5px solid #d6d3d1', background: '#fff', color: '#1c1917', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>📤 Share</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BIOMETRIC EMERGENCY SCANNER
═══════════════════════════════════════════════════ */
function BiometricScanner() {
  const [phase, setPhase]     = useState('idle');      // idle | scanning | found | notfound
  const [patient, setPatient] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('critical');
  const scanRef = useRef(null);
  const progRef = useRef(null);

  const startScan = () => {
    setPhase('scanning');
    setProgress(0);
    setPatient(null);

    // Animate progress bar
    let p = 0;
    progRef.current = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) { p = 100; clearInterval(progRef.current); }
      setProgress(Math.min(p, 100));
    }, 120);

    // After 3s show result
    scanRef.current = setTimeout(() => {
      clearInterval(progRef.current);
      setProgress(100);
      // Random patient for demo
      const found = PATIENTS[Math.floor(Math.random() * PATIENTS.length)];
      setTimeout(() => { setPatient(found); setPhase('found'); }, 400);
    }, 3000);
  };

  const reset = () => {
    clearTimeout(scanRef.current);
    clearInterval(progRef.current);
    setPhase('idle');
    setPatient(null);
    setProgress(0);
    setActiveTab('critical');
  };

  useEffect(() => () => { clearTimeout(scanRef.current); clearInterval(progRef.current); }, []);

  /* ── IDLE SCREEN ── */
  if (phase === 'idle') return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Red emergency banner */}
      <div style={{ background: '#dc2626', borderRadius: 16, padding: '20px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 36 }}>🚨</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Emergency Biometric Access</div>
          <div style={{ fontSize: 13, color: '#fecaca', lineHeight: 1.5 }}>
            Place patient's finger on the scanner to instantly retrieve critical medical info — blood type, allergies, surgical history, emergency contacts and medications.
          </div>
        </div>
      </div>

      {/* Fingerprint button */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e7e5e4', padding: '52px 28px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 32 }}>
          {/* Pulse rings */}
          <div style={{ position: 'absolute', inset: -24, borderRadius: '50%', border: '2px solid rgba(220,38,38,0.15)', animation: 'bioRing 2s ease-out infinite' }} />
          <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '2px solid rgba(220,38,38,0.2)', animation: 'bioRing 2s 0.5s ease-out infinite' }} />

          <button
            onClick={startScan}
            style={{
              width: 160, height: 160, borderRadius: '50%',
              border: '3px solid #e7e5e4',
              background: 'linear-gradient(145deg, #fafaf9, #f5f0e8)',
              cursor: 'pointer', fontSize: 68,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(220,38,38,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; }}
          >
            👆
          </button>
        </div>

        <div style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', marginBottom: 8, fontFamily: 'Georgia, serif' }}>
          Place Finger to Scan
        </div>
        <div style={{ fontSize: 13, color: '#a8a29e', marginBottom: 28, lineHeight: 1.6 }}>
          Tap the button above to simulate a biometric scan<br />
          Patient identity will be verified via blockchain
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['⚡ Instant ID', '🔒 Encrypted', '⛓ Blockchain Logged', '🏥 HIPAA Compliant'].map(t => (
            <span key={t} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#f5f0e8', color: '#78716c', border: '1px solid #e7e5e4' }}>{t}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bioRing { 0%{transform:scale(1);opacity:1} 100%{transform:scale(1.5);opacity:0} }
        @keyframes scanBeam { 0%{top:8%} 100%{top:88%} }
        @keyframes fadePop { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );

  /* ── SCANNING SCREEN ── */
  if (phase === 'scanning') return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e7e5e4', padding: '52px 28px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

        {/* Animated fingerprint */}
        <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 32px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #dc2626', boxShadow: '0 0 0 8px rgba(220,38,38,0.1), 0 8px 32px rgba(220,38,38,0.2)' }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #fff7f7, #fef2f2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 68 }}>👆</div>
          {/* Scan beam */}
          <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #dc2626, transparent)', animation: 'scanBeam 1.2s ease-in-out infinite', top: '8%' }} />
          {/* Green overlay growing */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(22,101,52,0.15)', height: `${progress}%`, transition: 'height 0.1s ease', }} />
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, color: '#1c1917', marginBottom: 10 }}>Scanning Biometric…</div>
        <div style={{ fontSize: 13, color: '#a8a29e', marginBottom: 28 }}>Matching fingerprint against secure vault · Do not move finger</div>

        {/* Progress bar */}
        <div style={{ background: '#f5f0e8', borderRadius: 10, height: 10, overflow: 'hidden', maxWidth: 360, margin: '0 auto 14px' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #dc2626, #f97316)', borderRadius: 10, width: `${progress}%`, transition: 'width 0.1s ease' }} />
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#a8a29e' }}>{Math.round(progress)}% — {progress < 40 ? 'Reading ridge patterns…' : progress < 75 ? 'Matching against vault…' : 'Verifying on blockchain…'}</div>

        <button onClick={reset} style={{ marginTop: 28, padding: '9px 20px', borderRadius: 10, border: '1.5px solid #e7e5e4', background: 'transparent', color: '#a8a29e', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
      </div>
      <style>{`@keyframes scanBeam { 0%{top:8%} 100%{top:88%} }`}</style>
    </div>
  );

  /* ── FOUND SCREEN ── */
  if (phase === 'found' && patient) return (
    <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadePop 0.4s ease both' }}>

      {/* Match banner */}
      <div style={{ background: '#166534', borderRadius: 16, padding: '16px 24px', marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 30 }}>✅</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Biometric Match Found</div>
            <div style={{ fontSize: 12, color: '#86efac', fontFamily: 'monospace', marginTop: 2 }}>Identity verified · All access blockchain-logged · {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        <button onClick={reset} style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid #86efac', background: 'transparent', color: '#86efac', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          ← New Scan
        </button>
      </div>

      {/* Patient identity card */}
      <div style={{ background: '#1c1917', borderRadius: 20, padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#292524', border: '2px solid #44403c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#f5f0e8', flexShrink: 0 }}>
            {patient.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Georgia, serif', lineHeight: 1 }}>{patient.name}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#fb923c', marginTop: 5 }}>{patient.id}</div>
          </div>
          {/* Critical badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ background: '#dc2626', borderRadius: 12, padding: '10px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#fecaca', fontFamily: 'monospace', letterSpacing: 0.8, marginBottom: 4 }}>BLOOD TYPE</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{patient.blood}</div>
            </div>
            <div style={{ background: '#292524', border: '1px solid #44403c', borderRadius: 12, padding: '10px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#a8a29e', fontFamily: 'monospace', letterSpacing: 0.8, marginBottom: 4 }}>AGE / SEX</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{patient.age} · {patient.gender[0]}</div>
            </div>
            <div style={{ background: '#292524', border: '1px solid #44403c', borderRadius: 12, padding: '10px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#a8a29e', fontFamily: 'monospace', letterSpacing: 0.8, marginBottom: 4 }}>EMERGENCY</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>{patient.emergencyContact.phone}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { key: 'critical',   label: '🚨 Critical Info'     },
          { key: 'allergies',  label: '⚠️ Allergies & Meds'  },
          { key: 'surgeries',  label: '🏥 Surgical History'  },
          { key: 'contacts',   label: '📞 Emergency Contacts'},
          { key: 'docs',       label: '📂 Documents'         },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '9px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700,
            border: '2px solid', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === t.key ? '#1c1917' : '#fff',
            borderColor: activeTab === t.key ? '#1c1917' : '#e7e5e4',
            color: activeTab === t.key ? '#f5f0e8' : '#78716c',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── CRITICAL INFO ── */}
      {activeTab === 'critical' && (
        <div style={{ animation: 'fadePop 0.3s ease' }}>
          {/* Critical note */}
          <div style={{ background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: 16, padding: '18px 22px', marginBottom: 16 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#c2410c', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>⚡ CRITICAL CLINICAL NOTES</div>
            <div style={{ fontSize: 14, color: '#431407', lineHeight: 1.7, fontWeight: 500 }}>{patient.criticalNotes}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Conditions */}
            <div style={{ background: '#fff', border: '1.5px solid #e7e5e4', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', letterSpacing: 1, marginBottom: 14, fontWeight: 600 }}>ACTIVE CONDITIONS</div>
              {patient.conditions.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < patient.conditions.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c2410c', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1c1917' }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div style={{ background: '#fff', border: '1.5px solid #e7e5e4', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', letterSpacing: 1, marginBottom: 14, fontWeight: 600 }}>PATIENT DETAILS</div>
              {[
                ['Full Name',  patient.name],
                ['Patient ID', patient.id],
                ['Age',        `${patient.age} years`],
                ['Gender',     patient.gender],
                ['Blood Type', patient.blood],
                ['Phone',      patient.phone],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f0e8', fontSize: 13 }}>
                  <span style={{ color: '#a8a29e', fontFamily: 'monospace', fontSize: 11 }}>{l}</span>
                  <span style={{ fontWeight: 700, color: '#1c1917', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ALLERGIES & MEDS ── */}
      {activeTab === 'allergies' && (
        <div style={{ animation: 'fadePop 0.3s ease' }}>
          {/* Allergy alert */}
          <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: 16, padding: '18px 22px', marginBottom: 16 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#dc2626', letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>🚫 KNOWN ALLERGIES — DO NOT ADMINISTER</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {patient.allergies.map((a, i) => (
                <div key={i} style={{ background: '#dc2626', color: '#fff', borderRadius: 12, padding: '10px 20px', fontSize: 15, fontWeight: 800 }}>
                  🚫 {a}
                </div>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div style={{ background: '#fff', border: '1.5px solid #e7e5e4', borderRadius: 16, padding: '18px 22px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>💊 CURRENT MEDICATIONS</div>
            {patient.medications.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 12, background: '#fafaf9', border: '1px solid #f5f0e8', marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💊</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1917' }}>{m}</div>
                  <div style={{ fontSize: 11, color: '#a8a29e', fontFamily: 'monospace', marginTop: 2 }}>Current prescription · Verify before dosage change</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SURGICAL HISTORY ── */}
      {activeTab === 'surgeries' && (
        <div style={{ animation: 'fadePop 0.3s ease' }}>
          {patient.surgeries.length === 0 ? (
            <div style={{ background: '#fff', border: '1.5px solid #e7e5e4', borderRadius: 16, padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', marginBottom: 6 }}>No Surgical History</div>
              <div style={{ fontSize: 13, color: '#a8a29e' }}>No recorded surgeries for this patient</div>
            </div>
          ) : (
            patient.surgeries.map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1.5px solid #e7e5e4', borderLeft: '4px solid #c2410c', borderRadius: 16, padding: '20px 24px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#1c1917', marginBottom: 6 }}>{s.name}</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>📅 {s.date}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>🏥 {s.hospital}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}>👨‍⚕️ {s.surgeon}</span>
                    </div>
                  </div>
                </div>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c2410c', letterSpacing: 0.8, marginBottom: 5, fontWeight: 700 }}>SURGICAL NOTES</div>
                  <div style={{ fontSize: 13, color: '#431407', lineHeight: 1.6 }}>{s.notes}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── EMERGENCY CONTACTS ── */}
      {activeTab === 'contacts' && (
        <div style={{ animation: 'fadePop 0.3s ease' }}>
          <div style={{ background: '#fff', border: '1.5px solid #e7e5e4', borderRadius: 16, padding: '22px 24px', marginBottom: 14 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', letterSpacing: 1, marginBottom: 18, fontWeight: 600 }}>PRIMARY EMERGENCY CONTACT</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f5f0e8', border: '2px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#1c1917' }}>
                {patient.emergencyContact.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1c1917' }}>{patient.emergencyContact.name}</div>
                <div style={{ fontSize: 13, color: '#78716c', marginTop: 3 }}>{patient.emergencyContact.relation}</div>
              </div>
              <a href={`tel:${patient.emergencyContact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: '#166534', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15, boxShadow: '0 4px 14px rgba(22,101,52,0.3)' }}>
                📞 {patient.emergencyContact.phone}
              </a>
            </div>
          </div>

          {/* Patient own phone */}
          <div style={{ background: '#fff', border: '1.5px solid #e7e5e4', borderRadius: 16, padding: '18px 24px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', letterSpacing: 1, marginBottom: 12, fontWeight: 600 }}>PATIENT CONTACT</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1c1917' }}>{patient.name}</div>
                <div style={{ fontSize: 13, color: '#78716c', marginTop: 2 }}>Primary number</div>
              </div>
              <a href={`tel:${patient.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: '#1c1917', color: '#f5f0e8', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                📞 {patient.phone}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS ── */}
      {activeTab === 'docs' && (
        <div style={{ animation: 'fadePop 0.3s ease' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', letterSpacing: 1, marginBottom: 14, fontWeight: 600 }}>{patient.docs.length} DOCUMENTS ON FILE</div>
          {patient.docs.map((doc, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid #e7e5e4', borderRadius: 14, padding: '14px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f0e8', border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{doc.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1917' }}>{doc.name}</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#a8a29e', marginTop: 3 }}>{doc.date} · {doc.size} · {doc.type}</div>
              </div>
              {doc.verified
                ? <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 8, padding: '3px 10px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>⛓ Verified</span>
                : <span style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fcd34d', borderRadius: 8, padding: '3px 10px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>⏳ Pending</span>}
              <button style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#1c1917', color: '#f5f0e8', fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>View</button>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes fadePop { 0%{opacity:0;transform:scale(0.97)} 100%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );

  return null;
}

/* ═══════════════════════════════════════════════════
   PATIENT CARD
═══════════════════════════════════════════════════ */
function PatientCard({ patient, onViewFiles, onUpload }) {
  const s = STATUS_STYLE[patient.statusColor];
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e7e5e4', borderLeft: '4px solid #e7e5e4', borderRadius: 18, padding: '22px 24px', marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderLeftColor = '#c2410c'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderLeftColor = '#e7e5e4'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#f5f0e8', border: '2px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#1c1917', flexShrink: 0 }}>{patient.name[0]}</div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1c1917' }}>{patient.name}</div>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }}>{patient.status}</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#c2410c', marginBottom: 7, fontWeight: 600 }}>{patient.id}</div>
          <div style={{ fontSize: 13, color: '#78716c', marginBottom: 12 }}>{patient.reason}</div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
            {[['Age', `${patient.age} yrs, ${patient.gender}`], ['Blood', patient.blood], ['Visit', patient.lastVisit], ['Docs', `${patient.docs.length} files`]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#a8a29e', letterSpacing: 0.8, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {patient.conditions.map(c => <span key={c} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>{c}</span>)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
          <button onClick={() => onViewFiles(patient)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, border: '2px solid #e7e5e4', background: '#fff', color: '#1c1917', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f0e8'; e.currentTarget.style.borderColor = '#a8a29e'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e7e5e4'; }}>
            <span style={{ fontSize: 17 }}>📂</span> View Files
          </button>
          <button onClick={() => onUpload(patient)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, border: 'none', background: '#1c1917', color: '#f5f0e8', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap', boxShadow: '0 3px 10px rgba(28,25,23,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(28,25,23,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(28,25,23,0.25)'; }}>
            <span style={{ fontSize: 17 }}>📤</span> Upload Document
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════ */
const AUDIT = [
  { time: 'Today 11:42 AM',  action: 'Viewed CBC Blood Report',    patient: 'Aarav Sharma'  },
  { time: 'Today 11:40 AM',  action: 'Accessed Patient Profile',   patient: 'Aarav Sharma'  },
  { time: 'Today 10:55 AM',  action: 'Uploaded Discharge Summary', patient: 'Rahul Desai'   },
  { time: 'Today 10:32 AM',  action: 'Viewed ECG Report',          patient: 'Meena Iyer'    },
  { time: 'Mar 1, 9:15 AM',  action: 'Downloaded Chest X-Ray',     patient: 'Aarav Sharma'  },
  { time: 'Feb 28, 3:28 PM', action: 'Uploaded Visit Summary',     patient: 'Sunita Pillai' },
  { time: 'Feb 28, 2:10 PM', action: 'Biometric Emergency Scan',   patient: 'Meena Iyer'    },
];

const STATUS_FILTERS = ['All', 'In Clinic', 'Waiting', 'Scheduled', 'Discharged'];

export default function DoctorDashboard({ onLogout }) {
  const [tab,    setTab]    = useState('patients');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [viewPt, setViewPt] = useState(null);
  const [upPt,   setUpPt]   = useState(null);

  const filtered = PATIENTS.filter(p => {
    const q = search.toLowerCase();
    return (p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      && (status === 'All' || p.status === status);
  });

  const TABS = [
    { key: 'patients',   label: "Today's Patients" },
    { key: 'biometric',  label: '👆 Emergency Biometric' },
    { key: 'audit',      label: 'Audit Log' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8' }}>

      {/* HEADER */}
      <div style={{ background: '#fff', borderBottom: '1.5px solid #e7e5e4', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#1c1917', lineHeight: 1 }}>HealthVault</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#a8a29e', letterSpacing: 1 }}>CLINICAL PORTAL</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>⛓ Blockchain Active</span>
          <div style={{ background: '#f5f0e8', border: '1px solid #e7e5e4', borderRadius: 10, padding: '6px 14px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#a8a29e', letterSpacing: 0.5 }}>SIGNED IN AS</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>Dr. Riya Patel · Cardiology</div>
          </div>
          <button onClick={onLogout}
            style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid #e7e5e4', background: 'transparent', color: '#78716c', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f0e8'; e.currentTarget.style.color = '#1c1917'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716c'; }}>
            ↪ Sign Out
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Welcome */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', letterSpacing: 1, marginBottom: 10 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 400, color: '#1c1917', lineHeight: 1.15, fontFamily: 'Georgia, serif' }}>
              Good morning,<br /><span style={{ color: '#c2410c', fontStyle: 'italic' }}>Dr. Riya.</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: "Today's Patients", value: PATIENTS.length, bg: '#1c1917', col: '#f5f0e8' },
              { label: 'In Clinic', value: PATIENTS.filter(p => p.status === 'In Clinic').length, bg: '#dcfce7', col: '#166534' },
              { label: 'Waiting',   value: PATIENTS.filter(p => p.status === 'Waiting').length,   bg: '#fef9c3', col: '#854d0e' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '16px 22px', textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: s.col, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: s.col, opacity: 0.75, marginTop: 5, letterSpacing: 0.5 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e7e5e4', marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '11px 24px', border: 'none', background: 'transparent',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              color: tab === t.key ? '#1c1917' : '#a8a29e',
              borderBottom: `2px solid ${tab === t.key ? (t.key === 'biometric' ? '#dc2626' : '#1c1917') : 'transparent'}`,
              marginBottom: -2, transition: 'all 0.15s',
              ...(t.key === 'biometric' && tab === t.key ? { color: '#dc2626' } : {}),
            }}>{t.label}</button>
          ))}
        </div>

        {/* PATIENTS TAB */}
        {tab === 'patients' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or Patient ID..."
                style={{ flex: 1, minWidth: 220, padding: '11px 16px', border: '1.5px solid #e7e5e4', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#1c1917' }}
                onFocus={e => e.target.style.borderColor = '#a8a29e'}
                onBlur={e => e.target.style.borderColor = '#e7e5e4'} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUS_FILTERS.map(f => (
                  <button key={f} onClick={() => setStatus(f)} style={{ padding: '9px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s', background: status === f ? '#1c1917' : '#fff', borderColor: status === f ? '#1c1917' : '#e7e5e4', color: status === f ? '#f5f0e8' : '#78716c' }}>{f}</button>
                ))}
              </div>
            </div>
            {filtered.length === 0
              ? <div style={{ textAlign: 'center', padding: 60, color: '#a8a29e', fontSize: 18 }}>No patients found</div>
              : filtered.map(p => <PatientCard key={p.id} patient={p} onViewFiles={setViewPt} onUpload={setUpPt} />)
            }
          </>
        )}

        {/* BIOMETRIC TAB */}
        {tab === 'biometric' && <BiometricScanner />}

        {/* AUDIT TAB */}
        {tab === 'audit' && (
          <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #e7e5e4', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f5f0e8' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', letterSpacing: 1, fontWeight: 600 }}>BLOCKCHAIN ACCESS LOG — IMMUTABLE RECORD</div>
            </div>
            {AUDIT.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 24px', borderBottom: i < AUDIT.length - 1 ? '1px solid #f5f0e8' : 'none', background: i % 2 === 0 ? '#fff' : '#fafaf9' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#a8a29e', width: 130, flexShrink: 0 }}>{a.time}</div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1c1917' }}>{a.action}</div>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#57534e', background: '#f5f0e8', border: '1px solid #e7e5e4', borderRadius: 8, padding: '3px 10px', whiteSpace: 'nowrap' }}>{a.patient}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#166534', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '3px 10px', whiteSpace: 'nowrap', fontWeight: 700 }}>✓ Logged</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {viewPt && <ViewFilesModal patient={viewPt} onClose={() => setViewPt(null)} />}
      {upPt   && <UploadModal    patient={upPt}   onClose={() => setUpPt(null)}   />}
    </div>
  );
}