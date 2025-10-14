

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  

  const { register, loading } = useAuth(); 
  const navigate = useNavigate();
  
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState(null); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMessage('');
    setSubmitError(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setSubmitError(null);

    if (formData.password !== formData.confirmPassword) {
      setSubmitError('Las contraseñas no coinciden.');
      return;
    }

    try {
        await register(
            formData.username, 
            formData.email, 
            formData.password
        );

        
        setSuccessMessage('¡Registro exitoso! Serás redirigido al Login.');
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        
       
        setTimeout(() => navigate('/login'), 2000); 

    } catch (error) {
        
        setSubmitError(error.message || 'Error desconocido durante el registro.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Registro de Usuario</h2>
      

      {submitError && <p style={{ color: 'red' }}>Error: {submitError}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      
    
      <Input
        label="Nombre de Usuario"
        id="username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <Input
        label="Email"
        id="email"
        name="email"
        type="email"
        value={formData.email}
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
      <Input
        label="Confirmar Contraseña"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />

      <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </Button>
    </form>
  );
};

export default RegisterForm;