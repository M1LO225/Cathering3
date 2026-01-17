class GetWalletBalance {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }

    async execute(userId) {
        // Busca la billetera o crea una vacía si es nuevo
        const wallet = await this.walletRepository.findByUserId(userId);
        return wallet;
    }
}

module.exports = GetWalletBalance;