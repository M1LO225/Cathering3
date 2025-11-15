import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ColegioProfilePage from './pages/ColegioProfilePage';

const Navigation = () => {
    const { isAuthenticated, logout, user } = useAuth(); // 'user' ahora tiene 'role'

    return (
        <nav>
            <Link to="/">Home</Link>
            {!isAuthenticated ? (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Registrar Colegio</Link>
                </>
            ) : (
                <>
                    <Link to="/dashboard">Dashboard</Link>
                    
                    {/* --- LÓGICA DE ROLES --- */}
                    {user?.role === 'COLEGIO_ADMIN' && (
                        <>
                            <Link to="/manage-users">Gestionar Usuarios</Link>
                            <Link to="/manage-colegio">Mi Colegio</Link>
                        </>
                    )}
                    
                    {user?.role === 'CAFETERIA' && (
                        <Link to="/manage-menu">Gestionar Menú</Link>
                    )}

                    {user?.role === 'ESTUDIANTE' && (
                        <Link to="/menu">Ver Menú</Link>
                    )}
                    {/* --- FIN LÓGICA DE ROLES --- */}
                    
                    <span>Welcome, {user?.username} ({user?.role})</span>
                    <button onClick={logout}>Logout</button>
                </>
            )}
        </nav>
    );
};

const App = () => {
    const { loading } = useAuth();

    if (loading) {
         return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando sesión...</div>;
    }

    return (
        <>
            <Navigation />
            <div className="container">
                <Routes>
                    <Route path="/" element={<h1>Welcome to the App Cathering</h1>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Rutas Protegidas */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        {/* Rutas solo para COLEGIO_ADMIN */}
                        <Route path="/manage-users" element={<UserManagementPage />} />
                        <Route path="/manage-colegio" element={<ColegioProfilePage />} />
                        
                        {/* (Aquí irían las rutas de Cafeteria y Estudiante) */}
                    </Route>
                </Routes>
            </div>
        </>
    );
};

export default App;