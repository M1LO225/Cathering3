// src/application/use-cases/GetAllUsers.js

class GetAllUsers {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Obtiene la lista de todos los usuarios desde el repositorio.
     */
    async execute() {
        try {
            // Llama al repositorio para obtener todos los usuarios
            const users = await this.userRepository.findAll();
            return users;
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            throw new Error('Error interno al obtener usuarios.');
        }
    }
}

module.exports = GetAllUsers;