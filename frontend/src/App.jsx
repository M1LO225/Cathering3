import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; //Ruta que no esta en uso
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
            {/* El home puede ser público o redirigir al login */}
            <Link to="/">App Cathering</Link>
            
            {!isAuthenticated ? (
                <>
                    <Link to="/login">Iniciar Sesión</Link>
                    <Link to="/register">Registrar Colegio</Link>
                </>
            ) : (
                <>
                    {/* --- SECCIÓN ADMIN COLEGIO --- */}
                    {user?.role === 'COLEGIO_ADMIN' && (
                        <>
                            <Link to="/manage-users">👥 Usuarios</Link>
                            <Link to="/manage-colegio">🏫 Mi Colegio</Link>
                        </>
                    )}
                    
                    {/* --- SECCIÓN CAFETERÍA --- */}
                    {user?.role === 'CAFETERIA' && (
                        <Link to="/manage-menu">🍔 Gestionar Menú</Link>
                    )}

                    {/* --- SECCIÓN CONSUMIDORES (ESTUDIANTE/PERSONAL) --- */}
                    {(user?.role === 'ESTUDIANTE' || user?.role === 'PERSONAL_ACADEMICO') && (
                        <>
                            <Link to="/menu">🍽️ Ver Menú</Link>
                            <Link to="/allergies" style={{ color: '#ffeb3b' }}>⚠️ Mis Alergias</Link>
                        </>
                    )}
                    
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8em' }}>Hola, {user?.username} ({user?.role})</span>
                        <button onClick={logout} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.2)' }}>
                            Salir
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
};

const App = () => {
    const { loading } = useAuth();

    if (loading) {
         return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>;
    }

    return (
        <>
            <Navigation />
            <div className="container">
                <Routes>
                    <Route path="/" element={
                        <div style={{textAlign: 'center', marginTop: '50px'}}>
                            <h1>Bienvenido a App Cathering</h1>
                            <p>Gestión inteligente de cafeterías escolares.</p>
                        </div>
                    } />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    <Route element={<ProtectedRoute />}>
                        {/* Rutas Admin */}
                        <Route path="/manage-users" element={<UserManagementPage />} />
                        <Route path="/manage-colegio" element={<ColegioProfilePage />} />

                        {/* Rutas Cafeteria */}
                        <Route path="/manage-menu" element={<CafeteriaDashboard />} />

                        {/* Rutas Consumidor */}
                        <Route path="/menu" element={<StudentMenuPage />} />
                        <Route path="/allergies" element={<AllergiesManager />} />
                        
                        {/* Ruta fallback (opcional, por si entran manualmente a /dashboard) */}
                        <Route path="/dashboard" element={<div style={{padding: 20}}>Selecciona una opción del menú.</div>} />
                    </Route>
                </Routes>
            </div>
        </>
    );
};

export default App;