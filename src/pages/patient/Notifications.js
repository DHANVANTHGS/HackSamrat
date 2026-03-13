import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

export default function Notifications({ session, onSessionExpired, onNotificationsChange }) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/notifications/me', { token: session.token });
      setItems(data.items || []);
      setUnread(data.unreadCount || 0);
      onNotificationsChange?.(data.unreadCount || 0);
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

  const markOne = async (id) => {
    await apiRequest(`/notifications/me/${id}/read`, { method: 'POST', token: session.token });
    load();
  };

  const markAll = async () => {
    await apiRequest('/notifications/me/read-all', { method: 'POST', token: session.token });
    load();
  };

  const remove = async (id) => {
    await apiRequest(`/notifications/me/${id}`, { method: 'DELETE', token: session.token });
    load();
  };

  return (
    <div className="page-fade">
      <div className="section-header">
        <div>
          <div className="section-title">Notifications</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{unread} unread</div>
        </div>
        {unread > 0 ? <button className="btn btn-outline btn-sm" onClick={markAll}>Mark all read</button> : null}
      </div>

      {error ? <div className="card">{error}</div> : null}
      {loading ? <div className="card">Loading notifications...</div> : null}

      {items.map((notification) => (
        <div key={notification.id} className={`notif-item ${notification.readAt ? '' : 'notif-item--unread'}`}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="notif-title">{notification.title}</div>
              {!notification.readAt ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#667eea', flexShrink: 0, marginTop: 4 }} /> : null}
            </div>
            <div className="notif-body">{notification.message}</div>
            <div className="notif-time">{formatDateTime(notification.createdAt)}</div>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {!notification.readAt ? <button className="btn btn-outline btn-sm" onClick={() => markOne(notification.id)}>Read</button> : null}
            <button className="btn btn-danger btn-sm" onClick={() => remove(notification.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
