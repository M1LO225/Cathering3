const IngredientModel = require('../models/IngredientModel');

class SequelizeIngredientRepository {
    
    async findOrCreate(nombre) {
        // Normalizamos el nombre para evitar duplicados como "Mani" y "mani "
        const normalizedName = nombre.trim().toLowerCase();
        const [ingredient, created] = await IngredientModel.findOrCreate({
            where: { nombre: normalizedName },
            defaults: { nombre: normalizedName }
        });
        
        return ingredient;
    }

    async findAll () {
        return await IngredientModel.findAll(
            {
                order: [['nombre', 'ASC']]
            }
        );
        
    }
}

module.exports = SequelizeIngredientRepository;