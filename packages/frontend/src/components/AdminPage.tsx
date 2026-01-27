import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Header from './Header.tsx';
import './Dashboard.css';

interface Item {
  id: string;
  name: string;
  img: string;
  createdBy?: string;
  createdAt?: string;
}

const AdminPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [img, setImg] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const API_URL = '/api';

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

      const response = await fetch(`${API_URL}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Помилка завантаження даних');
      }
      
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      console.error('Помилка завантаження:', err);
      setError(err.message || 'Не вдалося завантажити дані');
    } finally {
      setLoading(false);
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

      const response = await fetch(`${API_URL}/items/${id}`, {
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
  }, []);

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
          <h2>Додати новий елемент</h2>
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
          <h2>Список елементів</h2>
          
          {loading ? (
            <div className="loading">Завантаження...</div>
          ) : items.length === 0 ? (
            <p className="empty-state">
              Поки що немає жодного елемента. Додайте перший!
            </p>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
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
      </main>
    </div>
  );
};

export default AdminPage;