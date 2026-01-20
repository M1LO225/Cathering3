// services/auth-service/src/controllers/AuthController.js

class AuthController {
    constructor(registerUser, loginUser) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
    }

    async register(req, res) {
        try {
            const { username, email, password, nombre, direccion, telefono, ciudad, provincia } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Datos de usuario (username, email, password) incompletos.' });
            }
            
            const userData = { username, email, password };
            const colegioData = { nombre, direccion, telefono, ciudad, provincia };

            // execute decidirá si llama a createColegioWithAdmin o save normal
            const user = await this.registerUser.execute(userData, colegioData);
            
            res.status(201).json({ 
                message: 'Usuario registrado exitosamente.', 
                userId: user.id,
                colegioId: user.colegio_id
            });
        } catch (error) {
            console.error('SERVER REGISTER ERROR:', error); 
            const status = error.message.includes('existe') ? 409 : 500;
            res.status(status).json({ error: error.message });
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
            console.error('Login Error:', error); 
            const status = error.message.includes('credenciales') || error.message.includes('Invalid') ? 401 : 500;
            res.status(status).json({ error: error.message });
        }
    }
}

module.exports = AuthController;