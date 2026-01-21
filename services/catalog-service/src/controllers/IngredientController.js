// services/catalog-service/src/controllers/IngredientController.js
class IngredientController {
    constructor(IngredientModel) {
        this.Ingredient = IngredientModel;
    }

    // Obtener todos
    async getAll(req, res) {
        try {
            const ingredients = await this.Ingredient.findAll();
            res.json(ingredients); // Devuelve objetos con { id, name, isCommon }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener ingredientes' });
        }
    }

    // Crear un nuevo ingrediente (CORREGIDO)
    async create(req, res) {
        try {
            // Aceptamos 'nombre' (del frontend) o 'name' (estándar)
            const { nombre, name, is_common, isCommon } = req.body;

            // Mapeo fuerte al Inglés para la BD
            const nameToSave = name || nombre;
            const isCommonToSave = isCommon !== undefined ? isCommon : (is_common || false);

            if (!nameToSave) {
                return res.status(400).json({ error: 'El nombre (name) es obligatorio' });
            }

            const newIngredient = await this.Ingredient.create({
                name: nameToSave,        // Ahora coincide con IngredientModel
                isCommon: isCommonToSave // Ahora coincide con IngredientModel
            });

            res.status(201).json(newIngredient);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'El ingrediente ya existe' });
            }
            console.error("Error creating ingredient:", error);
            res.status(500).json({ error: 'Error al crear ingrediente' });
        }
    }
    
    // ... delete method igual ...
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.Ingredient.destroy({ where: { id } });
            if (deleted) res.json({ message: 'Ingrediente eliminado' });
            else res.status(404).json({ error: 'Ingrediente no encontrado' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar ingrediente' });
        }
    }
}

module.exports = IngredientController;