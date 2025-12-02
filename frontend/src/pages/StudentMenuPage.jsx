import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const StudentMenuPage = () => {
    const { productService, userService } = useAuth(); 
    const { addToCart, cart } = useCart(); // Hook del carrito (agregamos 'cart' para el contador)
    
    const [products, setProducts] = useState([]);
    const [myAllergies, setMyAllergies] = useState([]); 
    const [loading, setLoading] = useState(true);

    // Estado para el Modal de Conflicto
    const [conflictProduct, setConflictProduct] = useState(null);
    const [conflictIngredient, setConflictIngredient] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [menuData, allergiesData] = await Promise.all([
                    productService.getMenu(),
                    userService.getMyAllergies()
                ]);
                setProducts(menuData);
                setMyAllergies(allergiesData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [productService, userService]);

    const checkAllergyRisk = (product) => {
        if (!product.ingredientes || !myAllergies.length) return null;
        const myAllergyIds = myAllergies.map(a => a.id);
        // Retorna TODOS los ingredientes conflictivos
        return product.ingredientes.filter(ing => myAllergyIds.includes(ing.id));
    };

    const handlePreAdd = (product) => {
        const risks = checkAllergyRisk(product);

        if (risks && risks.length > 0) {
            // Si hay riesgo, abrimos el modal para decidir
            setConflictIngredient(risks);
            setConflictProduct(product);
        } else {
            // Si no hay riesgo, agregamos directo
            addToCart(product, []);
            alert("Producto agregado.");
        }
    };

    const handleCustomizeAdd = () => {
        // El usuario decidió quitar los ingredientes malos
        const ingredientsToRemove = conflictIngredient.map(i => i.nombre);
        addToCart(conflictProduct, ingredientsToRemove);
        
        setConflictProduct(null);
        setConflictIngredient(null);
        alert("Producto agregado SIN los ingredientes alérgicos.");
    };

    if (loading) return <div style={{padding: 20}}>Cargando menú...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Menú del Día</h1>
                {/* BOTÓN DE CARRITO */}
                <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ 
                        background: '#ff9800', 
                        color: 'white',
                        padding: '10px 20px', 
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        🛒 Ir a Pagar: <strong>{cart.length}</strong> ítems
                    </div>
                </Link>
            </header>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {products.map(product => {
                    const risks = checkAllergyRisk(product);
                    const hasRisk = risks && risks.length > 0;

                    return (
                        <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '0', overflow: 'hidden', position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            
                            {/* 1. ALERTA DE ALÉRGENOS */}
                            {hasRisk && (
                                <div style={{ background: '#ffeb3b', padding: '5px', fontSize: '0.8em', textAlign: 'center', fontWeight: 'bold' }}>
                                    Contiene alérgenos
                                </div>
                            )}

                            {/* 2. IMAGEN DEL PRODUCTO (Aquí estaba el error antes) */}
                            <div style={{ height: '150px', overflow: 'hidden', background: '#f9f9f9' }}>
                                <img 
                                    src={`http://localhost:3000${product.imagen_url}`} 
                                    alt={product.nombre} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {e.target.src = 'https://via.placeholder.com/300?text=Sin+Imagen'}}
                                />
                            </div>

                            {/* 3. DETALLES */}
                            <div style={{ padding: '15px' }}>
                                <h3 style={{ margin: '0 0 5px 0' }}>{product.nombre}</h3>
                                <p style={{ color: '#666', fontSize: '0.9em', margin: '0 0 10px 0' }}>{product.descripcion}</p>
                                
                                {/* Ingredientes (Tags) */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
                                    {product.ingredientes?.map(ing => (
                                        <span key={ing.id} style={{ background: '#eee', fontSize: '0.7em', padding: '2px 6px', borderRadius: '4px' }}>
                                            {ing.nombre}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#2e7d32' }}>${product.precio}</span>
                                    <Button onClick={() => handlePreAdd(product)}>
                                        {hasRisk ? 'Ver Opciones' : 'Agregar'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL DE PERSONALIZACIÓN */}
            {conflictProduct && (
                <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex: 100 }}>
                    <div style={{ background:'white', padding:'30px', borderRadius:'10px', maxWidth:'400px' }}>
                        <h2 style={{ color: '#d32f2f', marginTop: 0 }}>⚠️ ¡Alerta de Alergia!</h2>
                        <p>El plato <strong>{conflictProduct.nombre}</strong> contiene:</p>
                        <ul>
                            {conflictIngredient.map(i => <li key={i.id}><strong>{i.nombre}</strong></li>)}
                        </ul>
                        <p>¿Deseas pedirlo <strong>SIN</strong> estos ingredientes?</p>
                        
                        <div style={{ display:'flex', gap:'10px', marginTop:'20px', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setConflictProduct(null)} style={{ background:'#999' }}>Cancelar</Button>
                            <Button onClick={handleCustomizeAdd}>Sí, quitar ingredientes</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentMenuPage;