// frontend/src/components/auth/LoginForm.jsx
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
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const success = await login(
      formData.usernameOrEmail, 
      formData.password
    );

    if (success) {
      // Redirigir a la página protegida (Dashboard)
      navigate('/dashboard'); 
    }
    // Si falla, el hook useAuth ya actualizó la variable 'error'
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Iniciar Sesión</h2>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

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