class OrderController {
    constructor(OrderModel, WalletModel) {
        this.Order = OrderModel;
        this.Wallet = WalletModel;
    }

    async create(req, res) {
        try {
            const userId = req.user.id; // Viene del Token (AuthMiddleware)
            const { items, total, method, colegioId } = req.body; // method: 'wallet' o 'cash'

            // Validación básica
            if (!items || items.length === 0) {
                return res.status(400).json({ error: 'El pedido no tiene items' });
            }

            // Si paga con Billetera, verificamos saldo
            let wallet = null;
            if (method === 'wallet') {
                wallet = await this.Wallet.findOne({ where: { userId } });
                
                if (!wallet || wallet.balance < total) {
                    return res.status(400).json({ error: 'Saldo insuficiente en billetera' });
                }
            }

            // Crear el Pedido
            // NOTA: Asumimos que la lógica de crear OrderItems se maneja aquí o 
            // simplificamos guardando solo la orden padre por ahora.
            // Para guardar items, idealmente tu index.js debe tener Order.hasMany(OrderItem)
            
            const newOrder = await this.Order.create({
                userId,
                total,
                status: 'pending',
                colegioId,
                walletId: wallet ? wallet.id : null
            });

            // Si pagó con wallet, descontamos
            if (wallet) {
                wallet.balance -= total;
                await wallet.save();
            }

            // Aquí podrías crear los OrderItems si inyectaste el modelo, 
            // pero para mantenerlo simple retornamos la orden creada.
            
            return res.status(201).json(newOrder);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al crear el pedido' });
        }
    }

    async getAll(req, res) {
        try {
            // Solo para admins/cocina
            const orders = await this.Order.findAll();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener pedidos' });
        }
    }
    
    // Obtener pedidos DEL usuario logueado
    async getMyOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await this.Order.findAll({ where: { userId } });
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener mis pedidos' });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const order = await this.Order.findByPk(id);
            if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

            order.status = status;
            await order.save();

            res.json(order);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar estado' });
        }
    }
}

module.exports = OrderController;