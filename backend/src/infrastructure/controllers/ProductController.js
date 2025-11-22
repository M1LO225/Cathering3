class ProductController {
    constructor(createProduct, getMenu) {
        this.createProduct = createProduct;
        this.getMenu = getMenu;
    }

    async create(req, res) {
        try {
            // req.file contiene la info de la imagen subida por Multer
            // req.body contiene los campos de texto
            
            const { nombre, descripcion, precio, stock, tiempo_prep, ingredientes } = req.body;
            const colegioId = req.user.colegio_id; // Del token del usuario cafeteria

            if (!req.file) {
                return res.status(400).json({ error: 'La imagen del producto es obligatoria.' });
            }

            // Procesar ingredientes (vienen como string JSON "[...]" o string separado por comas)
            let parsedIngredients = [];
            if (ingredientes) {
                try {
                    // Intentamos parsear si viene como JSON array string
                    parsedIngredients = JSON.parse(ingredientes);
                } catch (e) {
                    // Si falla, asumimos que es un solo ingrediente o texto plano, lo convertimos en array
                    parsedIngredients = [ingredientes];
                }
                
                // Asegurarnos de que sea un array de strings
                if (!Array.isArray(parsedIngredients)) {
                     parsedIngredients = [parsedIngredients.toString()];
                }
            }

            const productData = {
                nombre,
                descripcion,
                precio: parseFloat(precio),
                stock: parseInt(stock),
                tiempo_prep: parseInt(tiempo_prep),
                imagen_url: `/uploads/${req.file.filename}`, // Ruta relativa para servir
                colegio_id: colegioId
            };

            const newProduct = await this.createProduct.execute(productData, parsedIngredients);

            res.status(201).json({
                message: 'Producto creado exitosamente',
                product: newProduct
            });

        } catch (error) {
            console.error('Error creando producto:', error);
            res.status(500).json({ error: 'Error interno al crear el producto.' });
        }
    }

    async list(req, res) {
        try {
            const colegioId = req.user.colegio_id; // Funciona para CAFETERIA y ESTUDIANTE (ambos tienen colegio_id en token)
            const menu = await this.getMenu.execute(colegioId);
            res.status(200).json(menu);
        } catch (error) {
            console.error('Error obteniendo menú:', error);
            res.status(500).json({ error: 'Error interno al obtener el menú.' });
        }
    }
}

module.exports = ProductController;