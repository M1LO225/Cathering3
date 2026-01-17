const sequelize = require('../../infrastructure/config/database');

class CreateOrder {
    constructor(orderRepository, walletRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.walletRepository = walletRepository;
        this.productRepository = productRepository;
    }

    async execute(userId, cartItems) {
        const t = await sequelize.transaction(); // INICIO TRANSACCIÓN

        try {
            // 1. Obtener Billetera
            const wallet = await this.walletRepository.findByUserId(userId, t);
            
            // 2. Validar Stock y Calcular Total (Servidor es la autoridad)
            let totalCalculated = 0;
            const itemsToCreate = [];

            for (const item of cartItems) {
                // Buscamos producto con bloqueo (opcional, aquí simple)
                const product = await this.productRepository.findById(item.id);
                
                if (!product) throw new Error(`Producto ID ${item.id} no existe.`);
                if (product.stock < 1) throw new Error(`Producto ${product.nombre} agotado.`);

                // Restar Stock
                await this.productRepository.updateStock(product.id, -1, t); // Método que creamos antes

                // Acumular total
                totalCalculated += product.precio;

                // Preparar item para guardar
                itemsToCreate.push({
                    quantity: 1,
                    price_at_purchase: product.precio,
                    removed_ingredients: Array.isArray(item.removedIngredients) 
                        ? item.removedIngredients.join(', ') 
                        : '',
                    product_id: product.id
                });
            }

            // 3. Validar Saldo
            if (wallet.saldo < totalCalculated) {
                throw new Error(`Saldo insuficiente. Tienes $${wallet.saldo} y requieres $${totalCalculated}`);
            }

            // 4. Descontar Dinero
            const newBalance = wallet.saldo - totalCalculated;
            await this.walletRepository.updateBalance(wallet, newBalance, t);

            // 5. Crear Orden
            const orderData = {
                total: totalCalculated,
                status: 'PAID', // Asumimos pagado porque descontamos saldo
                payment_method: 'WALLET',
                user_id: userId
            };

            const order = await this.orderRepository.create(orderData, itemsToCreate, t);

            await t.commit(); // ÉXITO TOTAL
            return { order, newBalance };

        } catch (error) {
            await t.rollback(); // SI ALGO FALLA, NADA PASÓ
            throw error;
        }
    }
}

module.exports = CreateOrder;