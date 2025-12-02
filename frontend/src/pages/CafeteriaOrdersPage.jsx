import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const CafeteriaOrdersPage = () => {
    const { orderService } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null); // Estado para mensajes de error

    const fetchOrders = async () => {
        try {
            const data = await orderService.getIncomingOrders();
            
            // VERIFICACIÓN DE SEGURIDAD: Asegurarse de que data sea un array
            if (Array.isArray(data)) {
                setOrders(data);
                setErrorMsg(null);
            } else {
                console.error("Se esperaba un array, se recibió:", data);
                // Si el backend manda un objeto de error, lo mostramos
                setErrorMsg(data.error || "Error al obtener pedidos: Formato de datos inválido");
                setOrders([]); // Ponemos lista vacía para evitar el crash
            }
        } catch (error) {
            console.error("Error cargando pedidos:", error);
            setErrorMsg("Error de conexión con el servidor.");
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [orderService]);

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
            
            {/* Mostrar mensaje de error si existe */}
            {errorMsg && (
                <div style={{ padding: '10px', background: '#ffebee', color: '#d32f2f', borderRadius: '4px', marginBottom: '20px' }}>
                    <strong>Error:</strong> {errorMsg}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!errorMsg && orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No hay pedidos pendientes por cocinar.</p>
                    </div>
                )}
                
                {/* Renderizado Seguro: Solo hacemos map si orders es un array válido */}
                {Array.isArray(orders) && orders.map(order => (
                    <div key={order.id} style={{ 
                        border: '2px solid #4caf50', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        background: '#f1f8e9',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '1.1em' }}><strong>Orden #{order.id}</strong></span>
                            <span>Cliente: <strong>{order.user?.username || 'Usuario desconocido'}</strong></span>
                            <span style={{ 
                                color: order.status === 'PAID' ? '#d32f2f' : 'green', 
                                fontWeight: 'bold',
                                background: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}>
                                {order.status === 'PAID' ? 'NUEVO' : order.status}
                            </span>
                        </div>

                        <ul style={{ margin: '0', paddingLeft: '20px' }}>
                            {order.items?.map(item => (
                                <li key={item.id} style={{ marginBottom: '5px' }}>
                                    {item.quantity}x <strong style={{ fontSize: '1.05em' }}>{item.product?.nombre || 'Producto'}</strong>
                                    
                                    {item.removed_ingredients && item.removed_ingredients.length > 0 && (
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
                                            🚫 SIN: {item.removed_ingredients}
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
                                    style={{ padding: '10px 20px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    👨‍🍳 Empezar a Cocinar
                                </button>
                            )}

                            {order.status === 'EN_PREPARACION' && (
                                <button 
                                    onClick={() => changeStatus(order.id, 'LISTO')}
                                    disabled={loading}
                                    style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    ✅ Marcar como LISTO
                                </button>
                            )}

                            {order.status === 'LISTO' && (
                                <span style={{ color: '#2e7d32', fontWeight: 'bold', padding: '8px', background: '#e8f5e9', borderRadius: '4px' }}>
                                    🔔 Notificación enviada. Esperando retiro...
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