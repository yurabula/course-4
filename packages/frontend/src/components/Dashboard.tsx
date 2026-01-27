// packages/frontend/src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Header from './Header.tsx';
import './Dashboard.css';

interface Item {
  id: string;
  name: string;
  description: string;
  createdBy?: string;
  createdAt?: string;
}

const Dashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      </main>
    </div>
  );
};

export default Dashboard;