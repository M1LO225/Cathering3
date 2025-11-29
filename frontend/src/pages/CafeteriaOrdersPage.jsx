import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const CafeteriaOrdersPage = () => {
    const { orderService } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Función para cargar pedidos
    const fetchOrders = async () => {
        try {
            const data = await orderService.getIncomingOrders();
            setOrders(data);
        } catch (error) {
            console.error("Error cargando pedidos:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        
        // Polling: Actualizar cada 10 segundos automáticamente
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [orderService]);


    // --- FUNCIÓN PARA CAMBIAR ESTADO ---
    const changeStatus = async (orderId, newStatus) => {
        if(!window.confirm(`¿Cambiar estado de Orden #${orderId} a ${newStatus}?`)) return;
        
        setLoading(true);
        try {

            await orderService.updateStatus(orderId, newStatus);
            

            fetchOrders(); 
        } catch (error) {
            alert("Error actualizando estado: " + error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Pedidos Entrantes (Cocina)</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {orders.length === 0 && <p>No hay pedidos pendientes por cocinar.</p>}
                
                {orders.map(order => (
                    <div key={order.id} style={{ 
                        border: '2px solid #4caf50', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        background: '#f1f8e9',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '1.1em' }}><strong>Orden #{order.id}</strong></span>
                            <span>Cliente: <strong>{order.user?.username}</strong></span>
                            <span style={{ 
                                color: order.status === 'PAID' ? '#d32f2f' : 'green', 
                                fontWeight: 'bold',
                                background: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px'
                            }}>
                                {order.status === 'PAID' ? 'NUEVO / PAGADO' : order.status}
                            </span>
                        </div>


                        <ul style={{ margin: '0', paddingLeft: '20px' }}>
                            {order.items?.map(item => (
                                <li key={item.id} style={{ marginBottom: '5px' }}>
                                    {item.quantity}x <strong style={{ fontSize: '1.05em' }}>{item.product?.nombre}</strong>
                                    {item.removed_ingredients && (
                                        <div style={{ 
                                            color: '#d32f2f', 
                                            fontWeight: 'bold', 
                                            fontSize: '0.9em',
                                            marginLeft: '10px',
                                            background: '#ffebee',
                                            display: 'inline-block',
                                            padding: '2px 5px',
                                            borderRadius: '4px'
                                        }}>
                                            SIN: {item.removed_ingredients}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>


                        <div style={{ textAlign: 'right', marginTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            

                            {order.status === 'PAID' && (
                                <button 
                                    onClick={() => changeStatus(order.id, 'EN_PREPARACION')}
                                    disabled={loading}
                                    style={{ 
                                        padding: '8px 15px', 
                                        background: '#ff9800',
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Empezar a Cocinar
                                </button>
                            )}


                            {order.status === 'EN_PREPARACION' && (
                                <button 
                                    onClick={() => changeStatus(order.id, 'LISTO')}
                                    disabled={loading}
                                    style={{ 
                                        padding: '8px 15px', 
                                        background: '#4caf50', // Verde
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Marcar como LISTO
                                </button>
                            )}


                             {order.status === 'LISTO' && (
                                <span style={{ color: '#2e7d32', fontWeight: 'bold', padding: '8px' }}>
                                    Esperando retiro por cliente...
                                </span>
                            )}

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CafeteriaOrdersPage;