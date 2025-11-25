const express = require('express');
const EncryptService = require('../../application/services/EncryptService'); 
const isColegioAdmin = require('../middlewares/isColegioAdmin'); 

const UserRoutes = (useCases, AuthMiddleware) => {
    const router = express.Router();
    const { getAllUsers, updateUser, deleteUser, userRepository } = useCases; 


    class UserController {
        async createUserByAdmin(req, res, roleToCreate) {
            const { username, email, password } = req.body;
            
            const adminUser = req.user;
            const colegioId = adminUser.colegio_id;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email y password son requeridos.' });
            }

            try {
                // Verificar unicidad de la Cafetería
                if (roleToCreate === 'CAFETERIA') {
                    const existingCafeteria = await userRepository.findOneByRoleAndColegio('CAFETERIA', colegioId);
                    
                    if (existingCafeteria) {
                        return res.status(400).json({ 
                            error: 'Acción denegada: Este colegio ya tiene una Cafetería registrada. Solo se permite una.' 
                        });
                    }
                }

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
                    return res.status(409).json({ error: 'El nombre de usuario o email ya existe.' });
                }
                console.error('Error creating user:', error);
                res.status(400).json({ error: error.message || 'Error al crear usuario.' });
            }
        }
   
        async listUsers(req, res) {
            try {
                    const colegioId = req.user.colegio_id;
                    if(!colegioId){
                        return res.status(400).json({ error: 'Usuario no pertenece a ningun colegio' });
                    }
                    const users = await getAllUsers.execute(colegioId);
                res.status(200).json(users);
            } catch (error) {
                console.error('Error getting users:', error);
                res.status(500).json({ error: 'Error interno al obtener usuarios.' });
                }
        }
        

        async update(req, res) {
            const { id } = req.params; 
            const updates = req.body; 
            try {
   
                const updatedUser = await updateUser.execute(parseInt(id), updates);
                res.status(200).json({ 
                    message: `User ${id} updated successfully.`, 
                    user: updatedUser 
                });
            } catch (error) {
                console.error('Error updating users:', error);
            }
_     }
        
   
        async delete(req, res) {
            const { id } = req.params;
            try {
   
                await deleteUser.execute(parseInt(id));
                res.status(200).json({ message: `User ${id} deleted successfully.` });
            } catch (error) {
                console.error('Error deleting users:', error);
            }
        }
    }

    const controller = new UserController();


    router.use(AuthMiddleware);


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

    // Rutas de Gestión del Admin (Solo Admin puede acceder)
    router.post('/cafeteria', isColegioAdmin, (req, res) => controller.createUserByAdmin(req, res, 'CAFETERIA'));
    router.post('/estudiante', isColegioAdmin, (req, res) => controller.createUserByAdmin(req, res, 'ESTUDIANTE'));
    
    //Crear Personal Académico
    router.post('/personal', isColegioAdmin, (req, res) => controller.createUserByAdmin(req, res, 'PERSONAL_ACADEMICO'));


    return router;
};

module.exports = UserRoutes;