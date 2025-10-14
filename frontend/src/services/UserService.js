

const API_BASE_URL = 'http://localhost:3000/api';

class UserService {
    /**
     * @param {string} token 
     */
    constructor(token) {
        this.token = token;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
    }

    async getAllUsers() {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: this.headers,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch users.');
        }

        return response.json();
    }

    async createUser(userData) {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user.');
        }

        return response.json();
    }
    

    async updateUser(userId, updates) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to update user ID ${userId}.`);
        }

        return response.json();
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