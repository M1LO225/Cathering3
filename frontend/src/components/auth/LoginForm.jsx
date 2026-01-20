
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import { Navigate, useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: '',
    });
    

    const { login, loading } = useAuth(); 
    const navigate = useNavigate();
    

    const [loginError, setLoginError] = useState(null); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setLoginError(null); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError(null); 
        
        try {
            const user = await login(
                formData.usernameOrEmail,
                formData.password
            );
            if (user.role === 'admin') {
                navigate('/manage-users');
            }else if (user.role === 'cafeteria'){
                navigate('/manage-menu');
            }else if (user.role === 'estudiante' || user.role === 'personal_academico'){
                navigate('/menu');
            } else {
                navigate('/dashboard'); // Fallback por si acaso
            }

        } catch (error) {
    
            setLoginError(error.message || 'Error de conexión o credenciales incorrectas.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Iniciar Sesión</h2>
            
       
            {loginError && <p style={{ color: 'red' }}>Error: {loginError}</p>} 

            <Input
                label="Usuario o Email"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
            />
            <Input
                label="Contraseña"
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
            />

            <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                {loading ? 'Iniciando...' : 'Entrar'}
            </Button>
        </form>
    );
};

export default LoginForm;