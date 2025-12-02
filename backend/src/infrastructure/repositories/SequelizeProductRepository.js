const ProductModel = require('../models/ProductModel');
const IngredientModel = require('../models/IngredientModel');

class SequelizeProductRepository {

    async create(productData, ingredientIds) {
        const newProduct = await ProductModel.create(productData);
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
                    as: 'ingredientes',
                    through: { attributes: [] }
                }
            ]
        });
    }

    async findById(id) {
        return await ProductModel.findByPk(id, {
            include: [{ model: IngredientModel, as: 'ingredientes' }]
        });
    }

    async update(id, productData, ingredientIds) {
        const product = await ProductModel.findByPk(id);
        if (!product) return null;

        // Actualizar campos básicos (precio, stock, nombre, etc.)
        await product.update(productData);

        // Actualizar relaciones si se proporcionan
        if (ingredientIds) {
            await product.setIngredientes(ingredientIds);
        }

        // Devolver producto actualizado
        return this.findById(id);
    }

    /*
      Actualización rápida solo de stock (útil para ventas)
    */
    async updateStock(id, quantity, transaction = null) {
        const options = transaction ? { transaction } : {}; 
        

        const product = await ProductModel.findByPk(id, options);
        
        if (!product) return null;
        
        const newStock = product.stock + quantity;
        if (newStock < 0) throw new Error(`Stock insuficiente para ${product.nombre}`);

        await product.update({ stock: newStock }, options);
        return product;
    }

    async delete(id, colegioId) {
        const deletedCount = await ProductModel.destroy({
            where: { id, colegio_id: colegioId }
        });
        return deletedCount > 0;
    }
}

module.exports = SequelizeProductRepository;