class TopUpWallet {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }

    async execute(userId, amount) {
        // Validación básica
        if (!amount || amount <= 0) {
            throw new Error("El monto a recargar debe ser positivo.");
        }
        
        // 1. Obtener billetera actual
        const wallet = await this.walletRepository.findByUserId(userId);
        
        // 2. Calcular nuevo saldo (Simulación de transacción exitosa)
        const newBalance = wallet.saldo + parseFloat(amount);
        
        // 3. Guardar en base de datos
        // (Pasamos null como transacción porque es una operación simple aquí)
        return await this.walletRepository.updateBalance(wallet, newBalance, null);
    }
}

module.exports = TopUpWallet;