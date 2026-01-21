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
                // Generamos la fecha de hoy asegurando formato YYYY-MM-DD
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                
                // LÓGICA BLINDADA: Solo permitimos NULL o fechas menores/iguales a hoy
                whereClause[Op.and] = [
                    { 
                        [Op.or]: [
                            { availableFrom: null },           // Caso 1: Nunca se definió fecha (siempre visible)
                            { availableFrom: { [Op.eq]: null } }, // Caso 1b: Refuerzo para nulos
                            { availableFrom: { [Op.lte]: today } } // Caso 2: Fecha válida menor o igual a hoy
                        ]
                    }
                ];
            }

            const products = await this.ProductModel.findAll({ where: whereClause });
            
            // Corrección de rutas de imágenes
            const updatedProducts = products.map(p => {
                const productData = p.toJSON();
                
                if (productData.image) {
                    // Limpieza de localhost por si quedó basura antigua en la DB
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
    // 2. Crear Producto
    async create(req, res) {
        try {
            // Extraemos los datos del formulario
            const { name, description, price, stock, preparationTime, category, ingredients, availableFrom } = req.body;
            
            // CORRECCIÓN: Obtenemos el colegioId desde el usuario autenticado (Token)
            // Ya no lo esperamos del req.body.
            const user = req.user; 
            
            // Validación de seguridad extra
            if (!user || !user.colegio_id) {
                return res.status(403).json({ error: 'Usuario no autorizado o sin colegio asignado.' });
            }

            let imageUrl = null;
            if (req.file) {
                imageUrl = `/uploads/${req.file.filename}`; 
            }

            // Lógica de fecha (se mantiene igual)
            let validDate = null;
            if (availableFrom && typeof availableFrom === 'string' && availableFrom.length >= 10) {
                 const parsedDate = Date.parse(availableFrom);
                 if (!isNaN(parsedDate)) {
                     validDate = availableFrom;
                 }
            }

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
                colegioId: user.colegio_id // <--- USAMOS EL ID DEL TOKEN
            });

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

    // 4. Obtener Ingredientes
    async getIngredients(req, res) {
        try {
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