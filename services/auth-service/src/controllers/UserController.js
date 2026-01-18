// services/auth-service/src/controllers/UserController.js

class UserController {
    constructor(userRepository, registerUserUseCase) {
        this.userRepository = userRepository;
        this.registerUserUseCase = registerUserUseCase;
    }

    // --- PERFIL (GET /me) ---
    async getProfile(req, res) {
        try {
            const userId = req.user.id; 
            const user = await this.userRepository.findById(userId);
            
            if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
            
            const userJson = user.toJSON();
            delete userJson.password; // Seguridad extra
            res.json(userJson);
        } catch (error) {
            console.error("Error en getProfile:", error);
            res.status(500).json({ error: 'Error al obtener el perfil.' });
        }
    }

    // --- CREAR USUARIO DESDE ADMIN (POST /users/:role) ---
    async createUser(req, res) {
        try {
            const roleFromUrl = req.params.role;
            const { username, email, password, ...restBody } = req.body;
            
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Faltan datos obligatorios.' });
            }

            // Forzamos el rol desde la URL
            const userData = { 
                username, email, password, role: roleFromUrl, ...restBody 
            };
            
            const user = await this.registerUserUseCase.execute(userData, {});
            
            res.status(201).json({ 
                message: `Usuario con rol '${roleFromUrl}' creado exitosamente.`, 
                userId: user.id 
            });
        } catch (error) {
            console.error(`Error en createUser (${req.params.role}):`, error);
            res.status(400).json({ error: error.message });
        }
    }

    // --- LISTA DE USUARIOS (GET /users) ---
    async getUsers(req, res) {
        try {
            const users = await this.userRepository.findAll();
            res.json(users);
        } catch (error) {
            console.error("Error en getUsers:", error);
            res.status(500).json({ error: 'Error al obtener usuarios.' });
        }
    }

    // --- ALERGIAS ---
    async getMyAllergies(req, res) {
        try {
            const allergies = await this.userRepository.getUserAllergies(req.user.id);
            res.json(allergies || []); 
        } catch (error) {
            console.error("Error en getMyAllergies:", error);
            res.status(500).json({ error: 'Error obteniendo alergias.' });
        }
    }

    async updateMyAllergies(req, res) {
        try {
            const { ingredientIds } = req.body; 
            if (!Array.isArray(ingredientIds)) {
                return res.status(400).json({ error: 'ingredientIds debe ser un array.' });
            }
            await this.userRepository.updateAllergies(req.user.id, ingredientIds);
            res.json({ message: "Alergias actualizadas correctamente." });
        } catch (error) {
            console.error("Error en updateMyAllergies:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // --- SALDO ---
    async getBalance(req, res) {
        try {
            const user = await this.userRepository.findById(req.user.id);
            res.json({ saldo: user && user.saldo !== null ? user.saldo : 0.00 });
        } catch (error) {
            console.error("Error en getBalance:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async rechargeBalance(req, res) {
        try {
            const { amount } = req.body;
            const monto = parseFloat(amount);
            if (isNaN(monto) || monto <= 0) {
                return res.status(400).json({ error: 'Monto inválido.' });
            }

            const user = await this.userRepository.findById(req.user.id);
            if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

            user.saldo = (user.saldo ? parseFloat(user.saldo) : 0.0) + monto;
            await user.save();

            res.json({ message: `Recarga de $${monto.toFixed(2)} exitosa.`, nuevoSaldo: user.saldo });
        } catch (error) {
            console.error("Error en rechargeBalance:", error);
            res.status(500).json({ error: 'Error interno en recarga.' });
        }
    }
}

module.exports = UserController;