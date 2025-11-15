const express = require('express');
const EncryptService = require('../../application/services/EncryptService'); // Necesario para hashear
const isColegioAdmin = require('../middlewares/isColegioAdmin'); // Importar el middleware de rol

const UserRoutes = (useCases, AuthMiddleware) => {
    const router = express.Router();
    const { getAllUsers, updateUser, deleteUser, userRepository } = useCases; 

    // --- Controlador de Usuarios ---
    class UserController {
        
        /**
         * (Admin) Crea un nuevo usuario (Cafeteria o Estudiante)
         */
        async createUserByAdmin(req, res, roleToCreate) {
            const { username, email, password } = req.body;
            
            // Obtenemos el colegio_id del token del admin, no del body.
            const adminUser = req.user;
            const colegioId = adminUser.colegio_id;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email y password son requeridos.' });
            }

            try {
                const passwordHash = await EncryptService.hashPassword(password);
                const newUser = { username, email, passwordHash, role: roleToCreate, colegio_id: colegioId };
                
                const createdUser = await userRepository.saveWithRole(newUser);
                const { passwordHash: _, ...safeUser } = createdUser;

                res.status(201).json({ 
                    message: `${roleToCreate} creado exitosamente.`,
                    user: safeUser 
                });
            } catch (error) {
                if (error.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Username o email ya existe.' });
                }
                console.error('Error creating user:', error);
                res.status(400).json({ error: error.message || 'Error al crear usuario.' });
            }
        }
        
        // READ (GET /)
        async listUsers(req, res) {
            try {
                // TODO: Filtrar para que solo muestre usuarios de req.user.colegio_id
                const users = await getAllUsers.execute();
                res.status(200).json(users);
            } catch (error) {
                console.error('Error listing users:', error);
                res.status(500).json({ error: error.message || 'Error al listar usuarios.' });
            }
        }
        
        // UPDATE (PUT /:id)
        async update(req, res) {
            const { id } = req.params; 
            const updates = req.body; 
            try {
                // TODO: Validar que el admin solo pueda actualizar usuarios de su colegio
                const updatedUser = await updateUser.execute(parseInt(id), updates);
                res.status(200).json({ 
                    message: `User ${id} updated successfully.`, 
                    user: updatedUser 
                });
            } catch (error) {
                console.error('Error updating users:', error);
            }
_     }
        
        // DELETE (DELETE /:id)
        async delete(req, res) {
            const { id } = req.params;
            try {
                // TODO: Validar que el admin solo pueda borrar usuarios de su colegio
                await deleteUser.execute(parseInt(id));
                res.status(200).json({ message: `User ${id} deleted successfully.` });
            } catch (error) {
                console.error('Error deleting users:', error);
            }
        }
    }

    const controller = new UserController();

    // --- Rutas (Todas protegidas por AuthMiddleware) ---
    router.use(AuthMiddleware);

    // Rutas de Gestión del Admin (Solo Admin puede acceder)
    router.post(
        '/cafeteria', 
        isColegioAdmin, 
        (req, res) => controller.createUserByAdmin(req, res, 'CAFETERIA')
    );
    router.post(
        '/estudiante', 
        isColegioAdmin, 
        (req, res) => controller.createUserByAdmin(req, res, 'ESTUDIANTE')
    );

    // Rutas CRUD existentes (Protegidas por Rol)
    router.get('/', isColegioAdmin, controller.listUsers); 
    router.put('/:id', isColegioAdmin, controller.update);     
    router.delete('/:id', isColegioAdmin, controller.delete);  

    return router;
};

module.exports = UserRoutes;