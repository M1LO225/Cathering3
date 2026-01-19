import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { cart, removeFromCart, clearCart, total } = useCart();
    const { walletService, orderService, user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const navigate = useNavigate();

    // Cargar saldo al entrar
    useEffect(() => {
        if (walletService) {
            walletService.getBalance()
                .then(data => {
                    setBalance(data.saldo || 0);
                    setLoadingBalance(false);
                })
                .catch(err => {
                    console.error("Error cargando saldo:", err);
                    setLoadingBalance(false);
                });
        }
    }, [walletService]);

    const handleCheckout = async () => {
        if (balance < total) {
            alert("Saldo insuficiente. Por favor recarga tu billetera.");
            return;
        }

        try {
            const orderItems = cart.map(item => ({
                name: item.name,     
                price: item.price,    
                quantity: item.quantity
            }));

            await orderService.createOrder(orderItems);
            
            alert("¡Pedido realizado con éxito!");
            clearCart();
            // Recargamos el saldo para ver el descuento
            const newBalance = await walletService.getBalance();
            setBalance(newBalance.saldo);
            navigate('/dashboard'); // O a historial de pedidos
        } catch (error) {
            alert("Error al procesar el pedido: " + error.message);
        }
    };

    if (cart.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center' }}><h2>Tu carrito está vacío</h2></div>;
    }

    return (
        <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Lista de Items */}
            <div style={{ flex: 2, minWidth: '300px' }}>
                <h2>Resumen del Pedido</h2>
                {cart.map(item => (
                    <div key={item.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '15px',
                        borderBottom: '1px solid #eee',
                        marginBottom: '10px'
                    }}>
                        <div>
                            {/* CAMBIO CLAVE: name y price en Inglés */}
                            <h4 style={{ margin: 0 }}>{item.name}</h4>
                            <p style={{ margin: 0, color: '#666' }}>
                                ${item.price} x {item.quantity}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontWeight: 'bold' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <Button 
                                onClick={() => removeFromCart(item.id)}
                                style={{ background: '#ffcdd2', color: '#c62828', padding: '5px 10px' }}
                            >
                                🗑️
                            </Button>
                        </div>
                    </div>
                ))}
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <h3>Total: ${total.toFixed(2)}</h3>
                </div>
            </div>

            {/* Panel de Pago */}
            <div style={{ flex: 1, minWidth: '250px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                <h3>Método de Pago</h3>
                <div style={{ background: 'white', padding: '15px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #ddd' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#555' }}>Tu Saldo Disponible:</p>
                    {loadingBalance ? (
                        <span>Cargando...</span>
                    ) : (
                        <h2 style={{ margin: 0, color: balance < total ? '#d32f2f' : '#2e7d32' }}>
                            ${parseFloat(balance).toFixed(2)}
                        </h2>
                    )}
                </div>

                {balance < total && (
                    <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9em' }}>
                        Saldo insuficiente. Te faltan ${(total - balance).toFixed(2)}
                    </div>
                )}

                <Button 
                    onClick={handleCheckout} 
                    style={{ width: '100%', marginBottom: '10px' }}
                    disabled={balance < total}
                >
                    Confirmar y Pagar
                </Button>
                
                <Button 
                    onClick={() => navigate('/wallet')} 
                    style={{ width: '100%', background: 'transparent', border: '1px solid #1976d2', color: '#1976d2' }}
                >
                    Ir a Recargar Saldo
                </Button>
            </div>
        </div>
    );
};

export default CartPage;