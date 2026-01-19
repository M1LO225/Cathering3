class WalletController {
    constructor(WalletModel, TransactionModel) {
        this.Wallet = WalletModel;
        this.Transaction = TransactionModel;
    }

    // El estudiante ve su saldo
    async getBalance(req, res) {
        try {
            const userId = req.user.id;
            
            // Busca la billetera, si no existe la crea en 0 (Lazy initialization)
            const [wallet] = await this.Wallet.findOrCreate({
                where: { userId },
                defaults: { balance: 0.00 } // Asegúrate de usar 'saldo' o 'balance' consistentemente en tu modelo
            });

            res.json({ saldo: wallet.saldo }); // O wallet.balance según tu modelo
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener saldo' });
        }
    }

    // El estudiante recarga dinero (SUMA)
    async topUp(req, res) {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        console.log(`💰 INTENTO DE RECARGA RECIBIDO EN PUERTO 3003`);
        console.log(`👤 Usuario ID: ${userId} | Monto: ${amount}`);

        if (!amount || amount <= 0) return res.status(400).json({ error: 'Monto inválido' });

        const [wallet] = await this.Wallet.findOrCreate({
            where: { user_id: userId }, // Asegúrate que en tu modelo sea user_id (con guion bajo) o userId
            defaults: { saldo: 0.00 }
        });

        console.log(`📉 Saldo Anterior: ${wallet.saldo}`);

        // Sumar asegurando números
        const nuevoSaldo = parseFloat(wallet.saldo) + parseFloat(amount);
        
        // Actualizar
        wallet.saldo = nuevoSaldo;
        await wallet.save();

        console.log(`📈 Nuevo Saldo Guardado: ${wallet.saldo}`);

        res.json({ message: 'Recarga exitosa', nuevo_saldo: wallet.saldo });
    } catch (error) {
        console.error("❌ Error en topUp:", error);
        res.status(500).json({ error: 'Error al recargar saldo' });
        }
    }
}

module.exports = WalletController;