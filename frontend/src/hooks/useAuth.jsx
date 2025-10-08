// frontend/src/hooks/useAuth.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

// Proveedor del Contexto de Autenticación
export const AuthProvider = ({ children }) => {
    // Inicializa isAuthenticated basado en si ya existe un token
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para manejar el login
    const login = async (usernameOrEmail, password) => {
        setLoading(true);
        setError(null);
        try {
            await authService.login(usernameOrEmail, password);
            setIsAuthenticated(true);
            return true; // Éxito
        } catch (err) {
            setError(err.message);
            setIsAuthenticated(false);
            return false; // Fallo
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar el registro
    const register = async (username, email, password) => {
        setLoading(true);
        setError(null);
        try {
            await authService.register(username, email, password);
            setLoading(false);
            return true; // Éxito
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return false; // Fallo
        }
    };
    
    // Función para manejar el logout
    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    const value = {
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        authService, // Exponer el servicio para peticiones protegidas
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para consumir el contexto fácilmente
export const useAuth = () => {
    return useContext(AuthContext);
};