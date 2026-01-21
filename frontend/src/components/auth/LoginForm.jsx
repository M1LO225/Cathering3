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
            const user = await login(
                formData.usernameOrEmail,
                formData.password
            );
            if (user.role === 'admin') {
                navigate('/dashboard');
            } else if (user.role === 'cafeteria'){
                navigate('/cafeteria-home');
            } else if (user.role === 'estudiante' || user.role === 'personal_academico'){
                navigate('/student-home');
            } else {
                console.warn("Rol no reconocido, redirigiendo a home...");
                navigate('/');
            }

        } catch (error) {
            setLoginError(error.message || 'Error de conexión o credenciales incorrectas.');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card cyan" style={{ maxWidth: '450px' }}>
                <h2 className="auth-title cyan">Iniciar Sesión</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px' }}>
                    Ingresa tus credenciales para acceder
                </p>

                {loginError && (
                    <div style={{ 
                        background: '#ffebee', color: '#c62828', 
                        padding: '10px', borderRadius: '8px', marginBottom: '20px', 
                        fontSize: '0.9rem', textAlign: 'center' 
                    }}>
                        {loginError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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

                    <Button 
                        type="submit" 
                        disabled={loading} 
                        style={{ width: '100%', marginTop: '20px', background: 'var(--color-cyan)' }}
                    >
                        {loading ? 'Verificando...' : 'Entrar al Sistema'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;