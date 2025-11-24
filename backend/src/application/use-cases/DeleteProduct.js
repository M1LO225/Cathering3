class DeleteProduct {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(productId, colegioId) {
        const success = await this.productRepository.delete(productId, colegioId);
        if (!success) {
            throw new Error("Producto no encontrado o no tienes permiso para eliminarlo.");
        }
        return success;
    }
}

module.exports = DeleteProduct;