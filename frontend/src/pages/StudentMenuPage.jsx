import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext'; 
import Button from '../components/common/Button';

const StudentMenuPage = () => {
    const { productService, user } = useAuth();
    const { addToCart } = useCart();
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (productService) {
            fetchMenu();
        }
    }, [productService]);

    const fetchMenu = async () => {
        try {
            const data = await productService.getMenu();
            
            if (Array.isArray(data)) {
                setMenu(data);
            } else {
                setMenu([]);
            }
        } catch (error) {
            console.error("Error loading menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        alert(`${product.name} added to cart!`);
    };

    const filteredMenu = menu.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{padding: '20px'}}>Loading menu...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>School Menu</h1>
                <input 
                    type="text" 
                    placeholder="Search food..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </header>

            {filteredMenu.length === 0 ? (
                <p>No products available at this time.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
                    {filteredMenu.map(product => (
                        <div key={product.id} style={{ 
                            border: '1px solid #e0e0e0', 
                            borderRadius: '10px', 
                            overflow: 'hidden', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    // Esta cadena larga es una imagen gris generada por código. No necesita internet.
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23cccccc' width='300' height='200'/%3E%3Ctext fill='%23969696' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }}
                            />

                            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{product.name}</h3>
                                    <span style={{ 
                                        backgroundColor: '#e3f2fd', 
                                        color: '#1565c0', 
                                        padding: '4px 8px', 
                                        borderRadius: '15px', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold' 
                                    }}>
                                        ${product.price}
                                    </span>
                                </div>
                                
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px', flex: 1 }}>
                                    {product.description}
                                </p>

                                {product.ingredients && (
                                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '15px' }}>
                                        <em>Ingredients: {product.ingredients}</em>
                                    </p>
                                )}

                                <Button 
                                    onClick={() => handleAddToCart(product)}
                                    style={{ width: '100%' }}
                                    disabled={product.stock <= 0}
                                >
                                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentMenuPage;