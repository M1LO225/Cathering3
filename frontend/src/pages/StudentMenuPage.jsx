// frontend/src/pages/StudentMenuPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const StudentMenuPage = () => {
    const { productService, user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                // El backend ya filtra por el colegio del usuario
                const menu = await productService.getMenu();
                setProducts(menu);
            } catch (error) {
                console.error("Error cargando menú:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [productService]);

    const addToCart = (product) => {
        // Aquí iría la lógica de validación de alérgenos (Próximo paso del Core)
        setCart([...cart, product]);
        alert(`Agregaste ${product.nombre} al carrito`);
    };

    if (loading) return <div style={{ padding: '20px' }}>Cargando menú delicioso...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Menú del Día</h1>
                <div style={{ background: '#eee', padding: '10px', borderRadius: '8px' }}>
                    🛒 Carrito: <strong>{cart.length}</strong> ítems
                </div>
            </header>

            {products.length === 0 ? (
                <p>No hay productos disponibles por el momento.</p>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                    gap: '20px' 
                }}>
                    {products.map(product => (
                        <div key={product.id} style={{ 
                            border: '1px solid #ddd', 
                            borderRadius: '12px', 
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            background: 'white'
                        }}>
                            {/* Imagen del Producto */}
                            <div style={{ height: '180px', overflow: 'hidden' }}>
                                <img 
                                    src={`http://localhost:3000${product.imagen_url}`} 
                                    alt={product.nombre}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {e.target.src = 'https://via.placeholder.com/300?text=Sin+Imagen'}} // Fallback simple
                                />
                            </div>

                            {/* Info del Producto */}
                            <div style={{ padding: '15px' }}>
                                <h3 style={{ margin: '0 0 10px 0' }}>{product.nombre}</h3>
                                <p style={{ color: '#666', fontSize: '0.9rem', height: '40px', overflow: 'hidden' }}>
                                    {product.descripcion}
                                </p>
                                
                                {/* Ingredientes (Tags) */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '10px 0' }}>
                                    {product.ingredientes?.map(ing => (
                                        <span key={ing.id} style={{ 
                                            background: '#f0f0f0', 
                                            fontSize: '0.75rem', 
                                            padding: '2px 8px', 
                                            borderRadius: '10px',
                                            color: '#555'
                                        }}>
                                            {ing.nombre}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2e7d32' }}>
                                        ${product.precio}
                                    </span>
                                    <Button 
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock <= 0}
                                        style={{ padding: '8px 15px', fontSize: '0.9rem' }}
                                    >
                                        {product.stock > 0 ? 'Agregar' : 'Agotado'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentMenuPage;