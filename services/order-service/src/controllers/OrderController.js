class OrderController {
    constructor(OrderModel, OrderItemModel) {
        this.Order = OrderModel;
        this.OrderItem = OrderItemModel;
    }

    async createOrder(req, res) {
        try {
            const user = req.user;
            const { items } = req.body; 

            if (!items || items.length === 0) return res.status(400).json({ error: "Carrito vacío" });

            // 1. Calcular total (Lógica Legacy)
            let total = 0;
            const orderItemsData = items.map(item => {
                const price = parseFloat(item.price);
                const qty = parseInt(item.quantity);
                total += price * qty;
                
                return {
                    // Adaptado a tu modelo OrderItemModel legacy
                    productName: item.name, 
                    quantity: qty,
                    price: price,
                    // Si tuvieras removed_ingredients, irían aquí
                };
            });

            // 2. Crear Orden
            const newOrder = await this.Order.create({
                userId: user.id,
                colegioId: user.colegio_id,
                total: total,
                status: 'PENDING',
                date: new Date()
            });

            // 3. Crear Items
            const itemsToSave = orderItemsData.map(i => ({ ...i, OrderId: newOrder.id }));
            await this.OrderItem.bulkCreate(itemsToSave);
            
            // --- AQUÍ FALTARÍA: RESTAR SALDO (Auth) Y RESTAR STOCK (Catalog) ---
            // En arquitectura distribuida real, enviarías un evento "ORDER_CREATED".
            // Por ahora, devolvemos éxito.

            res.status(201).json({ message: "Pedido realizado con éxito", order: newOrder });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creando pedido" });
        }
    }

    // Ver Pedidos (Para la Cafetería)
    async getIncomingOrders(req, res) {
        try {
            const user = req.user;
            
            // Validación de seguridad
            if (!user.colegio_id) {
                return res.status(400).json({ error: "Usuario sin colegio asignado" });
            }

            const orders = await this.Order.findAll({
                where: { colegioId: user.colegio_id },
                include: [
                    { 
                        model: this.OrderItem, 
                        as: 'items' // <--- IMPORTANTE: Debe coincidir con el index.js
                    }
                ], 
                order: [['createdAt', 'DESC']]
            });

            res.json(orders);
        } catch (error) {
            console.error("Error FATAL en getIncomingOrders:", error); // Verás el error real en la consola
            res.status(500).json({ error: "Error interno obteniendo pedidos: " + error.message });
        }
    }

    // Actualizar Estado (Cocina/Entregado)
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await this.Order.findByPk(id);
            if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

            order.status = status;
            await order.save();

            res.json(order);
        } catch (error) {
            res.status(500).json({ error: "Error actualizando estado" });
        }
    }
}

module.exports = OrderController;