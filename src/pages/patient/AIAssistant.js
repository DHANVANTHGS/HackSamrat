import React, { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  'Am I eligible for cataract surgery?',
  'What documents do I need for hospitalisation?',
  'Explain my maternity benefit',
  'When is my next premium due?',
];

const REPLIES = {
  cataract:  '✅ Yes! Cataract surgery is covered under Day Care Procedures (₹1,50,000 limit). You need pre-auth 48hrs before. Required docs: Pre-auth approval, admission notes, surgeon certificate, discharge summary & bills. Want me to start the pre-auth request?',
  document:  '📋 For hospitalisation claim you need:\n1. Claim form (doctor-signed)\n2. Original discharge summary\n3. All bills & receipts\n4. Investigation reports\n5. Doctor consultation notes\n6. Pharmacy bills with prescriptions\n7. Photo ID\n\nWant me to auto-fill the claim form?',
  maternity: '🤰 Your maternity benefit covers normal delivery up to ₹50,000 and C-section up to ₹75,000. Pre-natal (3 months before) and post-natal (60 days after) expenses included. Your 9-month waiting period ended Feb 2024 — you\'re fully eligible! ✅',
  premium:   '💳 Your next premium of ₹24,500 is due November 15, 2025 (8 months away). Setting up NACH auto-debit avoids grace period risk. Want me to generate the NACH mandate form?',
  default:   '👋 I can help you with claim eligibility, benefit explanations, required documents, and premium details. Could you tell me more about what you need help with?',
};

function getReply(text) {
  const t = text.toLowerCase();
  if (t.includes('cataract') || t.includes('eye') || t.includes('surgery')) return REPLIES.cataract;
  if (t.includes('doc') || t.includes('hospital'))  return REPLIES.document;
  if (t.includes('mater') || t.includes('delivery')) return REPLIES.maternity;
  if (t.includes('premium') || t.includes('due'))    return REPLIES.premium;
  return REPLIES.default;
}

export default function AIAssistant() {
  const [msgs, setMsgs]   = useState([{ role: 'ai', text: '👋 Hi Aarav! I\'m your insurance & health AI assistant. Ask me anything about your policy, claims, or benefits.' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  const send = (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMsgs(m => [...m, { role: 'ai', text: getReply(q) }]);
      setTyping(false);
    }, 1400);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">AI Health Assistant</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Ask anything about your policy, claims or health</div>
        </div>
        <span className="tag tag-green">● Online</span>
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => send(s)}
            style={{
              padding: '7px 14px', border: '1.5px solid #e0e7ff', borderRadius: 20,
              background: 'white', color: '#667eea', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.background = '#667eea'; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = '#667eea'; }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 380, overflowY: 'auto', padding: '20px 20px 10px', display: 'flex', flexDirection: 'column' }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'ai' && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 8, marginTop: 2, flexShrink: 0 }}>🤖</div>
              )}
              <div className={`chat-bubble chat-bubble--${m.role}`} style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
              <div style={{ background: 'white', border: '1.5px solid #e0e7ff', borderRadius: 18, padding: '10px 16px', display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#667eea', animation: `bounce 1s ${i*0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>

        <div style={{ padding: '14px 20px', borderTop: '1.5px solid #f3f4f6', display: 'flex', gap: 10 }}>
          <input
            className="input" style={{ flex: 1, marginBottom: 0 }}
            placeholder="Ask about your policy, claims, benefits..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={!input.trim()}>Send ➤</button>
        </div>
      </div>
    </div>
  );
}