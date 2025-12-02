class OrderController {
    constructor(createOrder, getIncomingOrders, updateOrderStatus) {
        this.createOrder = createOrder;
        this.getIncomingOrders = getIncomingOrders;
        this.updateOrderStatus = updateOrderStatus;
    }

    // POST /api/orders (Estudiante/Personal)
    async create(req, res) {
        try {
            const userId = req.user.id;
            const { items } = req.body; // Array del carrito

            if (!items || items.length === 0) {
                return res.status(400).json({ error: "El carrito está vacío" });
            }

            const result = await this.createOrder.execute(userId, items);
            res.status(201).json({ message: "¡Pedido realizado con éxito!", ...result });

        } catch (error) {
            console.error("Error en pedido:", error);
            // Manejo de errores conocidos vs internos
            const status = error.message.includes("Saldo") || error.message.includes("agotado") ? 400 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    // GET /api/orders/incoming (Cafetería)
    async listIncoming(req, res) {
        try {
            const colegioId = req.user.colegio_id;
            const orders = await this.getIncomingOrders.execute(colegioId);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; // 'EN_PREPARACION', 'LISTO'
            
            // Usamos el caso de uso inyectado
            await this.updateOrderStatus.execute(id, status);
            
            res.json({ message: `Pedido actualizado a ${status}` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = OrderController;