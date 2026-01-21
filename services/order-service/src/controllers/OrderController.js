// src/controllers/OrderController.js
const { sendOrderToQueue } = require('../config/sqs');

class OrderController {
    constructor(OrderModel, OrderItemModel, WalletModel) {
        this.Order = OrderModel;
        this.OrderItem = OrderItemModel;
        this.Wallet = WalletModel;
    }

    async createOrder(req, res) {
        console.log("📍 [CONTROLLER] Iniciando createOrder...");
        
        try {
            // PASO 1: Validar Usuario
            if (!req.user) {
                console.error("❌ [ERROR] req.user es undefined. El AuthMiddleware falló.");
                return res.status(401).json({ error: "Usuario no identificado en el sistema" });
            }

            const userId = req.user.id;
            const colegioId = req.user.colegio_id;
            const { items } = req.body; 

            // PASO 2: Validar Items
            if (!items || !Array.isArray(items) || items.length === 0) {
                console.error("❌ [ERROR] Items inválidos:", items);
                return res.status(400).json({ error: "El carrito está vacío o formato incorrecto" });
            }

            console.log(`🛒 [ITEMS] Recibidos ${items.length} productos`);

            // PASO 3: Calcular Total
            let totalAmount = 0;
            items.forEach(item => {
                const price = parseFloat(item.price);
                const qty = parseInt(item.quantity);
                totalAmount += (price * qty);
            });
            console.log(`💰 [TOTAL] Calculado: $${totalAmount}`);

            // PASO 4: Crear Orden (Cabecera)
            console.log("💾 [DB] Intentando crear orden PENDING...");
            const newOrder = await this.Order.create({
                userId,
                colegioId,
                total: totalAmount,
                status: 'PENDING', 
                walletId: null
            });
            console.log(`✅ [DB] Orden creada con ID: ${newOrder.id}`);

            // PASO 5: Crear Items (Detalle)
            console.log("💾 [DB] Guardando detalles de items...");
            
            // --- 🚨 AQUÍ ESTABA EL ERROR Y AQUÍ ESTÁ LA SOLUCIÓN ---
            const orderItems = items.map(item => ({
                // Antes decia: name: item.name
                productName: item.name, // <--- CORRECCIÓN: Mapeamos al nombre de columna real
                price: item.price,
                quantity: item.quantity,
                productId: item.id || item.productId,
                removedIngredients: JSON.stringify(item.removedIngredients || []), // Aseguramos formato
                OrderId: newOrder.id
            }));
            
            await this.OrderItem.bulkCreate(orderItems);
            // -------------------------------------------------------

            // PASO 6: SQS
            console.log("📨 [SQS] Preparando envío a cola...");
            const messagePayload = {
                type: 'PROCESS_PAYMENT',
                orderId: newOrder.id,
                userId: userId,
                amount: totalAmount
            };

            if (!process.env.SQS_WALLET_URL) {
                console.error("🔥 [CRITICAL] SQS_WALLET_URL no está definida!");
            }

            await sendOrderToQueue(messagePayload);
            console.log("🚀 [SQS] Mensaje enviado exitosamente");

            res.status(202).json({ 
                message: "Orden recibida. Procesando pago...", 
                orderId: newOrder.id,
                status: 'PENDING'
            });

        } catch (error) {
            console.error("❌ [EXCEPTION] Error en createOrder:", error);
            console.error(error.stack);
            res.status(500).json({ 
                error: "Error interno procesando la orden",
                details: error.message 
            });
        }
    }

    // ... MANTENER EL RESTO DE MÉTODOS IGUALES ...
    async getIncomingOrders(req, res) {
        try {
            const userColegioId = req.user.colegio_id;
            const orders = await this.Order.findAll({
                where: { 
                    colegioId: userColegioId,
                    status: ['PAID', 'READY', 'DELIVERED'] 
                },
                include: [{ model: this.OrderItem, as: 'items' }],
                order: [['createdAt', 'DESC']]
            });
            res.json(orders);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error obteniendo ordenes' });
        }
    }

    async getMyOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await this.Order.findAll({
                where: { userId },
                include: [{ model: this.OrderItem, as: 'items' }],
                order: [['createdAt', 'DESC']]
            });
            res.json(orders);
        } catch (error) {
            console.error("Error obteniendo mis ordenes:", error);
            res.status(500).json({ error: 'Error al obtener historial' });
        }
    }
    
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await this.Order.update({ status }, { where: { id } });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Error actualizando estado' });
        }
    }
}

module.exports = OrderController;