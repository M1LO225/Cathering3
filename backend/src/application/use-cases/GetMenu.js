class GetMenu {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(colegioId,onlyAvailable) {
        if(onlyAvailable){
            return await this.productRepository.findAvailableByColegio(colegioId);
        }
        return await this.productRepository.findAllByColegio(colegioId);
    }

}

module.exports = GetMenu;