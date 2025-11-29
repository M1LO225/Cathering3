class WalletController {
    constructor(getWalletBalance, topUpWallet) {
        this.getWalletBalance = getWalletBalance;
        this.topUpWallet = topUpWallet;
    }

    async getBalance(req, res) {
        try {
            const wallet = await this.getWalletBalance.execute(req.user.id);
            res.json(wallet);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async topUp(req, res) {
        try {
            const { amount } = req.body;
            const wallet = await this.topUpWallet.execute(req.user.id, amount);
            res.json({ message: "Recarga exitosa", wallet });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
module.exports = WalletController;