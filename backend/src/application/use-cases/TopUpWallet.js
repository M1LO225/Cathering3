class TopUpWallet {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async execute(userId, amount) {
        if (amount <= 0) throw new Error("El monto debe ser positivo.");
        
        // 1. Obtener billetera actual
        const wallet = await this.walletRepository.findByUserId(userId);
        
        // 2. Calcular nuevo saldo
        const newBalance = wallet.saldo + parseFloat(amount);
        
        // 3. Guardar
        return await this.walletRepository.updateBalance(wallet, newBalance, null);
    }
}
module.exports = TopUpWallet;