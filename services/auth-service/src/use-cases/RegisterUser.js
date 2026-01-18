// services/auth-service/src/use-cases/RegisterUser.js

class RegisterUser {
    constructor(userRepository, encryptService) {
        this.userRepository = userRepository;
        this.encryptService = encryptService;
    }

    async execute(userData, colegioData) {
        const ROLES_VALIDOS = ['estudiante', 'cafeteria', 'personal_academico', 'admin'];

        // 1. Validar existencia
        const existingUser = await this.userRepository.findByUsernameOrEmail(userData.username, userData.email);
        if (existingUser) {
            throw new Error('El nombre de usuario o correo ya existe.');
        }

        // 2. Encriptar
        const hashedPassword = await this.encryptService.hash(userData.password);

        // 3. Preparar objeto para la base de datos
        // ⚠️ CAMBIO IMPORTANTE: Usamos 'passwordHash' porque así se llama en tu UserModel
        const userEntity = {
            username: userData.username,
            email: userData.email,
            passwordHash: hashedPassword, // <--- AQUÍ ESTABA EL DETALLE
            role: userData.role || 'user',
            saldo: 0
        };

        // --- LÓGICA DE NEGOCIO ---

        // CASO A: Registro de Colegio (Admin)
        if (colegioData && Object.keys(colegioData).length > 0) {
            userEntity.role = 'admin';
            // Llamamos al método que acabamos de poner en el repositorio
            return await this.userRepository.createColegioWithAdmin(userEntity, colegioData);
        }

        // CASO B: Usuarios normales
        // Validamos el rol
        if (!ROLES_VALIDOS.includes(userEntity.role)) {
             // Si no tiene rol y no envió datos de colegio, es un error
            throw new Error('Datos inválidos o rol no permitido.');
        }

        return await this.userRepository.save(userEntity);
    }
}

module.exports = RegisterUser;