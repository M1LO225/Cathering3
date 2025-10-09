// Ruta: frontend/src/App.jsx (CORREGIDO - Sin Router)

import React from 'react';
// 🚨 Importar SOLO Routes, Route, Link
import { Routes, Route, Link } from 'react-router-dom'; 
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage'; 
// Asumiendo que has corregido la ruta a components/ProtectedRoute
import ProtectedRoute from './components/layout/ProtectedRoute'; 

const Navigation = () => {
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <nav>
            <Link to="/">Home</Link>
            {!isAuthenticated ? (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            ) : (
                <>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/manage-users">Manage Users</Link> 
                    <span>| Welcome, {user?.username}</span>
                    <button onClick={logout}>Logout</button>
                </>
            )}
        </nav>
    );
};

const App = () => {
    return (
        // 🚨 NO USAR <Router> AQUÍ. Solo el Fragmento o un div padre.
        <> 
            <Navigation />
            <div className="container">
                <Routes>
                    <Route path="/" element={<h1>Welcome to the CRUD App</h1>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Rutas Protegidas */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/manage-users" element={<UserManagementPage />} /> 
                    </Route>
                </Routes>
            </div>
        </>
    );
};

export default App;