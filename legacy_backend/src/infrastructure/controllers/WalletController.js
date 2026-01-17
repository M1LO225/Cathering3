class WalletController {
    constructor(getWalletBalance, topUpWallet) {
        this.getWalletBalance = getWalletBalance;
        this.topUpWallet = topUpWallet;
    }

    // GET /api/wallet
    async getBalance(req, res) {
        try {
            const userId = req.user.id; // Viene del token
            const wallet = await this.getWalletBalance.execute(userId);
            res.json(wallet);
        } catch (error) {
            console.error("Error obteniendo saldo:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // POST /api/wallet/topup
    async topUp(req, res) {
        try {
            const userId = req.user.id;
            const { amount } = req.body;

            const wallet = await this.topUpWallet.execute(userId, amount);
            
            res.json({ 
                message: "Recarga exitosa", 
                wallet: wallet 
            });
        } catch (error) {
            console.error("Error en recarga:", error);
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = WalletController;