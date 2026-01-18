// services/catalog-service/src/controllers/ProductController.js

class ProductController {
    constructor(ProductModel) {
        this.Product = ProductModel;
    }

    // --- MÉTODOS ESTÁNDAR ---

    // Crear producto
    async create(req, res) {
        try {
            // Nota: req.file viene de Multer (si subiste imagen)
            const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
            
            const { nombre, descripcion, precio, tiempo_prep, stock, colegioId } = req.body;

            const newProduct = await this.Product.create({
                nombre,
                descripcion,
                precio,
                tiempo_prep,
                stock,
                imagen_url: imagePath,
                colegioId: colegioId || null, // Opcional según tu modelo
                // userId: req.user.id // Si guardaras quién lo creó
            });

            res.status(201).json(newProduct);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear producto' });
        }
    }

    // Borrar producto
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.Product.destroy({ where: { id } });
            
            if (deleted) {
                res.json({ message: 'Producto eliminado' });
            } else {
                res.status(404).json({ error: 'Producto no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar producto' });
        }
    }

    // Obtener todos (Método base)
    async getAll(req, res) {
        try {
            const products = await this.Product.findAll();
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener productos' });
        }
    }

    // --- ALIAS PARA COMPATIBILIDAD CON TUS RUTAS ---
    
    // Tu ruta llama a .list(), así que redirigimos a .getAll()
    async list(req, res) {
        return this.getAll(req, res);
    }

    async listForStudent(req, res) {
        return this.getAll(req, res);
    }

    async listIngredients(req, res) {
        res.json({ message: "Usa el endpoint /api/ingredients para ver ingredientes" });
    }
}

module.exports = ProductController;