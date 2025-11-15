import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AuthService from '../services/auth.service';
import UserService from '../services/UserService';
import ColegioService from '../services/ColegioService'; 

const AuthContext = createContext();

// Función de parseo de JWT mejorada
const parseJwt = (token) => {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));
        
        const decoded = JSON.parse(jsonPayload);
        // Asumimos que el payload tiene 'userId', 'username', 'role' y 'colegio_id'
        return {
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            colegio_id: decoded.colegio_id
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
    const [loading, setLoading] = useState(true); 

    const authService = useMemo(() => new AuthService(), []);
    
    // Servicios que dependen del token
    const userService = useMemo(() => token ? new UserService(token) : null, [token]);
    const colegioService = useMemo(() => token ? new ColegioService(token) : null, [token]);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // FUNCIÓN DE REGISTRO ACTUALIZADA
    const register = async (formData) => {
        setLoading(true);
        try {
            // authService.register ahora espera el objeto completo
            const data = await authService.register(formData); 
            // El backend ya no devuelve token/usuario en el registro, solo un mensaje
            setLoading(false);
            return data; // Devuelve el mensaje de éxito
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    // FUNCIÓN DE LOGIN ACTUALIZADA
    const loginFn = async (usernameOrEmail, password) => {
        setLoading(true);
        try {
            // authService.login guarda el token en localStorage
            await authService.login(usernameOrEmail, password); 
            const newToken = localStorage.getItem('token');
            setToken(newToken);
            setUser(parseJwt(newToken)); // Parseamos el nuevo token
            setLoading(false);
            return true;
        } catch(error) {
            setLoading(false);
            throw error;
        }
    };

    useEffect(() => {
        setLoading(true);
        if (token) {
            const parsedUser = parseJwt(token);
            const currentTime = Date.now() / 1000;
            
            if (parsedUser && parsedUser.exp > currentTime) {
                setUser(parsedUser); // Aseguramos que el estado 'user' tenga toda la info
            } else {
                logout(); // Token expirado
            }
        }
        setLoading(false);
    }, [token]);

    const contextValue = useMemo(() => ({
        token,
        user, // <-- 'user' ahora contiene { id, username, role, colegio_id }
        isAuthenticated: !!token,
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