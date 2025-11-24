import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const StudentAllergiesPage = () => {
    const { userService } = useAuth();
    const [allIngredients, setAllIngredients] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {               
                const ingredients = await userService.getAllIngredients();
                setAllIngredients(ingredients);

                const myAllergies = await userService.getMyAllergies();
                setSelectedIds(myAllergies.map(ing => ing.id));
            } catch (error) {
                console.error("Error cargando alergias:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userService]);

    const toggleAllergy = (id) => {
        if (selectedIds.includes(id)) {
            // Si ya existe, lo sacamos (No soy alérgico)
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            // Si no existe, lo agregamos (Soy alérgico)
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSave = async () => {
        try {
            await userService.updateMyAllergies(selectedIds);
            alert("¡Alergias actualizadas correctamente!");
        } catch (error) {
            alert("Error al guardar alergias.");
        }
    };

    if (loading) return <div style={{padding:'20px'}}>Cargando ingredientes...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Mis Alergias</h1>
            <p>Por favor, marca los ingredientes a los que eres alérgico. El sistema te avisará si intentas comprar un producto peligroso.</p>

            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px', 
                margin: '30px 0',
                padding: '20px',
                border: '1px solid #eee',
                borderRadius: '8px'
            }}>
                {allIngredients.length === 0 && <p>No hay ingredientes registrados en el sistema aún.</p>}
                
                {allIngredients.map(ing => {
                    const isSelected = selectedIds.includes(ing.id);
                    return (
                        <button
                            key={ing.id}
                            onClick={() => toggleAllergy(ing.id)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '20px',
                                border: isSelected ? '2px solid #d32f2f' : '1px solid #ccc',
                                backgroundColor: isSelected ? '#ffebee' : 'white',
                                color: isSelected ? '#d32f2f' : '#333',
                                cursor: 'pointer',
                                fontWeight: isSelected ? 'bold' : 'normal',
                                transition: 'all 0.2s'
                            }}
                        >
                            {ing.nombre} {isSelected && '⚠️'}
                        </button>
                    );
                })}
            </div>

            <Button onClick={handleSave} style={{ width: '100%', backgroundColor: '#d32f2f' }}>
                Guardar Mis Alergias
            </Button>
        </div>
    );
};

export default StudentAllergiesPage;