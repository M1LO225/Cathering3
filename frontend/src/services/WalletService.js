// frontend/src/services/WalletService.js
const API_BASE_URL = 'http://localhost:3000/api';

class WalletService {
    constructor(token) {
        this.token = token;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
    }

    async getBalance() {
        // Apuntamos a /auth/balance (Auth Service)
        const response = await fetch(`${API_BASE_URL}/auth/balance`, {
            method: 'GET',
            headers: this.headers,
        });
        
        if (!response.ok) throw new Error('Error al obtener saldo');
        return response.json(); 
    }

    async recharge(amount) {
        // Apuntamos a /auth/balance/recharge
        const response = await fetch(`${API_BASE_URL}/auth/balance/recharge`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) throw new Error('Error en la recarga');
        return response.json();
    }
}

export default WalletService;