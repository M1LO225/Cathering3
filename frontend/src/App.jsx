import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserManagementPage from './pages/UserManagementPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ColegioProfilePage from './pages/ColegioProfilePage';
import CafeteriaDashboard from './pages/CafeteriaDashboard'; // OJO: Esto es la gestión de menú
import StudentMenuPage from './pages/StudentMenuPage'; 
import AllergiesManager from './pages/AllergiesManager'; 
import CafeteriaOrdersPage from './pages/CafeteriaOrdersPage';
import StudentWalletPage from './pages/StudentWalletPage';
import CartPage from './pages/CartPage';
// --- NUEVOS IMPORTS ---
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CafeteriaHome from './pages/CafeteriaHome';

const Navigation = () => {
    const { isAuthenticated, logout, user } = useAuth(); 

    return (
        <nav>
            <Link to="/" style={{ fontWeight: '800', fontSize: '1.2rem', color: '#FFCC33' }}>
                Snack-Up
            </Link>
            
            {!isAuthenticated ? (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    <Link to="/login">Iniciar Sesión</Link>
                    <Link to="/register" style={{ backgroundColor: 'var(--color-orange)', borderRadius: '20px' }}>
                        Registrar Colegio
                    </Link>
                </div>
            ) : (
                <>
                    {user?.role === 'admin' && (
                        <>
                            <Link to="/dashboard">Panel Admin</Link> {/* Link directo al dashboard */}
                        </>
                    )}
                    
                    {user?.role === 'cafeteria' && (
                        <>
                            <Link to="/cafeteria-home">Inicio</Link>
                            <Link to="/kitchen">Cocina</Link> 
                        </>
                    )}

                    {(user?.role === 'estudiante' || user?.role === 'personal_academico') && (
                        <>
                            <Link to="/student-home">Inicio</Link>
                            <Link to="/menu">Menú</Link>
                            <Link to="/cart">Carrito</Link>
                        </>
                    )}
                    
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9em', color: '#eee' }}>
                            Hola, <strong>{user?.username}</strong>
                        </span>
                        <button 
                            onClick={logout} 
                            className="btn"
                            style={{ 
                                padding: '6px 15px', 
                                background: 'var(--color-dark-coffee)', 
                                border: '1px solid white', 
                                color:'white',
                                fontSize: '0.9rem' 
                            }}
                        >
                            Salir
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
};

const App = () => {
    const { loading, isAuthenticated, user } = useAuth();

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '100px', color: '#8B4513' }}>
            <h2>Cargando sistema...</h2>
        </div>;
    }

    // --- LÓGICA DE REDIRECCIÓN ACTUALIZADA ---
    const getHomeRedirect = () => {
        if (user?.role === 'admin') return '/dashboard';
        if (user?.role === 'cafeteria') return '/cafeteria-home'; // Nuevo Hub
        if (user?.role === 'estudiante' || user?.role === 'personal_academico') return '/student-home'; // Nuevo Hub
        return '/';
    };

    return (
        <>
            <Navigation />
            <div className="container">
                <Routes>
                    <Route path="/" element={
                        isAuthenticated ? (
                            <Navigate to={getHomeRedirect()} replace />
                        ) : (
                            <div className="landing-background">
                                <div className="cards-wrapper">
                                    <div className="landing-card card-login">
                                        <div>
                                            <h2>Bienvenido</h2>
                                            <p>
                                                La plataforma inteligente para la gestión de alimentación escolar.
                                                Consulta el menú, recarga tu billetera y haz pedidos sin filas.
                                            </p>
                                            
                                            <div style={{
                                                textAlign: 'left', 
                                                marginBottom: '10px', 
                                                fontSize: '0.75em', 
                                                color: '#999', 
                                                fontWeight: 'bold', 
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px'
                                            }}>
                                                Acceso Habilitado Para:
                                            </div>
                                            <div className="user-tags">
                                                <span className="tag">Estudiantes</span>
                                                <span className="tag">Profesores</span>
                                                <span className="tag">Cafetería</span>
                                                <span className="tag">Admin</span>
                                            </div>
                                        </div>

                                        <Link to="/login" style={{textDecoration: 'none'}}>
                                            <button className="btn btn-login">
                                                Ingresar al Sistema
                                            </button>
                                        </Link>
                                    </div>

                                    <div className="landing-card card-register">
                                        <div>
                                            <h2>Registrar Colegio</h2>
                                            <p>
                                                Inscribe a tu institución educativa para digitalizar el servicio 
                                                de cafetería y mejorar la experiencia de tus alumnos.
                                            </p>

                                            <div className="director-warning">
                                                <strong style={{color: '#D32F2F', textTransform: 'uppercase', fontSize: '0.85em'}}>Zona Administrativa</strong>
                                                <div style={{marginTop: '5px'}}>
                                                    Esta opción es exclusiva para <strong>Directores</strong>.
                                                    Si eres estudiante o profesor, solicita tus credenciales en secretaría.
                                                </div>
                                            </div>
                                        </div>

                                        <Link to="/register" style={{textDecoration: 'none'}}>
                                            <button className="btn btn-register">
                                                Soy Director - Registrar
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    } />

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'cafeteria', 'estudiante', 'personal_academico']} />}>
                        
                        {/* RUTAS DE DASHBOARDS PRINCIPALES */}
                        <Route path="/dashboard" element={<AdminDashboard />} />
                        <Route path="/student-home" element={<StudentDashboard />} />
                        <Route path="/cafeteria-home" element={<CafeteriaHome />} />

                        {/* RUTAS DE FUNCIONALIDAD */}
                        <Route path="/manage-users" element={<UserManagementPage />} />
                        <Route path="/manage-colegio" element={<ColegioProfilePage />} />
                        
                        <Route path="/manage-menu" element={<CafeteriaDashboard />} />
                        <Route path="/kitchen" element={<CafeteriaOrdersPage />} />
                        
                        <Route path="/menu" element={<StudentMenuPage />} />
                        <Route path="/allergies" element={<AllergiesManager />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wallet" element={<StudentWalletPage />} />
                    </Route>
                </Routes>
            </div>
        </>
    );
};

export default App;