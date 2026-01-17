const OrderModel = require('../models/OrderModel');
const OrderItemModel = require('../models/OrderItemModel');
const ProductModel = require('../models/ProductModel');
const UserModel = require('../models/UserModel');

class SequelizeOrderRepository {

    async create(orderData, itemsData, transaction) {
        // 1. Crear la cabecera de la orden
        const order = await OrderModel.create(orderData, { transaction });

        // 2. Crear los items vinculados
        const itemsWithOrderId = itemsData.map(item => ({ ...item, order_id: order.id }));
        await OrderItemModel.bulkCreate(itemsWithOrderId, { transaction });

        return order;
    }

    // Para la Cafetería: Ver pedidos entrantes (PAID o PENDING)
    async findIncoming(colegioId) {
        return await OrderModel.findAll({
            // Filtramos pedidos pagados que necesitan atención
            where: { 
                status: ['PAID', 'EN_PREPARACION'] 
            },
            include: [
                { 
                    model: UserModel, 
                    as: 'user', 
                    where: { colegio_id: colegioId }, // Solo pedidos de este colegio
                    attributes: ['username', 'email'] 
                },
                {
                    model: OrderItemModel,
                    as: 'items',
                    include: [{ model: ProductModel, as: 'product', attributes: ['nombre'] }]
                }
            ],
            order: [['createdAt', 'DESC']] // Los más recientes primero
        });
    }
    
    async updateStatus(orderId, newStatus) {
        // Actualiza el campo 'status' donde el ID coincida
        return await OrderModel.update(
            { status: newStatus }, 
            { where: { id: orderId } }
        );
    }
}

module.exports = SequelizeOrderRepository;