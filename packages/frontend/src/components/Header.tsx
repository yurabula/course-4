import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentSession, stopSession } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [elapsed, setElapsed] = useState('00:00:00');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  };

  const handleOnGoToLibrary = () => {
      navigate('/library');
  }

  const handleOnGoToUserPage = () => {
      navigate('/');
  }

  useEffect(() => {
    let timer: number | undefined;
    if (currentSession) {
      const tick = () => {
        const start = new Date(currentSession.startTime).getTime();
        const diff = Date.now() - start;
        const hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setElapsed(`${hrs}:${mins}:${secs}`);
      };
      tick();
      timer = window.setInterval(tick, 1000);
    } else {
      setElapsed('00:00:00');
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentSession]);


  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>Smartass</h1>
          <p>Особистий кабінет користувача</p>
        </div>
        
        {currentUser && (
          <div className="header-right">
            {currentSession && (
              <div className="active-session">
                <div className="session-info">
                  <strong>{currentSession.name}</strong>
                  <span className="session-timer">{elapsed}</span>
                </div>
                <button className="session-stop" onClick={() => stopSession()}>Stop</button>
              </div>
            )}
            <div 
              className="user-menu"
              onMouseEnter={() => setShowMenu(true)}
              onMouseLeave={() => setShowMenu(false)}
            >
              <div className="user-info">
                <span className="user-name">{currentUser.displayName || 'Користувач'}</span>
                <span className="user-email">{currentUser.email}</span>
              </div>

              {showMenu && (
                <div className="dropdown-menu">
                  <button onClick={handleLogout} className="logout-button">
                    Вийти
                  </button>
                </div>
              )}
            </div>
            <div className="user-info" onClick={handleOnGoToLibrary}>
                <span className="user-name">{'Бібліотека тренувань'}</span>
            </div>
            <div className="user-info" onClick={handleOnGoToUserPage}>
                <span className="user-name">{'Особистий кабінет'}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;