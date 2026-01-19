// services/auth-service/src/controllers/UserController.js

class UserController {
    constructor(userRepository, encryptService, updateUserUseCase) {
        this.userRepository = userRepository;
        this.encryptService = encryptService;
        this.updateUserUseCase = updateUserUseCase;
    }

    // --- 1. CREAR USUARIO (Lógica Admin Colegio) ---
    async createUserByAdmin(req, res, roleToCreate) {
        const { username, email, password } = req.body;
        
        try {
            // El admin que hace la petición
            const adminId = req.user.id; 
            const adminUser = await this.userRepository.findById(adminId);

            // Validación: El creador debe tener colegio
            if (!adminUser || !adminUser.colegio_id) {
                return res.status(403).json({ error: 'No tienes un colegio asociado para realizar esta acción.' });
            }

            const colegioId = adminUser.colegio_id;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Faltan datos requeridos (username, email, password).' });
            }

            // Validación: Unicidad de Cafetería
            if (roleToCreate === 'cafeteria') {
                const existingCafeteria = await this.userRepository.findOneByRoleAndColegio('cafeteria', colegioId);
                if (existingCafeteria) {
                    return res.status(400).json({ 
                        error: 'Acción denegada: Este colegio ya tiene una Cafetería registrada.' 
                    });
                }
            }

            // Validación: Existencia de usuario
            const existingUser = await this.userRepository.findByUsernameOrEmail(username, email);
            if (existingUser) {
                return res.status(409).json({ error: 'El usuario o correo ya existe.' });
            }

            // Creación
            const passwordHash = await this.encryptService.hash(password);
            
            const newUser = { 
                username, 
                email, 
                passwordHash: passwordHash, 
                role: roleToCreate, 
                colegio_id: colegioId,
                saldo: 0
            };
            
            const createdUser = await this.userRepository.save(newUser);
            
            // Respuesta limpia
            const userJson = createdUser.toJSON();
            delete userJson.password;

            res.status(201).json({ 
                message: `${roleToCreate} creado exitosamente.`,
                user: userJson 
            });

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getColegio(req, res) {
        try {
            const userId = req.user.id; // Obtenido del token
            const colegio = await this.userRepository.findColegioByAdminId(userId);

            if (!colegio) {
                return res.status(404).json({ error: 'No se encontró un colegio asociado a este usuario.' });
            }

            res.json(colegio);
        } catch (error) {
            console.error('Error al obtener colegio:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }
    async updateColegio(req, res) {
        try {
            const adminId = req.user.id;
            const updates = req.body;
            
            // Llamamos al repositorio
            const updatedColegio = await this.userRepository.updateColegio(adminId, updates);
            
            if (!updatedColegio) {
                return res.status(404).json({ error: 'No se pudo actualizar el colegio.' });
            }

            res.status(200).json({ 
                message: 'Colegio actualizado correctamente.', 
                colegio: updatedColegio 
            });

        } catch (error) {
            console.error('Error updating colegio:', error);
            res.status(500).json({ error: 'Error al actualizar el colegio.' });
        }
    }

    // --- 2. LISTAR USUARIOS (Del mismo colegio) ---
    async listUsers(req, res) {
        try {
            const adminUser = await this.userRepository.findById(req.user.id);
            if(!adminUser || !adminUser.colegio_id){
                return res.status(400).json({ error: 'No perteneces a un colegio.' });
            }
            const users = await this.userRepository.findAllByColegio(adminUser.colegio_id);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Error al listar usuarios.' });
        }
    }

    // --- 3. ACTUALIZAR USUARIO (Nuevo) ---
    async update(req, res) {
        const { id } = req.params;
        const updates = req.body;
        try {
            const updatedUser = await this.updateUserUseCase.execute(id, updates);
            
            res.status(200).json({ 
                message: `Usuario actualizado correctamente.`, 
                user: updatedUser 
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // --- 4. ELIMINAR USUARIO ---
    async delete(req, res) {
        const { id } = req.params;
        try {
            const deleted = await this.userRepository.delete(id);
            if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado.' });
            res.status(200).json({ message: 'Usuario eliminado.' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar usuario.' });
        }
    }

    // --- UTILIDADES (Perfil, Alergias, Saldo) ---
    async getProfile(req, res) {
        const u = await this.userRepository.findById(req.user.id);
        u ? res.json(u) : res.status(404).json({error: 'No encontrado'});
    }
    async getMyAllergies(req, res) { res.json(await this.userRepository.getUserAllergies(req.user.id)); }
    async updateMyAllergies(req, res) { await this.userRepository.updateAllergies(req.user.id, req.body.ingredientIds); res.json({msg: "OK"}); }
    async getBalance(req, res) { const u = await this.userRepository.findById(req.user.id); res.json({saldo: u ? u.saldo : 0}); }
    async rechargeBalance(req, res) {
        // Iniciar transacción SQL para consistencia
        const t = await this.userRepository.sequelize.transaction(); 
        try {
            const userId = req.user.id;
            const { amount } = req.body;

            if (!amount || amount <= 0) return res.status(400).json({ error: "Monto inválido" });

            const user = await this.userRepository.findById(userId);
            if (!user) {
                await t.rollback();
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const newBalance = parseFloat(user.saldo || 0) + parseFloat(amount);
            
            // 1. Actualizar saldo
            await user.update({ saldo: newBalance }, { transaction: t });
            
            await Transaction.create({
                userId: user.id,
                amount: amount,
                type: 'TOPUP',
                description: 'Recarga de saldo'
            }, { transaction: t });
            

            await t.commit();
            res.json({ message: "Recarga exitosa", saldo: newBalance });

        } catch (error) {
            await t.rollback();
            console.error(error);
            res.status(500).json({ error: "Error en recarga" });
        }
    }
    async getAllergies(req, res) {
        try {
            const user = await this.userRepository.findById(req.user.id);
            // Convertimos el texto JSON a array real
            const allergiesList = user.allergies ? JSON.parse(user.allergies) : [];
            res.json(allergiesList);
        } catch (e) {
            res.status(500).json({ error: "Error al obtener alergias" });
        }
    }
    async updateAllergies(req, res) {
        try {
            const userId = req.user.id;
            const { allergies } = req.body; // Espera array ['Maní', 'Gluten']

            if (!Array.isArray(allergies)) return res.status(400).json({ error: "Formato inválido" });

            const user = await this.userRepository.findById(userId);
            
            // Guardamos como texto
            await user.update({ allergies: JSON.stringify(allergies) });
            
            res.json({ message: "Alergias actualizadas", allergies });
        } catch (e) {
            res.status(500).json({ error: "Error al guardar alergias" });
        }
    }
}


module.exports = UserController;