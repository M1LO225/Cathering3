class UpdateOrderStatus {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(orderId, newStatus) {
        // Llama al repositorio para actualizar el estado en la BD
        return await this.orderRepository.updateStatus(orderId, newStatus);
    }
}

module.exports = UpdateOrderStatus;