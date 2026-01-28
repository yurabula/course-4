import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Header from './Header.tsx';
import './Dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

interface TrainingItem {
  id: string;
  name: string;
  img: string;
  createdBy?: string;
  createdAt?: string;
}

const AdminPage: React.FC = () => {
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [img, setImg] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const API_URL = '/api';

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [popularTrainings, setPopularTrainings] = useState<any[]>([]);
  const [avgActivity, setAvgActivity] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);

  const getAuthToken = async () => {
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Немає токена аутентифікації');
      }

      const response = await fetch(`${API_URL}/trainings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Помилка завантаження даних');
      }
      
      const data = await response.json();
      setTrainings(data);
    } catch (err: any) {
      console.error('Помилка завантаження:', err);
      setError(err.message || 'Не вдалося завантажити дані');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const [usersRes, popularRes, avgRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/popular-trainings`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/average-activity`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (popularRes.ok) setPopularTrainings(await popularRes.json());
      if (avgRes.ok) setAvgActivity(await avgRes.json());
    } catch (e) {
      console.error('Помилка завантаження адмін-даних', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Введіть назву');
      return;
    }

    try {
      setError('');
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Немає токена аутентифікації');
      }

      const response = await fetch(`${API_URL}/trainings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, img })
      });

      if (response.ok) {
        setName('');
        setImg('');
        fetchItems();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Помилка створення');
      }
    } catch (err: any) {
      console.error('Помилка створення:', err);
      setError(err.message || 'Не вдалося створити елемент');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ви впевнені?')) return;

    try {
      setError('');
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Немає токена аутентифікації');
      }

      const response = await fetch(`${API_URL}/trainings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchItems();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Помилка видалення');
      }
    } catch (err: any) {
      console.error('Помилка видалення:', err);
      setError(err.message || 'Не вдалося видалити елемент');
    }
  };

  useEffect(() => {
    fetchItems();
    fetchAdminData();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedUser) return;
      try {
        const token = await getAuthToken();
        if (!token) return;
        const uid = encodeURIComponent(selectedUser);
        const res = await fetch(`${API_URL}/admin/user-progress?userId=${uid}`, { headers: { Authorization: `Bearer ${token}` } });
        console.log('user-progress status', res.status);
        if (res.ok) {
          const payload = await res.json();
          console.log('user-progress payload', payload);
          setUserProgress(payload);
        } else {
          const err = await res.text();
          console.error('user-progress error', res.status, err);
          setUserProgress(null);
        }
      } catch (e) {
        console.error('Помилка завантаження прогресу користувача', e);
        setUserProgress(null);
      }
    })();
  }, [selectedUser]);

  const popularChart = useMemo(() => {
    return {
      labels: popularTrainings.map(p => p.name || p.trainingId),
      data: popularTrainings.map(p => p.count || 0)
    };
  }, [popularTrainings]);

  const avgActivityChart = useMemo(() => {
    if (!avgActivity) return { labels: [], data: [] };
    const perDayEntries = Object.entries(avgActivity.perDay || {}).sort((a,b)=>a[0].localeCompare(b[0]));
    return {
      labels: perDayEntries.map(e=>e[0].slice(8)),
      data: perDayEntries.map(e=>e[1])
    };
  }, [avgActivity]);

  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard-content">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div className="create-section">
          <h2>Додати нове тренування</h2>
          <form onSubmit={handleSubmit} className="create-form">
            <input
              type="text"
              placeholder="Назва"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Опис"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="submit-button">
              Додати
            </button>
          </form>
        </div>

        <div className="items-section">
          <h2>Список тренувань</h2>
          
          {loading ? (
            <div className="loading">Завантаження...</div>
          ) : trainings.length === 0 ? (
            <p className="empty-state">
              Поки що немає жодного тренування. Додайте перше!
            </p>
          ) : (
            <div className="items-grid">
                      {trainings.map((item) => (
                        <div key={item.id} className="item-card">
                          <div className="item-content">
                            <h3>{item.name}</h3>
                            <p>{item.img || 'Без опису'}</p>
                            {item.createdBy && (
                              <span className="item-author">
                                Створено: {item.createdBy}
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="delete-button"
                          >
                            Видалити
                          </button>
                        </div>
                      ))}
            </div>
          )}
        </div>

        <div className="plan-section">
          <h2>Адмін: Статистика</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div>
              <label>Оберіть користувача для перегляду прогресу:</label>
              <select value={selectedUser || ''} onChange={e=>setSelectedUser(e.target.value)}>
                <option value="">-- обрати --</option>
                {users.map(u=> (
                  <option key={u.userId} value={u.userId}>{u.display}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div>
                <h3>Найпопулярніші тренування (поточний місяць)</h3>
                {popularTrainings.length === 0 ? <div>Немає даних</div> : (
                  <Bar data={{ labels: popularChart.labels, datasets: [{ label: 'К-ть', data: popularChart.data, backgroundColor: 'rgba(75,192,192,0.7)'}] }} />
                )}
              </div>

              <div>
                <h3>Середня активність користувачів (поточний місяць)</h3>
                {avgActivity ? (
                  <div>
                    <div>Всього сесій: {avgActivity.total}</div>
                    <div>Унікальних користувачів: {avgActivity.uniqueUsers}</div>
                    <div>Середньо сесій на користувача: {avgActivity.avgPerUser.toFixed(2)}</div>
                    <div style={{ marginTop: 8 }}>
                      <Bar data={{ labels: avgActivityChart.labels, datasets: [{ label: 'К-ть сесій', data: avgActivityChart.data, backgroundColor: 'rgba(153,102,255,0.6)'}] }} />
                    </div>
                  </div>
                ) : <div>Немає даних</div>}
              </div>

              <div>
                <h3>Прогрес користувача (сесії / вага)</h3>
                {userProgress ? (
                  <div>
                    <Line data={{ labels: Array.from({length: userProgress.days}, (_,i)=>String(i+1)), datasets: [
                      { label: 'Сесії', data: userProgress.sessionsCounts, borderColor: 'rgba(75,192,192,1)', backgroundColor: 'rgba(75,192,192,0.2)', yAxisID: 'y' },
                      { label: 'Вага', data: userProgress.weightsPerDay, borderColor: 'rgba(255,99,132,1)', backgroundColor: 'rgba(255,99,132,0.2)', yAxisID: 'y1', spanGaps: true }
                    ] }} options={{ responsive: true, scales: { y: { beginAtZero: true }, y1: { position: 'right', beginAtZero: false } } }} />
                  </div>
                ) : <div>Оберіть користувача щоб побачити прогрес</div>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;