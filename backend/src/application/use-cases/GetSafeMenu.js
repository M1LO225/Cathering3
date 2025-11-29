class GetSafeMenu {
    constructor(productRepository, userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    async execute(colegioId, userId) {
        // 1. Consultar Tabla A: Productos del colegio
        const products = await this.productRepository.findAllByColegio(colegioId);
        
        // 2. Consultar Tabla B: Alergias del usuario
        const userAllergies = await this.userRepository.getUserAllergies(userId);
        
        // Extraemos solo los IDs de las alergias para comparar rápido
        const allergyIds = userAllergies.map(a => a.id);

        // 3. LÓGICA DE NEGOCIO: Consulta Cruzada Manual (El Requerimiento)
        // Recorremos los productos y les inyectamos una propiedad 'risk_analysis'
        // calculada en tiempo de ejecución.
        const safeMenu = [];

        products.forEach(product => {
            // Convertimos el modelo Sequelize a objeto plano para poder agregarle propiedades
            const productData = product.toJSON ? product.toJSON() : product;
            
            let conflict = null;

            // Sub-ciclo: Verificamos ingredientes
            if (productData.ingredientes) {
                for (const ingrediente of productData.ingredientes) {
                    if (allergyIds.includes(ingrediente.id)) {
                        conflict = ingrediente.nombre;
                        break; // Encontramos riesgo, paramos de buscar en este plato
                    }
                }
            }

            // Inyectamos la info cruzada
            productData.has_risk = !!conflict; // Booleano
            productData.risk_ingredient = conflict; // Nombre del ingrediente peligroso

            safeMenu.push(productData);
        });

        return safeMenu;
    }
}

module.exports = GetSafeMenu;