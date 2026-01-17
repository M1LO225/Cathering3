// src/application/use-cases/LoginUser.js
const EncryptService = require('../services/EncryptService');
const TokenService = require('../services/TokenService');

class LoginUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(usernameOrEmail, password) {
        // 1. Buscar al usuario por username o email (para verificar el hash)
        let userEntity = await this.userRepository.findByUsername(usernameOrEmail);
        if (!userEntity) {
            userEntity = await this.userRepository.findByEmail(usernameOrEmail);
        }

        if (!userEntity) {
            throw new Error('Invalid credentials.');
        }

        // 2. Validar la contraseña
        const isValid = await EncryptService.comparePassword(password, userEntity.passwordHash);

        if (!isValid) {
            throw new Error('Invalid credentials.');
        }

        // 3. (MODIFICACIÓN CRÍTICA) Obtener el perfil COMPLETO para el token
        // Usamos findById porque sabemos que devuelve el objeto plano con 'role' y 'colegio_id'
        const userProfile = await this.userRepository.findById(userEntity.id);
        
        if (!userProfile) {
            throw new Error('User profile not found after login.');
        }

        // 4. Generar el token con el perfil completo (esto llama al TokenService actualizado)
        const token = TokenService.generateToken(userProfile);

        // 5. Devolver solo los datos seguros del perfil
        const { passwordHash, ...safeUser } = userProfile;

        return { user: safeUser, token };
    }
}

module.exports = LoginUser;