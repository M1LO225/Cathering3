class OrderController {
    constructor(createOrder, getIncomingOrders) {
        this.createOrder = createOrder;
        this.getIncomingOrders = getIncomingOrders;
    }

    async create(req, res) {
        try {
            const userId = req.user.id;
            const { items } = req.body;

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
            const { status } = req.body;
            await this.updateOrderStatus.execute(id, status);
            res.json({ message: `Pedido actualizado a ${status}` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = OrderController;