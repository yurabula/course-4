import React, { useState, useEffect } from 'react';
import './App.css';

interface Item {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Використовуємо proxy, тому не потрібен повний URL
  const API_URL = '/api';

  // Отримання даних
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/items`);
      
      if (!response.ok) {
        throw new Error('Помилка завантаження даних');
      }
      
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error('Помилка завантаження:', err);
      setError('Не вдалося завантажити дані. Перевір, чи запущений backend.');
    } finally {
      setLoading(false);
    }
  };

  // Створення нового item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Введіть назву');
      return;
    }

    try {
      setError('');
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });

      if (response.ok) {
        setName('');
        setDescription('');
        fetchItems();
      } else {
        throw new Error('Помилка створення');
      }
    } catch (err) {
      console.error('Помилка створення:', err);
      setError('Не вдалося створити елемент');
    }
  };

  // Видалення item
  const handleDelete = async (id: string) => {
    if (!window.confirm('Ви впевнені?')) return;

    try {
      setError('');
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchItems();
      } else {
        throw new Error('Помилка видалення');
      }
    } catch (err) {
      console.error('Помилка видалення:', err);
      setError('Не вдалося видалити елемент');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Монорепо проект</h1>
        <p>Node.js + React + Firebase</p>
      </header>

      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <h2>Додати новий елемент</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Назва"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ 
                flex: '1',
                minWidth: '200px',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            <input
              type="text"
              placeholder="Опис"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ 
                flex: '2',
                minWidth: '200px',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            <button 
              type="submit" 
              style={{ 
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Додати
            </button>
          </div>
        </form>

        <div>
          <h2>Список елементів</h2>
          
          {loading ? (
            <p>Завантаження...</p>
          ) : items.length === 0 ? (
            <p style={{ color: '#666' }}>Поки що немає жодного елемента. Додайте перший!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {items.map((item) => (
                <li 
                  key={item.id} 
                  style={{ 
                    border: '1px solid #ddd',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                      {item.name}
                    </h3>
                    <p style={{ margin: 0, color: '#666' }}>
                      {item.description || 'Без опису'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ 
                      backgroundColor: '#d32f2f',
                      color: 'white',
                      padding: '0.5rem 1.5rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Видалити
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}