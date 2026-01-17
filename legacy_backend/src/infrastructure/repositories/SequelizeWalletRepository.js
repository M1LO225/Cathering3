const WalletModel = require('../models/WalletModel');

class SequelizeWalletRepository {
    
    // Buscar billetera por ID de usuario (o crearla si no existe para evitar errores)
    async findByUserId(userId, transaction = null) {
        const options = { 
            where: { user_id: userId },
            defaults: { saldo: 0.0, user_id: userId } // Saldo inicial 0
        };
        if (transaction) options.transaction = transaction;

        const [wallet] = await WalletModel.findOrCreate(options);
        return wallet;
    }

    // Actualizar saldo (dentro de una transacción)
    async updateBalance(wallet, newBalance, transaction) {
        wallet.saldo = newBalance;
        await wallet.save({ transaction });
        return wallet;
    }
}

module.exports = SequelizeWalletRepository;