import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        // Datos del Admin
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        // Datos del Colegio
        nombre: "",
        direccion: "",
        telefono: "", 
        ciudad: "",
        provincia: "",
    });
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState("");
    const [submitError, setSubmitError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccessMessage("");
        setSubmitError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setSubmitError(null);

        if (formData.password !== formData.confirmPassword) {
            setSubmitError('Las contraseñas no coinciden.');
            return;
        }

        try {
            // No necesitamos enviar 'confirmPassword' al backend
            const { confirmPassword, ...dataToSubmit } = formData;
            
            await register(dataToSubmit); // Envía el objeto completo
            setSuccessMessage('¡Colegio registrado! Serás redirigido al Login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setSubmitError(error.message || 'Error en el registro.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>Registro de Colegio y Administrador</h2>
            {submitError && <p style={{ color: 'red' }}>Error: {submitError}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            
            <fieldset style={{border: '1px solid #ccc', borderRadius: '8px', marginBottom: '15px'}}>
                <legend>Datos del Administrador</legend>
                <Input label="Nombre de Usuario (Admin)" id="username" name="username" value={formData.username} onChange={handleChange} required />
                <Input label="Email (Admin)" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <Input label="Contraseña" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                <Input label="Confirmar Contraseña" id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
            </fieldset>

            <fieldset style={{border: '1px solid #ccc', borderRadius: '8px', marginBottom: '15px'}}>
                <legend>Datos de la Institución (Colegio)</legend>
                <Input label="Nombre del Colegio" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                <Input label="Dirección" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
                <Input label="Teléfono (10 dígitos)" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
                <Input label="Ciudad" id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                <Input label="Provincia" id="provincia" name="provincia" value={formData.provincia} onChange={handleChange} />
            </fieldset>

            <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                {loading ? 'Registrando...' : 'Registrar Institución'}
            </Button>
        </form>
    );
};

export default RegisterForm;