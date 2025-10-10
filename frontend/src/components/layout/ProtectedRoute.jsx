// frontend/src/components/layout/ProtectedRoute.jsx (CÓDIGO CORREGIDO Y FINAL)

import React from 'react';
// 🚨 Importar Outlet
import { Navigate, Outlet } from 'react-router-dom'; 
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = () => {
    // 🚨 Extraer loading también, es vital para evitar el parpadeo
    const { isAuthenticated, loading } = useAuth(); 
    
    // 1. Mostrar carga mientras se verifica la sesión.
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando sesión...</div>;
    }

    // 2. Si no está autenticado (y ya terminó de cargar), redirige al login.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si está autenticado, renderiza el componente anidado (UserManagementPage).
    // 💥 ESTO SOLUCIONA LA REDIRECCIÓN DE CONTENIDO.
    return <Outlet />; 
};

export default ProtectedRoute;