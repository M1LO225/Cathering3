// services/auth-service/src/use-cases/LoginUser.js

class LoginUser {
    constructor(userRepository, tokenService, encryptService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.encryptService = encryptService;
    }

    async execute(usernameOrEmail, password) {
        // 1. Buscar al usuario por username o email
        let userEntity = await this.userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if (!userEntity) {
            throw new Error('Credenciales inválidas.');
        }

        // 2. Validar la contraseña
        // ⚠️ CORRECCIÓN AQUÍ: Usamos .passwordHash (como está en tu Modelo Legacy)
        const isValid = await this.encryptService.compare(password, userEntity.passwordHash);

        if (!isValid) {
            throw new Error('Credenciales inválidas.');
        }

        // 3. Preparar datos para el token
        // Aseguramos que los datos críticos estén en el payload
        const payload = {
            id: userEntity.id,
            username: userEntity.username,
            role: userEntity.role,
            colegio_id: userEntity.colegio_id // Importante para el admin
        };

        // 4. Generar el token
        const token = this.tokenService.generate(payload);

        // 5. Devolver usuario limpio (sin el hash)
        const userJson = userEntity.toJSON();
        delete userJson.passwordHash; 

        return { user: userJson, token };
    }
}

module.exports = LoginUser;