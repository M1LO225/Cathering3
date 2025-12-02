const { parse } = require("dotenv");

class ProductController {
    constructor(createProduct, getMenu, deleteProduct, getSafeMenu) {
        this.createProduct = createProduct;
        this.getMenu = getMenu;
        this.deleteProduct = deleteProduct;
        this.getSafeMenu = getSafeMenu;
    }

    async create(req, res) {
        try {
            const { nombre, descripcion, precio, stock, tiempo_prep, ingredientes } = req.body;
            const colegioId = req.user.colegio_id; 

            if (!req.file) {
                return res.status(400).json({ error: 'La imagen del producto es obligatoria.' });
            }

            let parsedIngredients = [];
            
            if (ingredientes) {
                // 1. Limpiamos el string (quitamos espacios al inicio/final)
                const rawIngredientes = ingredientes.toString().trim();

                // 2. Verificamos si intenta ser un JSON (ej: '["Pan", "Carne"]')
                if (rawIngredientes.startsWith('[')) {
                    try {
                        parsedIngredients = JSON.parse(rawIngredientes);
                    } catch (e) {
                        // Si falla el JSON, lo tratamos como texto separado por comas
                        parsedIngredients = rawIngredientes.split(',');
                    }
                } else {
                    // 3. CASO COMÚN: Texto separado por comas (ej: "Pan, Carne, Queso")
                    parsedIngredients = rawIngredientes.split(',');
                }

                // 4. Limpieza final: Recorremos el array, quitamos espacios a cada palabra y filtramos vacíos
                parsedIngredients = parsedIngredients
                    .map(i => i.trim())        // " Queso " -> "Queso"
                    .filter(i => i.length > 0); // Eliminar strings vacíos
            }

            const productData = {
                nombre,
                descripcion,
                precio: parseFloat(precio),
                stock: parseInt(stock),
                tiempo_prep: parseInt(tiempo_prep),
                imagen_url: `/uploads/${req.file.filename}`,
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
    async listForStudent(req, res) {
        try {
            const colegioId = req.user.colegio_id;
            const userId = req.user.id;

            // Usamos la lógica del forEach cruzado
            const menu = await this.getSafeMenu.execute(colegioId, userId);
            
            res.status(200).json(menu);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error analizando el menú.' });
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