import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import Button from '../components/common/Button';

const StudentMenuPage = () => {
    const { productService, userService } = useAuth(); 
    const { addToCart } = useCart(); // Hook del carrito
    
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

    if (loading) return <div>Cargando menú...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Menú del Día</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {products.map(product => {
                    const risks = checkAllergyRisk(product);
                    const hasRisk = risks && risks.length > 0;

                    return (
                        <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '10px', position: 'relative' }}>
                            {hasRisk && (
                                <div style={{ background: '#ffeb3b', padding: '5px', fontSize: '0.8em', textAlign: 'center' }}>
                                     Contiene alérgenos
                                </div>
                            )}
                            <h3>{product.nombre}</h3>
                            <p>${product.precio}</p>
                            <Button onClick={() => handlePreAdd(product)}>
                                {hasRisk ? 'Ver Opciones' : 'Agregar'}
                            </Button>
                        </div>
                    );
                })}
            </div>
            {conflictProduct && (
                <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center' }}>
                    <div style={{ background:'white', padding:'30px', borderRadius:'10px', maxWidth:'400px' }}>
                        <h2 style={{ color: '#d32f2f' }}> ¡Alerta de Alergia!</h2>
                        <p>El plato <strong>{conflictProduct.nombre}</strong> contiene:</p>
                        <ul>
                            {conflictIngredient.map(i => <li key={i.id}><strong>{i.nombre}</strong></li>)}
                        </ul>
                        <p>¿Deseas pedirlo <strong>SIN</strong> estos ingredientes?</p>
                        
                        <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
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