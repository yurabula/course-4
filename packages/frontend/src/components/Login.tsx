// packages/frontend/src/components/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return setError('Всі поля обов\'язкові');
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Помилка входу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Вхід</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введіть пароль"
              disabled={loading}
            />
          </div>

          <div className="auth-links">
            <Link to="/forgot-password">Забули пароль?</Link>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <div className="auth-footer">
          Немає акаунту? <Link to="/signup">Зареєструватися</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;