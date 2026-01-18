// services/auth-service/src/controllers/AuthController.js

class AuthController {
    constructor(registerUserUseCase, loginUserUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
    }

    // --- REGISTRO PÚBLICO ---
    async register(req, res) {
        try {
            const { username, email, password, nombre, direccion, telefono, ciudad, provincia } = req.body;
            
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Faltan datos obligatorios (username, email, password).' });
            }
            
            const userData = { username, email, password };
            const colegioData = { nombre, direccion, telefono, ciudad, provincia };

            const user = await this.registerUserUseCase.execute(userData, colegioData);
            res.status(201).json({ message: 'Usuario registrado exitosamente.', userId: user.id });
        } catch (error) {
            console.error("Error en register:", error);
            const status = error.message.includes('existe') ? 409 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    // --- LOGIN ---
    async login(req, res) {
        try {
            const { usernameOrEmail, password } = req.body;
            const result = await this.loginUserUseCase.execute(usernameOrEmail, password);
            res.status(200).json({ 
                message: 'Login exitoso', 
                token: result.token, 
                user: result.user 
            });
        } catch (error) {
            console.error("Error en login:", error);
            const status = error.message.includes('inválidas') ? 401 : 500;
            res.status(status).json({ error: error.message });
        }
    }
}

module.exports = AuthController;