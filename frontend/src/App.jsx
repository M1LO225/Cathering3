import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ColegioProfilePage from './pages/ColegioProfilePage';
import CafeteriaDashboard from './pages/CafeteriaDashboard';
import StudentMenuPage from './pages/StudentMenuPage'; 
import AllergiesManager from './pages/AllergiesManager'; 

const Navigation = () => {
    const { isAuthenticated, logout, user } = useAuth(); 

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
                    
                    {/* ROL: ADMIN DE COLEGIO */}
                    {user?.role === 'COLEGIO_ADMIN' && (
                        <>
                            <Link to="/manage-users">Gestionar Usuarios</Link>
                            <Link to="/manage-colegio">Mi Colegio</Link>
                        </>
                    )}
                    
                    {/* ROL: CAFETERÍA */}
                    {user?.role === 'CAFETERIA' && (
                        <Link to="/manage-menu">Gestionar Menú</Link>
                    )}

                    {/* ROL: CONSUMIDORES (ESTUDIANTE O PERSONAL) */}
                    {(user?.role === 'ESTUDIANTE' || user?.role === 'PERSONAL_ACADEMICO') && (
                        <>
                            <Link to="/menu">Ver Menú</Link>
                            <Link to="/allergies" style={{ color: '#d32f2f' }}>Mis Alergias ⚠️</Link>
                        </>
                    )}

                    
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
                    
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        
                        {/* Rutas de Admin */}
                        <Route path="/manage-users" element={<UserManagementPage />} />
                        <Route path="/manage-colegio" element={<ColegioProfilePage />} />

                        {/* Rutas de Cafetería */}
                        <Route path="/manage-menu" element={<CafeteriaDashboard />} />

                        {/* Rutas de Consumidores (Estudiantes y Personal) */}
                        <Route path="/menu" element={<StudentMenuPage />} />
                        <Route path="/allergies" element={<AllergiesManager />} />
                    </Route>
                </Routes>
            </div>
        </>
    );
};

export default App;