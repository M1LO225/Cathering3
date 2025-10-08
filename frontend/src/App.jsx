// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
// Componentes Layout
import ProtectedRoute from './components/layout/ProtectedRoute'; 

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <header style={{ padding: '10px', backgroundColor: '#f4f4f4', marginBottom: '20px' }}>
      <nav>
        <Link to="/" style={{ marginRight: '15px' }}>Inicio</Link>
        
        {!isAuthenticated && (
          <>
            <Link to="/login" style={{ marginRight: '15px' }}>Login</Link>
            <Link to="/register" style={{ marginRight: '15px' }}>Registro</Link>
          </>
        )}
        
        {isAuthenticated && (
          <>
            <Link to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'darkred' }}>
                Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

const App = () => {
  return (
    <>
      <Header />
      <div style={{ padding: '0 20px' }}>
        <Routes>
          <Route path="/" element={<h1>Bienvenido a la App</h1>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* RUTA PROTEGIDA */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
        </Routes>
      </div>
    </>
  );
};

export default App;