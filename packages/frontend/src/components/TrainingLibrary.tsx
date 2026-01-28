import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Header from './Header.tsx';
import './TrainingLibrary.css';
// @ts-ignore: allow importing image asset without type declaration
import StartButton from "../assets/icons8-start-100.png";

interface TrainingItem {
  id: string;
  name: string;
  img: string;
  createdBy?: string;
  createdAt?: string;
}

const TrainingLibrary: React.FC = () => {
  const [items, setItems] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, startSession } = useAuth();

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

      const response = await fetch(`${API_URL}/trainings`, {
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

  const startTraining = (item: TrainingItem) => {
    startSession(item.id, item.name);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  console.log(items)
  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard-content">
    
        <div className="items-section">
          <h2>Trainings</h2>
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : items.length === 0 ? (
            <p className="empty-state">
              No trainings now.
            </p>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-content">
                    <div className="item-image">
                        <img width="50" height="50" src={item.img} alt="walking--v1"/>   
                        <img width="60" className="start-button" onClick={() => startTraining(item)} height="60" src={StartButton} alt="walking--v1"/>  
                    </div>
                    <h3>{item.name}</h3>   
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainingLibrary;