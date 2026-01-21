const API_BASE_URL = import.meta.env.VITE_API_URL ||'http://localhost:3003/api';

class OrderService {
    constructor(token) {
        this.token = token;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
    }

    // Crear Orden (Checkout)
    async createOrder(cartItems) {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ items: cartItems }),
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al procesar el pedido');
        return data;
    }

    // Ver Pedidos (Cafetería)
    async getIncomingOrders() {
        const response = await fetch(`${API_BASE_URL}/orders/incoming`, {
            headers: this.headers
        });
        return response.json();
    }

    async updateStatus(orderId, status) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el estado de la orden');
        }
        return response.json();
    }
}
export default OrderService;