import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const CafeteriaOrdersPage = () => {
    const { orderService } = useAuth();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await orderService.getIncomingOrders();
                setOrders(data);
            } catch (error) {
                console.error(error);
            }
        };
        // Polling: Actualizar cada 10 segundos automáticamente
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [orderService]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Pedidos Entrantes (Cocina)</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {orders.length === 0 && <p>No hay pedidos pendientes.</p>}
                
                {orders.map(order => (
                    <div key={order.id} style={{ border: '2px solid #4caf50', padding: '15px', borderRadius: '8px', background: '#f1f8e9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                            <strong>Orden #{order.id}</strong>
                            <span>Cliente: {order.user?.username}</span>
                            <span style={{ color: 'green', fontWeight: 'bold' }}>{order.status}</span>
                        </div>
                        <ul style={{ marginTop: '10px' }}>
                            {order.items?.map(item => (
                                <li key={item.id}>
                                    {item.quantity}x <strong>{item.product?.nombre}</strong>
                                    {item.removed_ingredients && (
                                        <span style={{ color: 'red', marginLeft: '10px', fontSize: '0.9em' }}>
                                            Sin: {item.removed_ingredients}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <button onClick={() => alert("Funcionalidad 'Listo' pendiente de implementar")}>
                            Marcar como Listo 
                        </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CafeteriaOrdersPage;