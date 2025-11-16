import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AuthService from '../services/auth.service';
import UserService from '../services/UserService';
import ColegioService from '../services/ColegioService'; 

const AuthContext = createContext();

// Función de parseo de JWT (CORREGIDA)
const parseJwt = (token) => {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));
        
        const decoded = JSON.parse(jsonPayload);
        
        // AHORA INCLUIMOS 'exp'
        return {
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            colegio_id: decoded.colegio_id,
            exp: decoded.exp // <-- CAMBIO IMPORTANTE
        };
    } catch (e) {
        console.error("Failed to parse JWT:", e);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const initialToken = localStorage.getItem('token');
    const [token, setToken] = useState(initialToken);
    const [user, setUser] = useState(parseJwt(initialToken)); 
    const [loading, setLoading] = useState(true); // Debe empezar en true

    const authService = useMemo(() => new AuthService(), []);
    const userService = useMemo(() => token ? new UserService(token) : null, [token]);
    const colegioService = useMemo(() => token ? new ColegioService(token) : null, [token]);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const register = async (formData) => {
        // (Tu función de registro está bien)
        setLoading(true);
        try {
            const data = await authService.register(formData); 
            setLoading(false);
            return data;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    // FUNCIÓN DE LOGIN (CORREGIDA)
    const loginFn = async (usernameOrEmail, password) => {
        setLoading(true);
        try {
            // authService.login() devuelve el { user } y guarda el token
            const userData = await authService.login(usernameOrEmail, password); 
            const newToken = localStorage.getItem('token');
            
            // CAMBIO IMPORTANTE: Establecemos el usuario PRIMERO
            setUser(userData); 
            // AHORA establecemos el token (esto disparará el useEffect)
            setToken(newToken); 

            setLoading(false);
            return true;
        } catch(error) {
            setLoading(false);
            throw error;
        }
    };

    // useEffect (CORREGIDO)
    useEffect(() => {
        setLoading(true);
        if (token) {
            const parsedUser = parseJwt(token); // Ahora 'parsedUser' tiene 'exp'
            const currentTime = Date.now() / 1000;
            
            if (parsedUser && parsedUser.exp > currentTime) {
                // Si el estado 'user' está vacío (ej. al recargar la página),
                // lo llenamos con los datos del token.
                if (!user) {
                    setUser(parsedUser);
                }
            } else {
                logout(); // Token expirado
            }
        } else {
            // Si no hay token, nos aseguramos de que el usuario sea nulo
            setUser(null);
        }
        setLoading(false);
    }, [token]); // Solo se ejecuta cuando el token cambia

    const contextValue = useMemo(() => ({
        token,
        user, 
        isAuthenticated: !!user, // CAMBIO: Autenticado si hay objeto 'user'
        loading,
        login: loginFn,
        register,
        logout,
        authService,
        userService,
        colegioService 
    }), [token, user, loading, authService, userService, colegioService, loginFn, register]);

    
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);