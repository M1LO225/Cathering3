// frontend/src/pages/CafeteriaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const CafeteriaDashboard = () => {
    const { productService, user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estado del formulario
    const [newProduct, setNewProduct] = useState({
        nombre: '', descripcion: '', precio: '', stock: '', tiempo_prep: '', ingredientes: ''
    });
    const [imageFile, setImageFile] = useState(null);

    // Cargar menú al iniciar
    useEffect(() => {
        fetchMenu();
    }, [productService]);

    const fetchMenu = async () => {
        try {
            const menu = await productService.getMenu();
            setProducts(menu);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return alert("Debes subir una imagen");

        const formData = new FormData();
        formData.append('nombre', newProduct.nombre);
        formData.append('descripcion', newProduct.descripcion);
        formData.append('precio', newProduct.precio);
        formData.append('stock', newProduct.stock);
        formData.append('tiempo_prep', newProduct.tiempo_prep);
        // Ingredientes: Enviamos texto separado por comas, el backend lo procesa
        formData.append('ingredientes', newProduct.ingredientes); 
        formData.append('image', imageFile);

        try {
            await productService.createProduct(formData);
            alert("Producto creado!");
            setNewProduct({ nombre: '', descripcion: '', precio: '', stock: '', tiempo_prep: '', ingredientes: '' });
            setImageFile(null);
            fetchMenu(); // Recargar lista
        } catch (error) {
            alert(error.message);
        }
    };

    const handleChange = (e) => {
        setNewProduct({...newProduct, [e.target.name]: e.target.value});
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Panel de Cafetería - {user?.username}</h1>
            
            {/* Formulario de Creación */}
            <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', borderRadius: '8px' }}>
                <h3>Agregar Nuevo Plato</h3>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <Input label="Nombre Plato" name="nombre" value={newProduct.nombre} onChange={handleChange} required />
                        <Input label="Precio ($)" name="precio" type="number" step="0.01" value={newProduct.precio} onChange={handleChange} required />
                        <Input label="Stock (unidades)" name="stock" type="number" value={newProduct.stock} onChange={handleChange} required />
                        <Input label="Tiempo Prep (min)" name="tiempo_prep" type="number" value={newProduct.tiempo_prep} onChange={handleChange} required />
                    </div>
                    <Input label="Descripción" name="descripcion" value={newProduct.descripcion} onChange={handleChange} />
                    <Input label="Ingredientes (separados por coma)" name="ingredientes" placeholder="Ej: Maní, Leche, Harina" value={newProduct.ingredientes} onChange={handleChange} />
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Foto del Plato</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} required />
                    </div>

                    <Button type="submit">Publicar Producto</Button>
                </form>
            </div>

            {/* Lista de Productos */}
            <h3>Mi Menú Actual</h3>
            {loading ? <p>Cargando...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {products.map(p => (
                        <div key={p.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <img 
                                src={`http://localhost:3000${p.imagen_url}`} 
                                alt={p.nombre} 
                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} 
                            />
                            <h4>{p.nombre}</h4>
                            <p style={{ color: '#888', fontSize: '0.9em' }}>{p.descripcion}</p>
                            <p><strong>${p.precio}</strong> | Stock: {p.stock}</p>
                            <div style={{ fontSize: '0.85em', color: '#555' }}>
                                <strong>Ingredientes:</strong> {p.ingredientes?.map(i => i.nombre).join(', ')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CafeteriaDashboard;