class WalletController {
    constructor(WalletModel, TransactionModel) {
        this.Wallet = WalletModel;
        this.Transaction = TransactionModel;
    }

    async getBalance(req, res) {
        try {
            const userId = req.user.id;
            
            // Buscar billetera o crearla si no existe (lazy creation)
            const [wallet, created] = await this.Wallet.findOrCreate({
                where: { userId },
                defaults: { balance: 0.00 }
            });

            res.json(wallet);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener saldo' });
        }
    }

    async topUp(req, res) {
        try {
            const userId = req.user.id; // Ojo: Normalmente recarga un Admin, ajusta según tu lógica
            const { amount } = req.body;

            if (amount <= 0) return res.status(400).json({ error: 'Monto inválido' });

            const wallet = await this.Wallet.findOne({ where: { userId } });
            if (!wallet) return res.status(404).json({ error: 'Billetera no encontrada' });

            // Actualizar saldo
            wallet.balance += parseFloat(amount);
            await wallet.save();

            // Registrar transacción (Si TransactionModel fue inyectado)
            if (this.Transaction) {
                await this.Transaction.create({
                    walletId: wallet.id,
                    type: 'TOPUP',
                    amount: amount,
                    description: 'Recarga de saldo'
                });
            }

            res.json({ message: 'Recarga exitosa', balance: wallet.balance });
        } catch (error) {
            res.status(500).json({ error: 'Error al recargar saldo' });
        }
    }
    
    async getTransactions(req, res) {
        try {
            const userId = req.user.id;
            const wallet = await this.Wallet.findOne({ where: { userId } });
            
            if (!wallet) return res.json([]); // Sin billetera, sin movimientos

            if (this.Transaction) {
                const transactions = await this.Transaction.findAll({
                    where: { walletId: wallet.id },
                    order: [['createdAt', 'DESC']]
                });
                return res.json(transactions);
            }
            
            res.json([]);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener movimientos' });
        }
    }
}

module.exports = WalletController;