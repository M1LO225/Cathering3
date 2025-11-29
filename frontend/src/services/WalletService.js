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
        const response = await fetch(`${API_BASE_URL}/wallet`, { headers: this.headers });
        return response.json();
    }

    async topUp(amount) {
        const response = await fetch(`${API_BASE_URL}/wallet/topup`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ amount }),
        });
        return response.json();
    }
}
export default WalletService;