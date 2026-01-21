const { Op } = require('sequelize');

class ProductController {
    constructor(ProductModel, ColegioModel, IngredientModel) {
        this.ProductModel = ProductModel;
        this.ColegioModel = ColegioModel;
        this.IngredientModel = IngredientModel;
    }

    // 1. Obtener Menú
    async getAll(req, res) {
        try {
            const user = req.user;
            let whereClause = {};

            if (user && user.colegio_id) {
                whereClause.colegioId = user.colegio_id;
            }

            // Filtro para Estudiantes Y Personal
            if (user && (user.role === 'estudiante' || user.role === 'personal_academico')) {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                
                whereClause[Op.and] = [
                    { 
                        [Op.or]: [
                            { availableFrom: null },
                            { availableFrom: { [Op.eq]: null } },
                            { availableFrom: { [Op.lte]: today } }
                        ]
                    }
                ];
            }

            const products = await this.ProductModel.findAll({ where: whereClause });
            
            // Corrección de rutas de imágenes
            const updatedProducts = products.map(p => {
                const productData = p.toJSON();
                if (productData.image) {
                    let cleanImage = productData.image.replace('http://localhost:3000', '');
                    if (!cleanImage.startsWith('http') && !cleanImage.startsWith('/uploads')) {
                        productData.image = `/uploads/${cleanImage}`;
                    } else if (cleanImage.startsWith('/uploads')) {
                        productData.image = cleanImage;
                    }
                }
                return productData;
            });

            res.json(updatedProducts);
        } catch (error) {
            console.error("Error obteniendo productos:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // 2. Crear Producto (+ AUTO-GENERACIÓN DE INGREDIENTES)
    async create(req, res) {
        try {
            const { name, description, price, stock, preparationTime, category, ingredients, availableFrom } = req.body;
            const user = req.user; 
            
            if (!user || !user.colegio_id) {
                return res.status(403).json({ error: 'Usuario no autorizado o sin colegio asignado.' });
            }

            let imageUrl = null;
            if (req.file) {
                imageUrl = `/uploads/${req.file.filename}`; 
            }

            let validDate = null;
            if (availableFrom && typeof availableFrom === 'string' && availableFrom.length >= 10) {
                 const parsedDate = Date.parse(availableFrom);
                 if (!isNaN(parsedDate)) {
                     validDate = availableFrom;
                 }
            }

            // A. Creamos el producto
            const newProduct = await this.ProductModel.create({
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                preparationTime: parseInt(preparationTime),
                category,
                image: imageUrl,
                ingredients, 
                availableFrom: validDate,
                colegioId: user.colegio_id
            });

            // --- B. MAGIA: AUTO-POBLAR TABLA DE INGREDIENTES ---
            if (ingredients && typeof ingredients === 'string') {
                // 1. Separar por comas (ej: "Tomate, Queso, Pan") -> ["Tomate", "Queso", "Pan"]
                // 2. Limpiar espacios (trim) y filtrar vacíos
                const list = ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
                
                console.log(`🥗 Procesando ingredientes para catálogo: ${list.join(', ')}`);

                // 3. Guardar uno por uno (Si no existe, lo crea. Si existe, no hace nada)
                for (const ingredientName of list) {
                    try {
                        await this.IngredientModel.findOrCreate({
                            where: { name: ingredientName },
                            defaults: { isCommon: true } // Asumimos que son comunes si están en el menú
                        });
                    } catch (err) {
                        // Ignoramos errores de duplicados por si acaso, para no frenar la creación del producto
                        console.warn(`⚠️ Ingrediente '${ingredientName}' ya existía o error menor.`);
                    }
                }
            }
            // ---------------------------------------------------

            res.status(201).json(newProduct);
        } catch (error) {
            console.error("Error creando producto:", error);
            res.status(500).json({ error: 'Error al crear el producto: ' + error.message });
        }
    }

    // 3. Eliminar Producto
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.ProductModel.destroy({
                where: { id }
            });

            if (deleted) {
                res.status(200).json({ message: 'Producto eliminado.' });
            } else {
                res.status(404).json({ error: 'Producto no encontrado.' });
            }
        } catch (error) {
            console.error("Error eliminando producto:", error);
            res.status(500).json({ error: 'Error al eliminar el producto.' });
        }
    }

    // 4. Obtener Ingredientes (Para el selector de Alergias)
    async getIngredients(req, res) {
        try {
            // Esto estaba devolviendo [] porque la tabla estaba vacía
            const ingredients = await this.IngredientModel.findAll();
            res.json(ingredients);
        } catch (error) {
            console.error("Error obteniendo ingredientes:", error);
            res.status(500).json({ error: 'Error al obtener ingredientes' });
        }
    }

    // 5. Menú Seguro
    async getSafeMenu(req, res) {
        try {
            const user = req.user; 
            const userAllergies = user.allergies || []; 
            const allergyNames = userAllergies.map(a => a.toLowerCase());

            const products = await this.ProductModel.findAll({
                where: { colegioId: user.colegio_id }
            });

            const safeMenu = products.map(product => {
                const productData = product.toJSON();
                let conflict = null;

                if (productData.image) {
                     let cleanImage = productData.image.replace('http://localhost:3000', '');
                     if (!cleanImage.startsWith('http') && !cleanImage.startsWith('/uploads')) {
                        productData.image = `/uploads/${cleanImage}`;
                     } else {
                        productData.image = cleanImage;
                     }
                }

                if (productData.ingredients && typeof productData.ingredients === 'string') {
                    const names = productData.ingredients.split(',');
                    for (const rawName of names) {
                        if (allergyNames.includes(rawName.trim().toLowerCase())) {
                            conflict = rawName.trim();
                            break;
                        }
                    }
                } 
                
                productData.has_risk = !!conflict;
                productData.risk_ingredient = conflict;

                return productData;
            });

            res.json(safeMenu);

        } catch (error) {
            console.error("Error en SafeMenu:", error);
            res.status(500).json({ error: 'Error calculando menú seguro' });
        }
    }
}

module.exports = ProductController;