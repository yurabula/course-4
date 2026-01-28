import React from 'react';
import { Bar } from 'react-chartjs-2';

interface Props {
  monthStats: { labels: string[]; counts: number[] };
  weightMonthStats: { labels: string[]; values: (number | null)[] };
}

const StatsSection: React.FC<Props> = ({ monthStats, weightMonthStats }) => {
  return (
    <section className="stats-section">
      <h2>Статистика за місяць</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div style={{ maxWidth: 800 }}>
          <h3>Тренування</h3>
          {monthStats.counts.reduce((s, v) => s + v, 0) === 0 ? (
            <div>Немає даних за цей місяць</div>
          ) : (
            <Bar
              data={{
                labels: monthStats.labels,
                datasets: [
                  {
                    label: 'Кількість тренувань',
                    data: monthStats.counts,
                    backgroundColor: 'rgba(75,192,192,0.6)'
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' as const },
                  title: { display: true, text: 'Тренування за поточний місяць' }
                },
                scales: {
                  x: { title: { display: true, text: 'День місяця' } },
                  y: { title: { display: true, text: 'Кількість' }, beginAtZero: true }
                }
              }}
            />
          )}
        </div>

        <div style={{ maxWidth: 800 }}>
          <h3>Вага (місяць)</h3>
          {weightMonthStats.values.every(v => v === null) ? (
            <div>Немає записів ваги</div>
          ) : (
            <Bar
              data={{
                labels: weightMonthStats.labels,
                datasets: [
                  {
                    label: 'Вага (kg)',
                    data: weightMonthStats.values,
                    backgroundColor: 'rgba(153,102,255,0.6)'
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' as const },
                  title: { display: true, text: 'Вага за поточний місяць' }
                },
                scales: {
                  x: { title: { display: true, text: 'День місяця' } },
                  y: { title: { display: true, text: 'Кг' }, beginAtZero: false }
                }
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
