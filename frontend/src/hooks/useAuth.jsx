// Ruta: frontend/src/hooks/useAuth.jsx (CÓDIGO CORREGIDO Y COMPLETO)

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AuthService from '../services/auth.service';
import UserService from '../services/UserService'; 

const AuthContext = createContext();

// Función auxiliar para obtener el usuario del token
const parseJwt = (token) => {
    // ... (código existente para parseJwt)
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};


export const AuthProvider = ({ children }) => {
    const initialToken = localStorage.getItem('token');
    
    const [token, setToken] = useState(initialToken);
    const [user, setUser] = useState(parseJwt(initialToken));
    const [loading, setLoading] = useState(true);

    // Creación de servicios
    const authService = useMemo(() => new AuthService(), []);
    const userService = useMemo(() => token ? new UserService(token) : null, [token]);

    // Función para cerrar sesión (simplificada)
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // 🚨 1. IMPLEMENTAR LA FUNCIÓN REGISTER
    const register = async (username, email, password) => {
        setLoading(true);
        try {
            // Llama al método register de la clase AuthService
            const data = await authService.register(username, email, password);

            // Nota: En tu auth.service.js, login guarda el token, pero register solo lo retorna.
            // Para ser consistentes con login, deberías actualizar auth.service.js para que register también
            // guarde el token, O hacerlo aquí. Asumo que auth.service/register retorna { token, user }.

            // ⚠️ ADVERTENCIA: La lógica de `auth.service.js` y `useAuth.jsx` no concuerda
            // con los retornos de `login` y `register`. Ajustaremos la lógica de `useAuth`
            // para usar el token que el backend te devuelve.
            
            // Si register es exitoso, inicia sesión automáticamente (usando data.token y data.user)
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user); // Asumiendo que el backend devuelve {token, user}
            setLoading(false);
            
        } catch (error) {
            setLoading(false);
            throw error; // Propagar el error para que el formulario lo maneje
        }
    };
    
    // Función para guardar el token y actualizar el estado
    // ⚠️ Importante: Ya que Register usa Login, este método debe ser una función completa:
    const loginFn = async (usernameOrEmail, password) => {
        setLoading(true);
        try {
            // Llama al método login de la clase AuthService
            const userData = await authService.login(usernameOrEmail, password);
            
            // El login de auth.service.js ya guarda el token. 
            // Solo necesitamos actualizar los estados de React.
            const newToken = localStorage.getItem('token'); 
            setToken(newToken);
            setUser(userData);
            setLoading(false);
            
        } catch(error) {
            setLoading(false);
            throw error;
        }
    };

    // EFECTO para la gestión de la carga y la verificación de expiración del token
    useEffect(() => {
        // ... (Tu lógica de useEffect es correcta)
        if (token) {
            const parsedUser = parseJwt(token);
            const currentTime = Date.now() / 1000;

            if (parsedUser && parsedUser.exp > currentTime) {
                if (!user) {
                    setUser({ id: parsedUser.userId, username: parsedUser.username });
                }
                setLoading(false); 
            } else {
                logout();
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [token]);


    // El valor proporcionado al contexto
    const contextValue = useMemo(() => ({
        token,
        user,
        isAuthenticated: !!token,
        loading, 
        login: loginFn, // Usar la función asíncrona completa
        register,      // 🚨 2. EXPONER REGISTER
        logout,
        authService, 
        userService, 
    }), [token, user, loading, userService, loginFn, register]); // Agregar dependencias

    
    // Retorno condicional de carga
    if (loading) {
        return <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            fontSize: '1.5em' 
        }}>Cargando sesión...</div>;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);