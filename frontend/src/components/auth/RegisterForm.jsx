import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
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
            const { confirmPassword, ...dataToSubmit } = formData;
            
            await register(dataToSubmit); 
            setSuccessMessage('¡Colegio registrado! Serás redirigido al Login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setSubmitError(error.message || 'Error en el registro.');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card orange" style={{ maxWidth: '700px' }}>
                <h2 className="auth-title orange">Registro Institucional</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
                    Da de alta a tu colegio y crea la cuenta de administrador.
                </p>
                
                <div style={{ textAlign: 'center', marginBottom: '30px', fontSize: '0.85em', background: '#FFF3E0', color: '#E65100', padding: '10px', borderRadius: '8px' }}>
                    Formulario exclusivo para Directores
                </div>

                {submitError && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>⚠️ {submitError}</div>}
                {successMessage && <div style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>✅ {successMessage}</div>}
                
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-section-title">Datos del Administrador</div>
                    
                    <div className="form-grid">
                        <Input label="Usuario Admin" id="username" name="username" value={formData.username} onChange={handleChange} required />
                        <Input label="Email Institucional" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-grid">
                        <Input label="Contraseña" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        <Input label="Confirmar Contraseña" id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>

                    <div className="form-section-title">Datos del Colegio</div>
                    
                    <Input label="Nombre de la Institución" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                    
                    <div className="form-grid">
                        <Input label="Teléfono" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
                        <Input label="Dirección" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
                    </div>

                    <div className="form-grid">
                        <Input label="Ciudad" id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                        <Input label="Provincia" id="provincia" name="provincia" value={formData.provincia} onChange={handleChange} />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading} 
                        style={{ width: '100%', marginTop: '30px', background: 'var(--color-orange)' }}
                    >
                        {loading ? 'Registrando...' : 'Completar Registro'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;