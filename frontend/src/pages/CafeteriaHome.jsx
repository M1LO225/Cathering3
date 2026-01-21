import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Iconos SVG
const KitchenIcon = () => (
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" y1="17" x2="18" y2="17"></line></svg>
);
const EditMenuIcon = () => (
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const CafeteriaHome = () => {
    const { user } = useAuth();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Encabezado */}
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '40px', 
                padding: '40px', 
                background: 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))', // Tonos café
                borderRadius: '20px',
                color: 'white',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Centro de Control de Cocina</h1>
                <p style={{ fontSize: '1.1rem', marginTop: '10px', opacity: 0.9 }}>
                    Gestiona pedidos entrantes y el menú del día.
                </p>
            </div>

            {/* Grid Principal */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '30px' 
            }}>
                
                {/* TARJETA 1: PANTALLA DE COCINA (Pedidos en tiempo real) */}
                <div style={cardStyle}>
                    <div style={{ color: 'var(--color-success)', marginBottom: '20px' }}><KitchenIcon /></div>
                    <h2 style={{ margin: '0 0 10px 0', color: 'var(--color-secondary)' }}>Pedidos Entrantes</h2>
                    <p style={{ color: '#666', marginBottom: '30px' }}>
                        Visualiza los pedidos pagados, cambia estados de preparación y marca entregas.
                    </p>
                    <Link to="/kitchen" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ 
                            width: '100%', 
                            padding: '15px',
                            fontSize: '1.1rem',
                            background: 'var(--color-success)', 
                            color: 'white' 
                        }}>
                            Abrir Pantalla de Cocina
                        </button>
                    </Link>
                </div>

                {/* TARJETA 2: GESTIÓN DE MENÚ */}
                <div style={cardStyle}>
                    <div style={{ color: 'var(--color-orange)', marginBottom: '20px' }}><EditMenuIcon /></div>
                    <h2 style={{ margin: '0 0 10px 0', color: 'var(--color-secondary)' }}>Editar Menú</h2>
                    <p style={{ color: '#666', marginBottom: '30px' }}>
                        Agrega nuevos productos, actualiza precios o gestiona ingredientes y stock.
                    </p>
                    <Link to="/manage-menu" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ 
                            width: '100%', 
                            padding: '15px',
                            fontSize: '1.1rem',
                            background: 'var(--color-orange)', 
                            color: 'white' 
                        }}>
                            Gestionar Productos
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
};

const cardStyle = {
    background: 'white',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    border: '1px solid #eee'
};

export default CafeteriaHome;