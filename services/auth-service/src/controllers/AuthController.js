class AuthController {
    constructor(registerUser, loginUser, userRepository) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
        this.userRepository = userRepository;
    }

    async register(req, res) {
        try {
            const { username, email, password, nombre, direccion, telefono, ciudad, provincia } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Datos de usuario (username, email, password) incompletos.' });
            }
            
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
                user: result.user 
            });
        } catch (error) {
            console.error('Login Error Interno:', error); 
            if (error.message.includes('credentials')) {
                return res.status(401).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal server error during login.' });
        }
    }

    async getMyAllergies(req, res) {
        try{
            const userId = req.user.id;
            const allergies = await this.userRepository.getUserAllergies(userId);
            res.json(allergies);
        } catch (error) {
            console.error('Error obteniendo alergias del usuario:', error);
            res.status(500).json({ error: 'Error interno al obtener las alergias del usuario.' });
        }
    }

    async updateMyAllergies(req, res) {
        try {
            const userId = req.user.id;
            const { ingredientIds } = req.body;
            
            await this.userRepository.updateAllergies(userId, ingredientIds);
            res.json({ message: "Alergias actualizadas correctamente." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AuthController;