import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Encabezado de Bienvenida */}
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '40px', 
                padding: '40px', 
                background: 'linear-gradient(135deg, var(--color-orange), var(--color-secondary))',
                borderRadius: '20px',
                color: 'white',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Panel de Administración</h1>
                <p style={{ fontSize: '1.2rem', marginTop: '10px', opacity: 0.9 }}>
                    Bienvenido, {user?.username}.
                </p>
            </div>

            {/* Grid de Accesos Rápidos */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '30px' 
            }}>
                
                {/* TARJETA 1: GESTIÓN DE USUARIOS */}
                <div style={cardStyle}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👥</div>
                    <h3 style={{ color: 'var(--color-secondary)', margin: '0 0 10px 0' }}>Gestionar Usuarios</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Administra cuentas de estudiantes y personal.
                    </p>
                    <Link to="/manage-users" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ 
                            width: '100%', 
                            background: 'var(--color-secondary)', 
                            color: 'white' 
                        }}>
                            Ir a Usuarios
                        </button>
                    </Link>
                </div>

                {/* TARJETA 2: PERFIL DEL COLEGIO */}
                <div style={cardStyle}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏫</div>
                    <h3 style={{ color: 'var(--color-cyan)', margin: '0 0 10px 0' }}>Perfil del Colegio</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Actualiza la información de la institución.
                    </p>
                    <Link to="/manage-colegio" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ 
                            width: '100%', 
                            background: 'var(--color-cyan)', 
                            color: 'white' 
                        }}>
                            Editar Colegio
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const cardStyle = {
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    border: '1px solid #eee'
};

export default AdminDashboard;