import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const AllergiesManager = () => {
    const { userService } = useAuth();
    
    const [myAllergies, setMyAllergies] = useState([]); // Mis alergias registradas
    const [allIngredients, setAllIngredients] = useState([]); // Catálogo completo para el select
    const [loading, setLoading] = useState(true);
    
    // Estado del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState("");

    // Cargar datos iniciales
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ingredientsData, allergiesData] = await Promise.all([
                userService.getAllIngredients(),
                userService.getMyAllergies()
            ]);
            setAllIngredients(ingredientsData);
            setMyAllergies(allergiesData);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    // DELETE: Eliminar una alergia de mi lista
    const handleRemoveAllergy = async (ingredientId) => {
        if(!window.confirm("¿Ya no eres alérgico a este ingrediente?")) return;

        // Filtramos la lista actual quitando el ingrediente
        const newIds = myAllergies
            .filter(ing => ing.id !== ingredientId)
            .map(ing => ing.id);

        try {
            await userService.updateMyAllergies(newIds);
            // Actualizamos estado local para que se refleje instantáneamente
            setMyAllergies(prev => prev.filter(ing => ing.id !== ingredientId));
        } catch (error) {
            alert("Error al eliminar alergia");
        }
    };

    // CREATE: Agregar una nueva alergia desde el Modal
    const handleAddAllergy = async (e) => {
        e.preventDefault();
        if (!selectedIngredientToAdd) return;

        const ingredientId = parseInt(selectedIngredientToAdd);
        
        // Verificar si ya la tiene
        if (myAllergies.find(a => a.id === ingredientId)) {
            alert("Ya tienes registrada esta alergia.");
            return;
        }

        // Creamos la nueva lista de IDs
        const currentIds = myAllergies.map(a => a.id);
        const newIds = [...currentIds, ingredientId];

        try {
            await userService.updateMyAllergies(newIds);
            
            // Actualizar UI: Buscar el objeto ingrediente completo para mostrarlo
            const ingredientObj = allIngredients.find(i => i.id === ingredientId);
            setMyAllergies([...myAllergies, ingredientObj]);
            
            setIsModalOpen(false);
            setSelectedIngredientToAdd("");
        } catch (error) {
            alert("Error al agregar alergia");
        }
    };

    if (loading) return <div style={{padding:'20px'}}>Cargando gestor de alergias...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Mis Alergias y Restricciones</h1>
                <Button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#d32f2f' }}>
                    + Agregar Alergia
                </Button>
            </div>

            <p style={{ color: '#666' }}>
                Gestiona aquí los ingredientes que no puedes consumir. El sistema bloqueará compras peligrosas.
            </p>

            {myAllergies.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
                    No tienes alergias registradas. ¡Qué suerte!
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
                    {myAllergies.map(ing => (
                        <div key={ing.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '15px', 
                            border: '1px solid #ffcdd2', 
                            background: '#ffebee', 
                            borderRadius: '8px',
                            color: '#b71c1c'
                        }}>
                            <span style={{ fontWeight: 'bold' }}>⚠️ {ing.nombre}</span>
                            <button 
                                onClick={() => handleRemoveAllergy(ing.id)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
                                title="Eliminar alergia"
                            >
                                -
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                        <h3>Registrar Nueva Alergia</h3>
                        <form onSubmit={handleAddAllergy}>
                            <label style={{ display: 'block', marginBottom: '10px' }}>Selecciona el ingrediente:</label>
                            <select 
                                value={selectedIngredientToAdd} 
                                onChange={(e) => setSelectedIngredientToAdd(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
                                required
                            >
                                <option value="">-- Buscar ingrediente --</option>
                                {allIngredients.map(ing => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.nombre}
                                    </option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: '#999' }}>
                                    Cancelar
                                </Button>
                                <Button type="submit" style={{ backgroundColor: '#d32f2f' }}>
                                    Guardar Alergia
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AllergiesManager;