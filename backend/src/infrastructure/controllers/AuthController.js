class AuthController {
    constructor(registerUser, loginUser) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
    }

    async register(req, res) {
        try {
            // El body espera el 'telefono', 'nombre', etc. al mismo nivel
            const { username, email, password, nombre, direccion, telefono, ciudad, provincia } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Datos de usuario (username, email, password) incompletos.' });
            }
            
            // (La validación de 'nombre' y 'telefono' ya la hizo el middleware 'validateColegio')

            const userData = { username, email, password };
            const colegioData = { nombre, direccion, telefono, ciudad, provincia };

            const user = await this.registerUser.execute(userData, colegioData);
            
            res.status(201).json({ 
                message: 'Colegio y Admin registrados exitosamente.', 
                userId: user.id,
                colegioId: user.colegio_id
            });
        } catch (error) {
            console.error('SERVER REGISTER ERROR:', error); 
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
            console.error('Login Error Interno:', error); 
            if (error.message.includes('credentials')) {
                return res.status(401).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal server error during login.' });
        }
    }
}

module.exports = AuthController;