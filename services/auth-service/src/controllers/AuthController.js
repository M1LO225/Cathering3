// services/auth-service/src/controllers/AuthController.js
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
                return res.status(400).json({ error: 'Faltan datos de usuario.' });
            }
            
            const userData = { username, email, password };
            const colegioData = { nombre, direccion, telefono, ciudad, provincia };

            const user = await this.registerUser.execute(userData, colegioData);
            res.status(201).json({ message: 'Usuario registrado.', userId: user.id });
        } catch (error) {
            console.error(error);
            const status = error.message.includes('existe') ? 409 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { usernameOrEmail, password } = req.body;
            const result = await this.loginUser.execute(usernameOrEmail, password);
            res.status(200).json({ message: 'Login OK', token: result.token, user: result.user });
        } catch (error) {
            console.error(error);
            const status = error.message.includes('inválidas') ? 401 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    async getMyAllergies(req, res) {
        try {
            const allergies = await this.userRepository.getUserAllergies(req.user.id);
            res.json(allergies); // Retorna array de IDs [1, 2, 3]
        } catch (error) {
            res.status(500).json({ error: 'Error obteniendo alergias.' });
        }
    }

    async updateMyAllergies(req, res) {
        try {
            const { ingredientIds } = req.body; // Espera [1, 2]
            await this.userRepository.updateAllergies(req.user.id, ingredientIds);
            res.json({ message: "Alergias actualizadas." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = AuthController;