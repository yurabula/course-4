import React, { useEffect, useState } from 'react';

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/reminders', { credentials: 'same-origin' });
        if (res.ok) setReminders(await res.json());
      } catch (e) {}
    })();
  }, []);

  const create = async () => {
    try {
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title }),
      });
      setTitle('');
      const res = await fetch('/api/reminders', { credentials: 'same-origin' });
      if (res.ok) setReminders(await res.json());
    } catch (e) {}
  };

  return (
    <div>
      <h2>Reminders</h2>
      <div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reminder title" />
        <button onClick={create}>Create</button>
      </div>
      <ul>
        {reminders.map(r => <li key={r.id}>{r.title} — {r.dateTime || r.createdAt}</li>)}
      </ul>
    </div>
  );
};

export default Reminders;
