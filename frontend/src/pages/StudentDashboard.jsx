import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Iconos SVG como componentes simples para mantener el código limpio
const MenuIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const WalletIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);
const AllergyIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);
const CartIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);

const StudentDashboard = () => {
    const { user } = useAuth();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Encabezado */}
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '40px', 
                padding: '40px', 
                background: 'linear-gradient(135deg, var(--color-cyan), var(--color-primary))', // Cian a Amarillo
                borderRadius: '20px',
                color: 'var(--color-dark-coffee)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
            }}>
                <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    Hola, {user?.username}
                </h1>
                <p style={{ fontSize: '1.1rem', marginTop: '10px', color: '#fff', opacity: 0.9 }}>
                    ¿Qué se te antoja comer hoy?
                </p>
            </div>

            {/* Grid de Opciones */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '25px' 
            }}>
                
                {/* TARJETA 1: VER MENÚ (Acción Principal) */}
                <div style={cardStyle}>
                    <div style={{ color: 'var(--color-orange)', marginBottom: '15px' }}><MenuIcon /></div>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-secondary)' }}>Menú del Día</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                        Explora los platos disponibles y haz tu pedido ahora.
                    </p>
                    <Link to="/menu" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ width: '100%', background: 'var(--color-orange)', color: 'white' }}>
                            Ver Menú
                        </button>
                    </Link>
                </div>

                {/* TARJETA 2: BILLETERA */}
                <div style={cardStyle}>
                    <div style={{ color: 'var(--color-cyan)', marginBottom: '15px' }}><WalletIcon /></div>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-secondary)' }}>Mi Billetera</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                        Recarga saldo y revisa tu historial de transacciones.
                    </p>
                    <Link to="/wallet" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ width: '100%', background: 'var(--color-cyan)', color: 'white' }}>
                            Gestionar Saldo
                        </button>
                    </Link>
                </div>

                {/* TARJETA 3: ALERGIAS */}
                <div style={cardStyle}>
                    <div style={{ color: 'var(--color-danger)', marginBottom: '15px' }}><AllergyIcon /></div>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-secondary)' }}>Mis Alergias</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                        Configura ingredientes que debes evitar por salud.
                    </p>
                    <Link to="/allergies" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ width: '100%', background: 'var(--color-danger)', color: 'white' }}>
                            Configurar
                        </button>
                    </Link>
                </div>

                {/* TARJETA 4: CARRITO */}
                <div style={cardStyle}>
                    <div style={{ color: 'var(--color-secondary)', marginBottom: '15px' }}><CartIcon /></div>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-secondary)' }}>Mi Carrito</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                        Revisa los items seleccionados antes de pagar.
                    </p>
                    <Link to="/cart" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ width: '100%', background: 'var(--color-secondary)', color: 'white' }}>
                            Ir a Pagar
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
};

// Estilo reutilizable
const cardStyle = {
    background: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    border: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
};

export default StudentDashboard;