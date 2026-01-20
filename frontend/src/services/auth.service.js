const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TOKEN_KEY = 'token';

class AuthService {

    /**
     * @param {Object} formData 
     */
    async register(formData) {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData), 
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        
        return data; 
    }

    /**
     * Login
     */
    async login(usernameOrEmail, password) {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usernameOrEmail, password }),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Guardamos el token y devolvemos el usuario
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data; 
    }

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }
    
    isAuthenticated() {
        return !!this.getToken();
    }
    
    logout() {
        localStorage.removeItem(TOKEN_KEY);
    }

    async fetchProtected(endpoint, options = {}) {
        const token = this.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
        };

        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });
        
        if (response.status === 401) {
            this.logout();
            throw new Error('Unauthorized. Session expired.');
        }

        return response;
    }
    
}

export default new AuthService();