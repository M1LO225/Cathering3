class GetIncomingOrders {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(colegioId) {
        return await this.orderRepository.findIncoming(colegioId);
    }
}
module.exports = GetIncomingOrders;