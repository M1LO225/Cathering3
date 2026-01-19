class OrderController {
    constructor(OrderModel, OrderItemModel, WalletModel) {
        this.Order = OrderModel;
        this.OrderItem = OrderItemModel;
        this.Wallet = WalletModel;
    }

    async createOrder(req, res) {
        try {
            const user = req.user;
            const { items } = req.body; 

            if (!items || items.length === 0) return res.status(400).json({ error: "Carrito vacío" });

            // 1. Calcular total
            let total = 0;
            const orderItemsData = items.map(item => {
                const price = parseFloat(item.price);
                const qty = parseInt(item.quantity);
                total += price * qty;
                
                return {
                    productName: item.name, 
                    quantity: qty,
                    price: price,
                    removedIngredients: item.removedIngredients ? JSON.stringify(item.removedIngredients) : null
                };
            });

            // ---------------------------------------------------------
            // 2. LÓGICA DE COBRO (Aquí usamos el WalletModel)
            // ---------------------------------------------------------
            const wallet = await this.Wallet.findOne({ where: { userId: user.id } });

            if (!wallet) {
                return res.status(404).json({ error: "No tienes billetera activa. Recarga saldo primero." });
            }

            if (parseFloat(wallet.saldo) < total) {
                return res.status(400).json({ 
                    error: `Saldo insuficiente. Tienes $${wallet.saldo} y el pedido es de $${total}` 
                });
            }

            // RESTAMOS el dinero (Cobro)
            wallet.saldo = parseFloat(wallet.saldo) - total;
            await wallet.save();
            // ---------------------------------------------------------

            // 3. Crear Orden (Solo si el cobro pasó)
            const newOrder = await this.Order.create({
                userId: user.id,
                colegioId: user.colegio_id,
                total: total,
                status: 'PENDING',
                walletId: wallet.id // Opcional: guardamos qué billetera pagó
            });

            // 4. Guardar Items
            const itemsToSave = orderItemsData.map(i => ({ ...i, OrderId: newOrder.id }));
            await this.OrderItem.bulkCreate(itemsToSave);
            
            res.status(201).json({ 
                message: "Pedido pagado y creado", 
                order: newOrder,
                saldo_restante: wallet.saldo
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error procesando el pedido" });
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
    
    async getMyOrders(req, res) {
        try {
            const orders = await this.Order.findAll({
                where: { userId: req.user.id },
                include: [{ model: this.OrderItem, as: 'items' }],
                order: [['createdAt', 'DESC']]
            });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: "Error obteniendo mis pedidos" });
        }
    }
}

module.exports = OrderController;