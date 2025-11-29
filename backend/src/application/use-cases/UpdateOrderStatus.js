class UpdateOrderStatus {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute(orderId, newStatus) {
        return await this.orderRepository.updateStatus(orderId, newStatus);
    }
}
module.exports = UpdateOrderStatus;