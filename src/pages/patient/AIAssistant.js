import React, { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

const SUGGESTIONS = [
  'What is my current claim status?',
  'What benefits have I used?',
  'Am I eligible for any Indian Govt health schemes?',
];

export default function AIAssistant({ session, onSessionExpired }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const send = async (text) => {
    const message = (text || input).trim();
    if (!message || loading) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/patients/me/ai/chat', {
        method: 'POST',
        token: session.token,
        body: {
          conversationId,
          message,
        },
      });

      setConversationId(data.conversationId);
      setMessages(data.messages || []);
      setInput('');
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
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">AI Health Assistant</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Grounded only in your backend insurance and claims data</div>
        </div>
        <span className="tag tag-green">Grounded</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} onClick={() => send(suggestion)} style={{ padding: '7px 14px', border: '1.5px solid #e0e7ff', borderRadius: 20, background: 'white', color: '#667eea', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {suggestion}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 380, overflowY: 'auto', padding: '20px 20px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length ? messages.map((message) => (
            <div key={message.id} style={{ alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              <div className={`chat-bubble chat-bubble--${message.role}`}>{message.content}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{formatDateTime(message.createdAt)}</div>
            </div>
          )) : <div className="card-sub">Start a conversation to load persisted grounded messages.</div>}
          {loading ? <div className="card-sub">Thinking with grounded backend data...</div> : null}
          <div ref={endRef} />
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1.5px solid #f3f4f6', display: 'flex', gap: 10 }}>
          <input className="input" style={{ flex: 1, marginBottom: 0 }} placeholder="Ask about your policy, claims, benefits..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} />
          <button className="btn btn-primary" onClick={() => send()} disabled={!input.trim() || loading}>Send</button>
        </div>
      </div>

      {error ? <div className="card" style={{ marginTop: 12 }}>{error}</div> : null}
    </div>
  );
}
