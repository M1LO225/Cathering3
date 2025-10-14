// src/application/use-cases/GetAllUsers.js

class GetAllUsers {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }


    async execute() {
        try {
 
            const users = await this.userRepository.findAll();
            return users;
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            throw new Error('Error interno al obtener usuarios.');
        }
    }
}

module.exports = GetAllUsers;