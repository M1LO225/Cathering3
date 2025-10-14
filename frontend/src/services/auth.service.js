

const API_URL = 'http://localhost:3000/api/auth';
const TOKEN_KEY = 'token';

class AuthService {
    

    async register(username, email, password) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.error || 'Registration failed');
        }

        return data;
    }
    

    async login(usernameOrEmail, password) {
        const response = await fetch(`${API_URL}/login`, {
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


        localStorage.setItem(TOKEN_KEY, data.token);
        

        return data.user;
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

        const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
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


export default AuthService;