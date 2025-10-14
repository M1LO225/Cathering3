

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AuthService from '../services/auth.service';
import UserService from '../services/UserService'; 

const AuthContext = createContext();


const parseJwt = (token) => {

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


    const authService = useMemo(() => new AuthService(), []);
    const userService = useMemo(() => token ? new UserService(token) : null, [token]);


    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };


    const register = async (username, email, password) => {
        setLoading(true);
        try {

            const data = await authService.register(username, email, password);

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user); 
            setLoading(false);
            
        } catch (error) {
            setLoading(false);
            throw error; 
        }
    };
    

    const loginFn = async (usernameOrEmail, password) => {
        setLoading(true);
        try {

            const userData = await authService.login(usernameOrEmail, password);
            

            const newToken = localStorage.getItem('token'); 
            setToken(newToken);
            setUser(userData);
            setLoading(false);
            return true;
            
        } catch(error) {
            setLoading(false);
            throw error;
        }
    };

    useEffect(() => {

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


    
    const contextValue = useMemo(() => ({
        token,
        user,
        isAuthenticated: !!token,
        loading, 
        login: loginFn, 
        register,      
        logout,
        authService, 
        userService, 
    }), [token, user, loading, userService, loginFn, register]); 

    
    
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