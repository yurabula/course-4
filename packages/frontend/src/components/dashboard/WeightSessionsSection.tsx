import React from 'react';
import Sessions from '../../components/Sessions.tsx';

interface Props {
  weightValue: string;
  setWeightValue: (v: string) => void;
  weightDate: string;
  setWeightDate: (d: string) => void;
  saveWeight: () => Promise<void>;
  sessions: any[];
}

const WeightSessionsSection: React.FC<Props> = ({ weightValue, setWeightValue, weightDate, setWeightDate, saveWeight, sessions }) => {
  return (
    <>
      <section className="weight-entry">
        <h2>Додати запис ваги</h2>
        <div className="weight-form">
          <label>
            Вага (кг):
            <input type="number" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} step="0.1" />
          </label>
          <label>
            Дата:
            <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} />
          </label>
          <button onClick={saveWeight}>Зберегти вагу</button>
        </div>
      </section>

      <section className="sessions-section">
        <h2>Мої сесії</h2>
        {/* reuse existing Sessions component for listing */}
        <Sessions />
      </section>
    </>
  );
};

export default WeightSessionsSection;
