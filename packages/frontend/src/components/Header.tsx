// packages/frontend/src/components/Header.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

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


  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>Smartass</h1>
          <p>Особистий кабінет користувача</p>
        </div>
        
        {currentUser && (
          <div className="header-right">
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