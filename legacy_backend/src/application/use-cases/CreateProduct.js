class CreateProduct {
    constructor(productRepository, ingredientRepository) {
        this.productRepository = productRepository;
        this.ingredientRepository = ingredientRepository;
    }

    async execute(data, ingredientNames) {
        // data incluye: nombre, descripcion, precio, stock, tiempo_prep, imagen_url, colegio_id
        
        let ingredientInstances = [];
        
        // En lugar de usar Promise.all (paralelo), usamos un bucle for...of (secuencial).
        // Esto evita que intentemos escribir 5 ingredientes a la vez y bloqueemos la base de datos.
        if (ingredientNames && ingredientNames.length > 0) {
            for (const name of ingredientNames) {
                // Esperamos a que se cree/encuentre uno antes de pasar al siguiente
                const ingredient = await this.ingredientRepository.findOrCreate(name);
                ingredientInstances.push(ingredient);
            }
        }

        // Obtenemos solo los IDs
        const ingredientIds = ingredientInstances.map(ing => ing.id);

        // Crear Producto con sus relaciones
        const newProduct = await this.productRepository.create(data, ingredientIds);
        
        return newProduct;
    }
}

module.exports = CreateProduct;