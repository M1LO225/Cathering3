// Ruta: backend/src/application/use-cases/DeleteUser.js

class DeleteUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Elimina un usuario.
     * @param {number} userId - ID del usuario a eliminar.
     */
    async execute(userId) {
        // 1. Verificación de existencia (Lógica de negocio)
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        // 2. Ejecución de la operación
        await this.userRepository.delete(userId);
        return true;
    }
}

module.exports = DeleteUser;