// Ruta: backend/src/infrastructure/routes/user.routes.js

const express = require('express');

/**
 * Define las rutas protegidas para la gestión de usuarios (CRUD).
 */
const UserRoutes = (useCases, AuthMiddleware) => {
    const router = express.Router();
    // 🚨 Agregamos registerUser al destructurado para CREAR usuarios
    const { getAllUsers, updateUser, deleteUser, registerUser } = useCases; 

    // --- Controlador de Usuarios ---
    class UserController {
        
        // CREATE (POST /)
        async create(req, res) {
            const { username, email, password } = req.body;
            try {
                // En producción, aquí verificaríamos que req.userId tenga rol de Administrador.
                
                // Reutilizamos el Caso de Uso RegisterUser existente
                const newUser = await registerUser.execute(username, email, password);
                
                // Filtramos el passwordHash antes de responder
                const { passwordHash, ...safeUser } = newUser;

                res.status(201).json({ 
                    message: "User created successfully by CRUD interface.",
                    user: safeUser 
                });
            } catch (error) {
                console.error('Error creating user:', error);
                res.status(400).json({ error: error.message || 'Error al crear usuario.' });
            }
        }
        
        // READ (GET /)
        async listUsers(req, res) {
            // ... (código existente)
            try {
                const users = await getAllUsers.execute();
                res.status(200).json(users);
            } catch (error) {
                console.error('Error listing users:', error);
                res.status(500).json({ error: error.message || 'Error al listar usuarios.' });
            }
        }
        
        // UPDATE (PUT /:id)
        async update(req, res) {
            // ... (código existente)
            const { id } = req.params; 
            const updates = req.body; 
            
            try {
                const updatedUser = await updateUser.execute(parseInt(id), updates);
                
                res.status(200).json({ 
                    message: `User ${id} updated successfully.`, 
                    user: updatedUser 
                });
            } catch (error) {
                console.error(`Error updating user ${id}:`, error);
                if (error.message.includes('not found')) {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message || 'Error al actualizar usuario.' });
            }
        }
        
        // DELETE (DELETE /:id)
        async delete(req, res) {
            // ... (código existente)
            const { id } = req.params;
            
            try {
                if (parseInt(id) === req.userId) {
                    return res.status(403).json({ error: 'No puedes eliminar tu propia cuenta activa.' });
                }
                
                await deleteUser.execute(parseInt(id));
                res.status(200).json({ message: `User ${id} deleted successfully.` });
            } catch (error) {
                console.error(`Error deleting user ${id}:`, error);
                if (error.message.includes('not found')) {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message || 'Error al eliminar usuario.' });
            }
        }
    }

    const controller = new UserController();

    // Rutas (Todas protegidas por AuthMiddleware)
    router.post('/', AuthMiddleware, controller.create);       // 🚨 RUTA CREATE
    router.get('/', AuthMiddleware, controller.listUsers); 
    router.put('/:id', AuthMiddleware, controller.update);     
    router.delete('/:id', AuthMiddleware, controller.delete);  

    return router;
};

module.exports = UserRoutes;