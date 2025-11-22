const IngredientModel = require('../models/IngredientModel');

class SequelizeIngredientRepository {
    
    /**
      Busca un ingrediente por nombre o lo crea si no existe.
      Retorna la instancia del modelo Ingredient.
     */
    async findOrCreate(nombre) {
        // Normalizamos el nombre para evitar duplicados como "Mani" y "mani "
        const normalizedName = nombre.trim().toLowerCase();
        
        const [ingredient, created] = await IngredientModel.findOrCreate({
            where: { nombre: normalizedName },
            defaults: { nombre: normalizedName }
        });
        
        return ingredient;
    }
}

module.exports = SequelizeIngredientRepository;