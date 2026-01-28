import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData } from 'chart.js';

interface Props {
  rankingChart: { labels: string[]; data: number[] };
  rankings: any[];
}

const SocialSection: React.FC<Props> = ({ rankingChart, rankings }) => {
  return (
    <section className="ranking-section">
      <h2>Рейтинг користувачів (топ)</h2>
      {rankings.length === 0 ? (
        <div>Немає даних для рейтингу</div>
      ) : (
        <div style={{ maxWidth: 800 }}>
          <Bar
            data={{
              labels: rankingChart.labels,
              datasets: [
                {
                  label: 'Кількість тренувань за місяць',
                  data: rankingChart.data,
                  backgroundColor: 'rgba(255,159,64,0.7)'
                }
              ]
            } as ChartData<'bar'>}
            options={{
              indexAxis: 'y' as const,
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Топ користувачів за кількістю тренувань' }
              },
              scales: {
                x: { title: { display: true, text: 'Кількість' }, beginAtZero: true }
              }
            }}
          />
        </div>
      )}
    </section>
  );
};

export default SocialSection;
