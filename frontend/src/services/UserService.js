const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class UserService {
    constructor(token) {
        this.token = token;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
    }

    // Función genérica que da formato a respuestas
    async _handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Request failed.');
        }
        return response.json();
    }

    // --- GESTIÓN DE USUARIOS (Corrección: Agregado /auth) ---

    async getAllUsers() {
        // CORREGIDO: Ahora apunta a /api/auth/users
        const response = await fetch(`${API_BASE_URL}/auth/users`, {
            method: 'GET',
            headers: this.headers,
        });
        return this._handleResponse(response);
    }

    async createCafeteriaUser(userData) {
        // CORREGIDO: Ahora apunta a /api/auth/users/cafeteria
        const response = await fetch(`${API_BASE_URL}/auth/users/cafeteria`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(userData),
        });
        return this._handleResponse(response);
    }

    async createEstudianteUser(userData) {
        // CORREGIDO: /api/auth/users/estudiante
        const response = await fetch(`${API_BASE_URL}/auth/users/estudiante`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(userData),
        });
        return this._handleResponse(response);
    }

    async createPersonalUser(userData) {
        // CORREGIDO: /api/auth/users/personal
        const response = await fetch(`${API_BASE_URL}/auth/users/personal`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(userData),
        });
        return this._handleResponse(response);
    }

    async updateUser(userId, updates) {
        // CORREGIDO: /api/auth/users/:id
        const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(updates),
        });
        return this._handleResponse(response);
    }

    async deleteUser(userId) {
        // CORREGIDO: /api/auth/users/:id
        const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'DELETE',
            headers: this.headers,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to delete user ID ${userId}.`);
        }
        return { success: true }; 
    }

    // --- OTROS SERVICIOS ---

    async getAllIngredients() {
        // Este está bien si apunta al catalog-service
        const response = await fetch(`${API_BASE_URL}/products/ingredients`, {
            headers: this.headers,
        });
        return this._handleResponse(response)
    }

    async getMyAllergies() {
        // Este estaba bien
        const response = await fetch(`${API_BASE_URL}/auth/allergies`, {
            headers: this.headers,
        });
        return this._handleResponse(response);
    }

    async updateMyAllergies(ingredientIds) {
        // Este estaba bien
        const response = await fetch(`${API_BASE_URL}/auth/allergies`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ ingredientIds }),
        });
        return this._handleResponse(response);
    }

}

export default UserService;