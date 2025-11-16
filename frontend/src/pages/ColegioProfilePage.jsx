// frontend/src/pages/ColegioProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ColegioProfilePage = () => {
    const { colegioService, logout } = useAuth();
    const [formData, setFormData] = useState({
        nombre: "",
        direccion: "",
        telefono: "",
        ciudad: "",
        provincia: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchColegioData = async () => {
            if (!colegioService) return;
            try {
                const data = await colegioService.getMyColegioDetails();
                setFormData({
                    nombre: data.nombre || "",
                    direccion: data.direccion || "",
                    telefono: data.telefono || "",
                    ciudad: data.ciudad || "",
                    provincia: data.provincia || "",
                });
            } catch (err) {
                setError(err.message);
                if (err.message.includes('401') || err.message.includes('403')) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };
        fetchColegioData();
    }, [colegioService, logout]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await colegioService.updateMyColegioDetails(formData);
            setSuccess('¡Perfil del colegio actualizado con éxito!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.nombre) {
        return <div className="loading">Cargando perfil del colegio...</div>;
    }

    return (
        <div className="colegio-profile-container">
            <h1>Perfil de mi Institución</h1>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
                <Input label="Nombre del Colegio" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                <Input label="Dirección" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
                <Input label="Teléfono (10 dígitos)" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
                <Input label="Ciudad" id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                <Input label="Provincia" id="provincia" name="provincia" value={formData.provincia} onChange={handleChange} />
                
                <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                    {loading ? 'Actualizando...' : 'Guardar Cambios'}
                </Button>
            </form>
        </div>
    );
};

export default ColegioProfilePage;