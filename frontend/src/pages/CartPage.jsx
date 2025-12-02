import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth'; 
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { cart, removeFromCart, total, clearCart } = useCart();
    const { orderService, walletService } = useAuth(); 
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0);

    // Cargar saldo al entrar al carrito
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                if(walletService) {
                    const data = await walletService.getBalance();
                    setBalance(data.saldo);
                }
            } catch (error) {
                console.error("Error cargando saldo", error);
            }
        };
        fetchBalance();
    }, [walletService]);

    const handlePayment = async () => {
        if (cart.length === 0) return;

        // Validación visual antes de enviar
        if (balance < total) {
            alert("No tienes saldo suficiente. Por favor recarga tu billetera.");
            return;
        }

        if (!window.confirm(`¿Confirmar pago de $${total.toFixed(2)} con tu saldo?`)) return;

        setLoading(true);
        try {
            await orderService.createOrder(cart);
            
            alert("¡Pedido Confirmado! La cocina ha recibido tu orden.");
            clearCart(); 
            navigate('/menu'); 
            
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) return <div style={{padding:'40px', textAlign:'center'}}>Tu carrito está vacío 🛒</div>;

    const canPay = balance >= total;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            
            {/* COLUMNA 1: DETALLE DEL PEDIDO */}
            <div style={{ flex: 2, minWidth: '300px' }}>
                <h2>Resumen del Pedido</h2>
                {cart.map(item => (
                    <div key={item.cartId} style={{ borderBottom: '1px solid #eee', padding: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>{item.nombre}</strong>
                            {item.removedIngredients && item.removedIngredients.length > 0 && (
                                <div style={{ color: '#d32f2f', fontSize: '0.85em' }}>
                                    Sin: {item.removedIngredients.join(', ')}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span>${item.precio}</span>
                            <button 
                                onClick={() => removeFromCart(item.cartId)} 
                                style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
                <h3 style={{ textAlign: 'right', marginTop: '20px', fontSize: '1.5em' }}>Total: ${total.toFixed(2)}</h3>
            </div>

            {/* COLUMNA 2: PAGO CON BILLETERA */}
            <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ background: '#f0f4f8', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Método de Pago</h3>
                    
                    <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#666' }}>Tu Saldo Disponible:</p>
                        <div style={{ fontSize: '2em', fontWeight: 'bold', color: canPay ? '#27ae60' : '#e74c3c' }}>
                            ${parseFloat(balance).toFixed(2)}
                        </div>
                    </div>

                    {!canPay && (
                        <div style={{ color: '#c0392b', marginBottom: '15px', fontSize: '0.9em', background: '#fadbd8', padding: '10px', borderRadius: '5px' }}>
                            Saldo insuficiente. Te faltan ${(total - balance).toFixed(2)}
                        </div>
                    )}

                    <Button 
                        onClick={handlePayment} 
                        disabled={!canPay || loading} 
                        style={{ 
                            width: '100%', 
                            background: canPay ? '#27ae60' : '#95a5a6',
                            padding: '15px',
                            fontSize: '1.1em'
                        }}
                    >
                        {loading ? 'Procesando...' : 'Confirmar y Pagar'}
                    </Button>

                    {!canPay && (
                        <button 
                            onClick={() => navigate('/wallet')}
                            style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: '1px solid #2980b9', color: '#2980b9', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Ir a Recargar Saldo
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CartPage;