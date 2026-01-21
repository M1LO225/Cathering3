// services/auth-service/src/controllers/UserController.js

class UserController {
    constructor(userRepository, encryptService, updateUserUseCase, TransactionModel) {
        this.userRepository = userRepository;
        this.encryptService = encryptService;
        this.updateUserUseCase = updateUserUseCase;
        this.TransactionModel = TransactionModel;
    }

    // --- 1. CREAR USUARIO (Lógica Admin Colegio) ---
    async createUserByAdmin(req, res, roleToCreate) {
        const { username, email, password } = req.body;
        
        try {
            const adminId = req.user.id; 
            const adminUser = await this.userRepository.findById(adminId);

            if (!adminUser || !adminUser.colegio_id) {
                return res.status(403).json({ error: 'No tienes un colegio asociado.' });
            }

            const colegioId = adminUser.colegio_id;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Faltan datos requeridos.' });
            }

            if (roleToCreate === 'cafeteria') {
                const existingCafeteria = await this.userRepository.findOneByRoleAndColegio('cafeteria', colegioId);
                if (existingCafeteria) {
                    return res.status(400).json({ error: 'Este colegio ya tiene una Cafetería registrada.' });
                }
            }

            const existingUser = await this.userRepository.findByUsernameOrEmail(username, email);
            if (existingUser) {
                return res.status(409).json({ error: 'El usuario o correo ya existe.' });
            }

            const passwordHash = await this.encryptService.hash(password);
            
            const newUser = { 
                username, 
                email, 
                passwordHash: passwordHash, 
                role: roleToCreate, 
                colegio_id: colegioId,
                saldo: 0,
                allergies: '[]' // Inicializamos como string JSON vacío
            };
            
            const createdUser = await this.userRepository.save(newUser);
            const userJson = createdUser.toJSON();
            delete userJson.password;

            res.status(201).json({ message: `${roleToCreate} creado exitosamente.`, user: userJson });

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getColegio(req, res) {
        try {
            const colegio = await this.userRepository.findColegioByAdminId(req.user.id);
            if (!colegio) return res.status(404).json({ error: 'No encontrado.' });
            res.json(colegio);
        } catch (error) {
            res.status(500).json({ error: 'Error interno.' });
        }
    }

    async updateColegio(req, res) {
        try {
            const updated = await this.userRepository.updateColegio(req.user.id, req.body);
            if (!updated) return res.status(404).json({ error: 'No se pudo actualizar.' });
            res.status(200).json({ message: 'Colegio actualizado.', colegio: updated });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar.' });
        }
    }

    // --- 2. LISTAR USUARIOS ---
    async listUsers(req, res) {
        try {
            const adminUser = await this.userRepository.findById(req.user.id);
            if(!adminUser || !adminUser.colegio_id) return res.status(400).json({ error: 'Error de permisos.' });
            const users = await this.userRepository.findAllByColegio(adminUser.colegio_id);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Error al listar.' });
        }
    }

    // --- 3. ACTUALIZAR / ELIMINAR ---
    async update(req, res) {
        try {
            const updatedUser = await this.updateUserUseCase.execute(req.params.id, req.body);
            res.status(200).json({ message: `Actualizado.`, user: updatedUser });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const deleted = await this.userRepository.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado.' });
            res.status(200).json({ message: 'Usuario eliminado.' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar.' });
        }
    }

    // --- 4. UTILIDADES (Perfil, Saldo) ---
    async getProfile(req, res) {
        const u = await this.userRepository.findById(req.user.id);
        u ? res.json(u) : res.status(404).json({error: 'No encontrado'});
    }

    async getBalance(req, res) { 
        const u = await this.userRepository.findById(req.user.id); 
        res.json({saldo: u ? u.saldo : 0}); 
    }

    async rechargeBalance(req, res) {
        const t = await this.userRepository.sequelize.transaction(); 
        try {
            const { amount } = req.body;
            const amountFloat = parseFloat(amount);
            if (isNaN(amountFloat) || amountFloat <= 0) {
                await t.rollback();
                return res.status(400).json({ error: "Monto inválido" });
            }

            const user = await this.userRepository.findById(req.user.id);
            if (!user) {
                await t.rollback();
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const newBalance = parseFloat(user.saldo || 0) + amountFloat;
            user.saldo = newBalance;
            await user.save({ transaction: t });

            if (this.TransactionModel) {
                await this.TransactionModel.create({
                    userId: user.id,
                    amount: amountFloat,
                    type: 'TOPUP',
                    description: 'Recarga de saldo'
                }, { transaction: t });
            }

            await t.commit();
            res.json({ message: "Recarga exitosa", saldo: newBalance });
        } catch (error) {
            await t.rollback();
            res.status(500).json({ error: error.message });
        }
    }
    
    // --- 5. ALERGIAS (CORREGIDO) ---
    async getMyAllergies(req, res) {
        try {
            // Obtenemos el usuario completo o el campo específico
            // NOTA: Asumimos que repository devuelve el objeto User de Sequelize
            const user = await this.userRepository.findById(req.user.id);
            
            if (!user) return res.json([]); 

            let allergiesData = user.allergies;

            // FIX: Si viene como string de la DB (TEXT), lo parseamos a JSON
            if (typeof allergiesData === 'string') {
                try {
                    allergiesData = JSON.parse(allergiesData);
                } catch (e) {
                    console.error("Error parseando alergias:", e);
                    allergiesData = [];
                }
            }
            
            // Garantizamos devolver un array
            res.json(Array.isArray(allergiesData) ? allergiesData : []); 
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener alergias' });
        }
    }

    async updateMyAllergies(req, res) {
        try {
            const { allergies } = req.body; 
            
            console.log(`🤧 [AUTH] Recibido update de alergias para User ${req.user.id}:`, allergies);

            if (!Array.isArray(allergies)) {
                console.error("❌ [AUTH] Error: 'allergies' no es un array:", allergies);
                return res.status(400).json({ error: "Se requiere un array de nombres" });
            }
            
            // --- CORRECCIÓN: NO HACEMOS STRINGIFY AQUÍ ---
            // Pasamos el array puro. El repositorio (SQLiteUserRepository) ya hace el JSON.stringify internamente.
            await this.userRepository.updateAllergies(req.user.id, allergies); 
            // ---------------------------------------------

            console.log("✅ [AUTH] Alergias guardadas correctamente en DB.");
            res.json({ message: "Alergias guardadas", allergies });
        } catch (error) {
            console.error("🔥 [AUTH] Error guardando alergias:", error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;