// src/infrastructure/controllers/AuthController.js
class AuthController {
    constructor(registerUser, loginUser) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
    }

    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            const user = await this.registerUser.execute(username, email, password);
            
            res.status(201).json({ 
                message: 'User registered successfully.', 
                userId: user.id 
            });
        } catch (error) {
            if (error.message.includes('exists')) {
                return res.status(409).json({ error: error.message });
            }
            res.status(500).json({ error: 'Internal server error during registration.' });
        }
    }

    async login(req, res) {
        try {
            const { usernameOrEmail, password } = req.body;
            
            const result = await this.loginUser.execute(usernameOrEmail, password);
            
            res.status(200).json({ 
                message: 'Login successful.',
                token: result.token,
                user: { id: result.user.id, username: result.user.username }
            });

        } catch (error) {
            // 🚨 AÑADIR ESTA LÍNEA: Imprimir el error completo del servidor para el diagnóstico.
            console.error('Login Error Interno:', error); 

            if (error.message.includes('credentials')) {
                // Error de negocio: Credenciales Inválidas
                return res.status(401).json({ error: error.message });
            }
            
            // Error técnico/inesperado
            return res.status(500).json({ error: 'Internal server error during login.' });
        }
    }
}

module.exports = AuthController;