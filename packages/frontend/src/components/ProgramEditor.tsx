import React, { useEffect, useState } from 'react';

const ProgramEditor: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/programs', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          setPrograms(data);
        }
      } catch (e) {}
    })();
  }, []);

  const create = async () => {
    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        setPrograms(prev => [{ id: data.id, name }, ...prev]);
        setName('');
      }
    } catch (e) {}
  };

  return (
    <div>
      <h2>Programs</h2>
      <div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Program name" />
        <button onClick={create}>Create</button>
      </div>
      <ul>
        {programs.map(p => (
          <li key={p.id}>{p.name || p.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProgramEditor;
