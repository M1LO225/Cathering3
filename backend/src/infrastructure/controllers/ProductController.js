const { parse } = require("dotenv");

class ProductController {
    constructor(createProduct, getMenu, deleteProduct) {
        this.createProduct = createProduct;
        this.getMenu = getMenu;
        this.deleteProduct = deleteProduct;
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
                    parsedIngredients = JSON.parse(ingredientes);
                } catch (e) {
                    if (typeof ingredientes === 'string') {
                        parsedIngredients = ingredientes.split(',').map(id => id.trim());
                } else {
                    parsedIngredients = [ingredientes];
            }
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

    async listIngredients(req, res) {
        try {
            const ingredients = await this.ingredientRepository.findAll();
            res.status(200).json(ingredients);
        }catch (error) {
            console.error('Error obteniendo ingredientes:', error);
            res.status(500).json({ error: 'Error interno al obtener los ingredientes.' });
        }
    }

    async delete(req, res) {
        try {
            const productId = req.params.id;
            const colegioId = req.user.colegio_id; // Obtenido del token seguro

            await this.deleteProduct.execute(productId, colegioId);

            res.status(200).json({ message: "Producto eliminado correctamente." });
        } catch (error) {
            console.error('Error eliminando producto:', error);
            // Si es error de "no encontrado", devolvemos 404, si no 500
            const status = error.message.includes("no encontrado") ? 404 : 500;
            res.status(status).json({ error: error.message });
        }
    }
}

module.exports = ProductController;