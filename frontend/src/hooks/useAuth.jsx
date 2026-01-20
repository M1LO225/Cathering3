import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AuthService from '../services/auth.service';
import UserService from '../services/UserService';
import ColegioService from '../services/ColegioService'; 
import ProductService from '../services/ProductService';
import OrderService from '../services/OrderService';
import WalletService from '../services/WalletService';

const AuthContext = createContext();

const parseJwt = (token) => {
    try {
        // 1. Validación estricta: Si no es string o está vacío, salimos sin error
        if (!token || typeof token !== 'string') {
            return null;
        }

        // 2. Verificar estructura JWT (debe tener 3 partes separadas por puntos)
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));
        
        const decoded = JSON.parse(jsonPayload);
        
        return {
            id: decoded.id, 
            username: decoded.username,
            role: decoded.role,
            colegio_id: decoded.colegio_id,
            exp: decoded.exp 
        };
    } catch (e) {
        console.warn("JWT inválido o corrupto:", e);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    // Lectura segura del localStorage
    const initialToken = localStorage.getItem('token');
    
    // Verificamos si el token guardado es válido antes de usarlo
    const initialUser = parseJwt(initialToken);
    
    const [token, setToken] = useState(initialUser ? initialToken : null);
    const [user, setUser] = useState(initialUser); 
    const [loading, setLoading] = useState(true); 

    const authService = AuthService;
    
    // Inicialización de servicios (Solo si hay token válido)
    const userService = useMemo(() => token ? new UserService(token) : null, [token]);
    const colegioService = useMemo(() => token ? new ColegioService(token) : null, [token]);
    const productService = useMemo(() => token ? new ProductService(token) : null, [token]);
    const orderService = useMemo(() => token ? new OrderService(token) : null, [token]);
    const walletService = useMemo(() => token ? new WalletService(token) : null, [token]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const register = async (formData) => {
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

    const loginFn = async (usernameOrEmail, password) => {
        setLoading(true);
        try {
            const response = await authService.login(usernameOrEmail, password); 
            
            // Aseguramos obtener SOLO el string del token
            let tokenString = null;

            if (response && typeof response === 'string') {
                tokenString = response;
            } else if (response && response.token) {
                tokenString = response.token;
            }

            if (tokenString) {
                localStorage.setItem('token', tokenString);
                setToken(tokenString);
                setUser(parseJwt(tokenString)); 
            } else {
                console.error("Respuesta de login no contiene un token válido:", response);
            }

            setLoading(false);
            return response;
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
            
            // Si el token expira o es inválido (parsedUser es null)
            if (parsedUser && parsedUser.exp > currentTime) {
                if (!user) {
                    setUser(parsedUser);
                }
            } else {
                logout(); 
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [token]); 

    const contextValue = useMemo(() => ({
        token,
        user, 
        isAuthenticated: !!user, 
        loading,
        login: loginFn,
        register,
        logout,
        authService,
        userService,     
        colegioService,
        productService,
        orderService,
        walletService
    }), [token, user, loading, userService, colegioService, productService, orderService, walletService, loginFn, register]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);