// frontend/src/services/auth.service.js

const API_URL = 'http://localhost:3000/api/auth';
const TOKEN_KEY = 'token';

class AuthService {
    
    // --------------------------------------------------------------------
    // 1. REGISTRO DE USUARIO (POST /api/auth/register)
    // --------------------------------------------------------------------
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
            // Lanza un error para que el componente lo capture
            throw new Error(data.error || 'Registration failed');
        }

        return data;
    }
    
    // --------------------------------------------------------------------
    // 2. LOGIN DE USUARIO (POST /api/auth/login)
    // --------------------------------------------------------------------
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

        // Si el login es exitoso, guardamos el JWT en el Local Storage
        localStorage.setItem(TOKEN_KEY, data.token);
        
        // Opcional: retornar datos del usuario
        return data.user;
    }
    
    // --------------------------------------------------------------------
    // 3. GESTIÓN DEL TOKEN Y SESIÓN
    // --------------------------------------------------------------------
    
    // Obtiene el token guardado para enviarlo en peticiones protegidas
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }
    
    // Verifica si hay un token, indicando que el usuario está "logueado"
    isAuthenticated() {
        return !!this.getToken();
    }
    
    // Cierra la sesión
    logout() {
        localStorage.removeItem(TOKEN_KEY);
    }

    // Método genérico para hacer peticiones a rutas protegidas
    async fetchProtected(endpoint, options = {}) {
        const token = this.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            // Agregamos el token a la cabecera 'Authorization' (Bearer)
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
            // Si el token expira o es inválido, forzamos el logout
            this.logout();
            throw new Error('Unauthorized. Session expired.');
        }

        return response;
    }
}

// Exportamos una instancia del servicio para usarla en toda la aplicación
export default AuthService;