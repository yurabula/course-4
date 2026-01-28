import React, { useEffect, useState } from 'react';

const Reports: React.FC = () => {
  const [popular, setPopular] = useState<any[]>([]);
  const [avg, setAvg] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch('/api/reports/popular-trainings');
        if (r1.ok) setPopular((await r1.json()).top || []);
        const r2 = await fetch('/api/reports/avg-activity');
        if (r2.ok) setAvg(await r2.json());
      } catch (e) {}
    })();
  }, []);

  return (
    <div>
      <h2>Reports</h2>
      <section>
        <h3>Popular trainings</h3>
        <ol>
          {popular.map((p: any, i: number) => <li key={i}>{p.trainingId} — {p.count}</li>)}
        </ol>
      </section>
      <section>
        <h3>Average activity</h3>
        <pre>{JSON.stringify(avg, null, 2)}</pre>
      </section>
    </div>
  );
};

export default Reports;
