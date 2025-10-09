// Ruta: backend/src/application/use-cases/UpdateUser.js

const bcrypt = require('bcrypt'); // Se asume que bcrypt ya está instalado

class UpdateUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Actualiza los datos de un usuario.
     * @param {number} userId - ID del usuario a actualizar.
     * @param {Object} updates - Objeto con los campos a actualizar ({ username, email, password }).
     */
    async execute(userId, updates) {
        // 1. Verificación de existencia
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        let { username, email, password } = updates;
        let passwordHash = existingUser.passwordHash;

        // 2. Lógica de Negocio: Encriptar la nueva contraseña si se proporciona
        if (password) {
            const saltRounds = 10;
            passwordHash = await bcrypt.hash(password, saltRounds);
        }
        
        // 3. Ejecución de la operación de actualización
        const updatedUser = await this.userRepository.update(
            userId, 
            username, 
            email, 
            passwordHash
        );

        // Devolvemos solo los datos seguros
        return {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email
        };
    }
}

module.exports = UpdateUser;