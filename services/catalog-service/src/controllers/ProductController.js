const { Op } = require('sequelize');
class ProductController {
    constructor(ProductModel, ColegioModel) {
        this.ProductModel = ProductModel;
        this.ColegioModel = ColegioModel;
    }

    async getAll(req, res) {
        try {
            const user = req.user;
            // Filtro básico por colegio
            let whereClause = {};

            if (user && user.colegio_id) {
                whereClause.colegioId = user.colegio_id;
            } else if (req.query.colegioId) {
                whereClause.colegioId = req.query.colegioId;
            } else {
                return res.status(400).json({ error: "School ID required." });
            }

            if (user && user.role === 'estudiante') {
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
                
                whereClause[Op.and] = [
                    { 
                        [Op.or]: [
                            { availableFrom: null }, // Siempre disponible
                            { availableFrom: { [Op.lte]: todayStr } } // O disponible desde hoy/antes
                        ]
                    }
                ];
            }

            const products = await this.ProductModel.findAll({ where: whereClause });
            
            // Mapeo de imagen
            const productsWithImages = products.map(p => {
                const json = p.toJSON();
                if (json.image) json.imageUrl = `http://localhost:3000/uploads/${json.image}`;
                return json;
            });

            res.json(productsWithImages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching products' });
        }
    }

    async create(req, res) {
        try {
            const { 
                name, description, price, stock, 
                preparationTime, category, ingredients, availableFrom 
            } = req.body;
            
            const file = req.file; 
            const user = req.user;

            if (!user || !user.colegio_id) {
                return res.status(403).json({ error: 'User has no school assigned.' });
            }

            let colegio = await this.ColegioModel.findByPk(user.colegio_id);
            
            if (!colegio) {
                console.log(`Colegio ID ${user.colegio_id} no existe en Catalog DB. Sincronizando...`);
                // Creamos el registro del colegio para que la Foreign Key no falle
                // Usamos el ID exacto que viene del Auth Service
                colegio = await this.ColegioModel.create({
                    id: user.colegio_id,
                    name: 'Colegio Sincronizado', // Nombre placeholder o genérico
                    address: 'Dirección pendiente',
                    phone: '0000000000'
                });
            }

            // Ahora sí, creamos el producto con seguridad
            const newProduct = await this.ProductModel.create({
                name,
                description,
                price,
                stock,
                preparationTime,
                category,
                availableFrom,
                image: file ? file.filename : null, 
                ingredients: ingredients || '',
                colegioId: user.colegio_id 
            });

            res.status(201).json(newProduct);
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ error: error.message || 'Error creating product' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const deleted = await this.ProductModel.destroy({
                where: { 
                    id: id,
                    colegioId: user.colegio_id 
                }
            });

            if (!deleted) {
                return res.status(404).json({ error: 'Product not found.' });
            }

            res.json({ message: 'Product deleted.' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting product.' });
        }
    }
    async getIngredients(req, res) {
        try {
            // Buscamos productos del colegio (opcional) o todos los ingredientes globales
            // Para simplificar, devolveremos una lista extraída de los productos
            const products = await this.ProductModel.findAll({
                attributes: ['ingredients']
            });

            // Lógica para extraer ingredientes únicos de la cadena de texto "Tomate, Queso"
            const allIngredients = new Set();
            products.forEach(p => {
                if (p.ingredients) {
                    p.ingredients.split(',').forEach(i => allIngredients.add(i.trim()));
                }
            });

            // Formato que espera el frontend: [{ id: 'Tomate', name: 'Tomate' }]
            const list = Array.from(allIngredients).map((ing, index) => ({
                id: index + 1,
                name: ing
            }));

            res.json(list);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
            res.status(500).json({ error: "Error obteniendo ingredientes" });
        }
    }
}

module.exports = ProductController;