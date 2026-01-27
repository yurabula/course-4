import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';
import Login from './components/Login.tsx';
import TrainingLibrary from './components/TrainingLibrary.tsx';
import Signup from './components/Signup.tsx';
import ForgotPassword from './components/ForgotPassword.tsx';
import Dashboard from './components/Dashboard.tsx';
import AdminPage from './components/AdminPage.tsx';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/library" element={<TrainingLibrary />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;