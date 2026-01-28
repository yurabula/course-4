import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        if (!currentUser) return;
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/sessions', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (e) { console.error(e) }
    })();
  }, [currentUser]);

  return (
    <div>
      <h2>Sessions</h2>
      <ul>
        {sessions.map(s => (
          <li key={s.id}>
            <div><strong>{s.name || 'Training'}</strong></div>
            <div>{s.createdAt ? new Date(s.createdAt).toLocaleString() : s.startTime}</div>
            <div>{s.durationMinutes ? `${s.durationMinutes} min` : ''} {s.calories ? `— ${s.calories} kcal` : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sessions;
