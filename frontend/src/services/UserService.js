const API_BASE_URL = 'http://localhost:3000/api';

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

    async getAllUsers() {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: this.headers,
        });
        return this._handleResponse(response);
    }

    async createCafeteriaUser(userData) {
        const response = await fetch(`${API_BASE_URL}/users/cafeteria`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(userData),
        });
        return this._handleResponse(response);
    }

    async createEstudianteUser(userData) {
        const response = await fetch(`${API_BASE_URL}/users/estudiante`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(userData),
        });
        return this._handleResponse(response);
    }

    async updateUser(userId, updates) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(updates),
        });
        return this._handleResponse(response);
    }

    async deleteUser(userId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: this.headers,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to delete user ID ${userId}.`);
        }
        return { success: true }; 
    }
}

export default UserService;