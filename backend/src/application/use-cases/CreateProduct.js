class CreateProduct {
    constructor(productRepository, ingredientRepository) {
        this.productRepository = productRepository;
        this.ingredientRepository = ingredientRepository;
    }

    async execute(data, ingredientNames) {
        // data incluye: nombre, descripcion, precio, stock, tiempo_prep, imagen_url, colegio_id
        
        // 1. Procesar Ingredientes: Convertir lista de nombres ["Maní", "Leche"] a IDs de base de datos
        let ingredientInstances = [];
        if (ingredientNames && ingredientNames.length > 0) {
            // Promesa paralela para buscar/crear todos los ingredientes
            ingredientInstances = await Promise.all(
                ingredientNames.map(name => this.ingredientRepository.findOrCreate(name))
            );
        }

        // Obtenemos solo los IDs
        const ingredientIds = ingredientInstances.map(ing => ing.id);

        // 2. Crear Producto con sus relaciones
        const newProduct = await this.productRepository.create(data, ingredientIds);
        
        return newProduct;
    }
}

module.exports = CreateProduct;