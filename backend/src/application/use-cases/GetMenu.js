class GetMenu {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(colegioId) {
        return await this.productRepository.findAllByColegio(colegioId);
    }
}

module.exports = GetMenu;