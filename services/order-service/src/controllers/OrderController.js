const { Op } = require('sequelize');

class OrderController {
    constructor(OrderModel, OrderItemModel, WalletModel) {
        this.Order = OrderModel;
        this.OrderItem = OrderItemModel;
        this.Wallet = WalletModel;
    }

    // --- 1. CREAR PEDIDO (DEBUG MODE) ---
    async createOrder(req, res) {
        console.log("🚀 [ORDER] Iniciando pedido asíncrono...");
        try {
            const user = req.user;
            const { items } = req.body;

            // 1. Calcular Total
            let total = 0;
            const orderItemsData = items.map(item => {
                const price = parseFloat(item.price);
                const qty = parseInt(item.quantity);
                total += price * qty;
                return {
                    productId: item.id,
                    productName: item.name,
                    quantity: qty,
                    price: price,
                    removedIngredients: item.removedIngredients ? JSON.stringify(item.removedIngredients) : null
                };
            });

            // 2. Crear Orden en estado PENDING (Pendiente de pago)
            const newOrder = await this.Order.create({
                userId: user.id,
                colegioId: user.colegio_id,
                total: total,
                status: 'PENDING', // ⚠️ CAMBIO IMPORTANTE
                walletId: null // Ya no sabemos el ID de la wallet aquí directamente
            });

            // 3. Guardar Items
            const itemsToSave = orderItemsData.map(i => ({ ...i, OrderId: newOrder.id }));
            await this.OrderItem.bulkCreate(itemsToSave);

            // 4. 🌩️ ENVIAR MENSAJE A SQS (Comunicación Asíncrona)
            const sqsParams = {
                QueueUrl: process.env.SQS_WALLET_URL, // Inyectada por Terraform
                MessageBody: JSON.stringify({
                    type: 'DEDUCT_FUNDS',
                    orderId: newOrder.id,
                    userId: user.id,
                    amount: total
                })
            };

            await sqsClient.send(new SendMessageCommand(sqsParams));
            console.log(`📨 Evento enviado a SQS para Orden #${newOrder.id}`);

            // 5. Responder rápido al cliente (No esperar el pago)
            res.status(201).json({
                message: "Pedido recibido. Procesando pago en segundo plano.",
                orderId: newOrder.id,
                status: 'PENDING'
            });

        } catch (error) {
            console.error("❌ Error creando orden:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async getIncomingOrders(req, res) {
        try {
            const user = req.user;
            if (!user.colegio_id) return res.status(400).json({ error: "Usuario sin colegio" });

            const orders = await this.Order.findAll({
                where: { 
                    colegioId: user.colegio_id,
                    status: { [Op.in]: ['PAID', 'EN_PREPARACION', 'LISTO'] }
                },
                include: [{ model: this.OrderItem, as: 'items' }], 
                order: [['createdAt', 'ASC']]
            });
            console.log(`📦 Cocina: Encontrados ${orders.length} pedidos para colegio ${user.colegio_id}`);
            res.json(orders);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error obteniendo pedidos" });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await this.Order.findByPk(id);
            if (!order) return res.status(404).json({ error: "No encontrado" });
            order.status = status;
            await order.save();
            res.json(order);
        } catch (error) {
            res.status(500).json({ error: "Error updating status" });
        }
    }

    async getMyOrders(req, res) {
        try {
            const orders = await this.Order.findAll({
                where: { userId: req.user.id },
                include: [{ model: this.OrderItem, as: 'items' }],
                order: [['createdAt', 'DESC']]
            });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: "Error getting orders" });
        }
    }
}

module.exports = OrderController;