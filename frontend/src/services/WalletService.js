const API_BASE_URL = `${import.meta.env.VITE_API_URL}/wallet`; 

class WalletService {
    constructor(token) {
        this.token = token;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
    }

    async getBalance() {
        // Al llamar a /balance, la URL final será: .../api/wallet/balance
        const response = await fetch(`${API_BASE_URL}/balance`, {
            method: 'GET',
            headers: this.headers,
        });
        
        if (!response.ok) throw new Error('Error al obtener saldo');
        return response.json(); 
    }

    async recharge(amount) {
        // URL final: .../api/wallet/topup
        const response = await fetch(`${API_BASE_URL}/topup`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) throw new Error('Error en la recarga');
        return response.json();
    }
}

export default WalletService;