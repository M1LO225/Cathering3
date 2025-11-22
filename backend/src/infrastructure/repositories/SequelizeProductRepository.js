const ProductModel = require('../models/ProductModel');
const IngredientModel = require('../models/IngredientModel');

class SequelizeProductRepository {

    async create(productData, ingredientIds) {
        // 1. Crear el producto base
        const newProduct = await ProductModel.create(productData);

        // 2. Asociar ingredientes (Magia de Sequelize: setIngredientes)
        if (ingredientIds && ingredientIds.length > 0) {
            await newProduct.setIngredientes(ingredientIds);
        }

        return newProduct;
    }

    async findAllByColegio(colegioId) {
        return await ProductModel.findAll({
            where: { colegio_id: colegioId },
            include: [
                {
                    model: IngredientModel,
                    as: 'ingredientes', // Debe coincidir con el alias en associations.js
                    through: { attributes: [] } // No traer datos de la tabla pivote
                }
            ]
        });
    }
    
}

module.exports = SequelizeProductRepository;