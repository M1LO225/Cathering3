const User = require('../../domain/entities/User');
const EncryptService = require('../services/EncryptService');

class RegisterUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Ejecuta el registro de un Colegio + Admin
        @param {Object} userData - { username, email, password }
        @param {Object} colegioData - { nombre, direccion, telefono, ... }
     */
    async execute(userData, colegioData) {
        // La validación de 'exists' la maneja la DB (UNIQUE constraint)
        
        const passwordHash = await EncryptService.hashPassword(userData.password);
        const newUser = new User(null, userData.username, passwordHash, userData.email);

        // Usamos el método del repositorio que hace la transacción
        return this.userRepository.createColegioAdmin(newUser, colegioData);
    }
}

module.exports = RegisterUser;