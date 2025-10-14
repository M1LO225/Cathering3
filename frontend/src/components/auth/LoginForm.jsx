
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

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
     
            await login(
                formData.usernameOrEmail, 
                formData.password
            );

           
            navigate('/manage-users'); 

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