import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { cart, removeFromCart, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [isPaying, setIsPaying] = useState(false);
    
    // Estado del formulario de pago
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });

    const handlePayment = (e) => {
        e.preventDefault();
        // SIMULACIÓN DE PROCESO DE PAGO SEGURO
        if (cardData.number.length < 16) return alert("Número de tarjeta inválido");

        // Aquí llamaríamos al backend para crear la ORDER
        alert(" Pago procesado correctamente. ¡Tu pedido está en cocina!");
        clearCart();
        navigate('/menu');
    };

    if (cart.length === 0) return <div style={{padding:20}}>Tu carrito está vacío.</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '40px' }}>
            
            {/* COLUMNA 1: DETALLE */}
            <div style={{ flex: 1 }}>
                <h2>Tu Pedido</h2>
                {cart.map(item => (
                    <div key={item.cartId} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{item.nombre}</strong>
                            <span>${item.precio}</span>
                        </div>
                        {item.removedIngredients.length > 0 && (
                            <div style={{ color: '#d32f2f', fontSize: '0.85em' }}>
                                 Sin: {item.removedIngredients.join(', ')}
                            </div>
                        )}
                        <button onClick={() => removeFromCart(item.cartId)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8em', marginTop: '5px' }}>
                            Eliminar
                        </button>
                    </div>
                ))}
                <h3 style={{ textAlign: 'right' }}>Total: ${total.toFixed(2)}</h3>
            </div>

            {/* COLUMNA 2: PASARELA DE PAGO */}
            <div style={{ flex: 1, background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
                <h3>Pago Seguro</h3>
                <form onSubmit={handlePayment}>
                    <Input label="Titular de la Tarjeta" value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})} required />
                    <Input label="Número de Tarjeta" placeholder="0000 0000 0000 0000" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} required />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Input label="Expira (MM/YY)" placeholder="12/25" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} required />
                        <Input label="CVV" type="password" placeholder="123" value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})} required />
                    </div>
                    <Button type="submit" style={{ width: '100%', marginTop: '10px' }}>
                        Pagar ${total.toFixed(2)}
                    </Button>
                    <p style={{ fontSize: '0.7em', color: '#888', marginTop: '10px', textAlign: 'center' }}>
                         Transacción encriptada de extremo a extremo.
                    </p>
                </form>
            </div>

        </div>
    );
};

export default CartPage;