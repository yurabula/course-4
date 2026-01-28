import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валідація
    if (!email || !password || !displayName) {
      return setError('Всі поля обов\'язкові');
    }

    if (password.length < 6) {
      return setError('Пароль має бути мінімум 6 символів');
    }

    if (password !== confirmPassword) {
      return setError('Паролі не співпадають');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName, gender || undefined, age ? Number(age) : null);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Реєстрація</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Ім'я</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Введіть ваше ім'я"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Стать</label>
            <select id="gender" value={gender} onChange={(e)=>setGender(e.target.value)} disabled={loading}>
              <option value="">Не вказано</option>
              <option value="male">Чоловік</option>
              <option value="female">Жінка</option>
              <option value="other">Інше</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="age">Вік</label>
            <input type="number" id="age" value={age} onChange={(e)=>setAge(e.target.value)} disabled={loading} min={0} />
          </div>

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
              placeholder="Мінімум 6 символів"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Підтвердіть пароль</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторіть пароль"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>

        <div className="auth-footer">
          Вже маєте акаунт? <Link to="/login">Увійти</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;