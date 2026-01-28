import React from 'react';
import type { Training } from '../../pages/Dashboard/types.ts';

interface Props {
  weeklyPlan: Training[][];
  loading: boolean;
}

const PlanSection: React.FC<Props> = ({ weeklyPlan, loading }) => {
  const dayNames = [
    'Понеділок',
    'Вівторок',
    'Середа',
    'Четвер',
    'П\'ятниця',
    'Субота',
    'Неділя'
  ];

  return (
    <section className="plan-section">
      <h2>Індивідуальний план на тиждень</h2>
      {loading ? (
        <div>Завантаження плану...</div>
      ) : (
        <div className="week-grid">
          {dayNames.map((day, idx) => (
            <div key={day} className="day-card">
              <h3>{day}</h3>
              <div className="day-trainings">
                {weeklyPlan[idx] && weeklyPlan[idx].length > 0 ? (
                  weeklyPlan[idx].map((tr) => (
                    <div key={tr.id} className="training-card">
                      {tr.img && <img src={tr.img} alt={tr.name} width={56} height={56} />}
                      <div className="training-info">
                        <div className="training-name">{tr.name}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-training">Тренування не знайдено</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PlanSection;
