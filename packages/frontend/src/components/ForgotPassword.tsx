import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return setError('Email обов\'язковий');
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Лист з інструкціями надіслано на ваш email');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Помилка відновлення паролю');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Відновлення паролю</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <p className="auth-description">
          Введіть свій email і ми надішлемо вам посилання для скидання паролю
        </p>
        
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

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Відправка...' : 'Відправити'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Повернутися до входу</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;