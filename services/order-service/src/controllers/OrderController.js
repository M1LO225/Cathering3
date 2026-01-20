const { Op } = require('sequelize');

class OrderController {
    constructor(OrderModel, OrderItemModel, WalletModel) {
        this.Order = OrderModel;
        this.OrderItem = OrderItemModel;
        this.Wallet = WalletModel;
    }

    // --- 1. CREAR PEDIDO (DEBUG MODE) ---
    async createOrder(req, res) {
        console.log("🚀 INICIANDO PROCESO DE CREAR ORDEN...");
        try {
            const user = req.user;
            const { items } = req.body; 

            console.log(`👤 Usuario: ${user.id} | Colegio: ${user.colegio_id}`);

            if (!items || items.length === 0) return res.status(400).json({ error: "Carrito vacío" });

            // 1. Calcular
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
                    removedIngredients: (item.removedIngredients && item.removedIngredients.length > 0) ? JSON.stringify(item.removedIngredients) : null
                };
            });
            console.log(`💰 Total calculado: ${total}`);

            // 2. Wallet
            const wallet = await this.Wallet.findOne({ where: { userId: user.id } });
            if (!wallet) {
                console.log("❌ Error: No hay billetera");
                return res.status(404).json({ error: "Sin billetera" });
            }
            console.log(`💳 Saldo actual: ${wallet.balance}`);

            if (parseFloat(wallet.balance) < total) {
                console.log("❌ Error: Saldo insuficiente");
                return res.status(400).json({ error: "Saldo insuficiente" });
            }

            // 3. Cobrar
            const nuevoSaldo = parseFloat(wallet.balance) - total;
            await wallet.update({ balance: nuevoSaldo });
            console.log("✅ Cobro realizado en Wallet");

            // 4. Crear Orden
            console.log("💾 Intentando guardar Orden en DB...");
            const newOrder = await this.Order.create({
                userId: user.id,
                colegioId: user.colegio_id,
                total: total,
                status: 'PAID',
                walletId: wallet.id
            });
            console.log(`✅ ORDEN GUARDADA CON ÉXITO. ID: ${newOrder.id}`);

            // 5. Items
            const itemsToSave = orderItemsData.map(i => ({ ...i, OrderId: newOrder.id }));
            await this.OrderItem.bulkCreate(itemsToSave);
            console.log("✅ Items guardados");
            
            res.status(201).json({ 
                message: "Pedido realizado con éxito", 
                order: newOrder,
                nuevo_saldo: nuevoSaldo
            });

        } catch (error) {
            console.error("❌❌ ERROR FATAL EN CREATE ORDER ❌❌");
            console.error(error); // ESTO ES LO QUE NECESITAMOS VER
            res.status(500).json({ error: "Error procesando el pedido: " + error.message });
        }
    }

    // ... Mantén el resto de métodos (getIncomingOrders, etc) igual ...
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