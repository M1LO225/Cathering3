class RegisterUser {
    constructor(userRepository, encryptService) {
        this.userRepository = userRepository;
        this.encryptService = encryptService;
    }

    async execute(userData, colegioData) {
        const existing = await this.userRepository.findByUsernameOrEmail(userData.username, userData.email);
        if (existing) throw new Error('El usuario o email ya existe.');

        const hashedPassword = await this.encryptService.encrypt(userData.password);

        // Guardamos el usuario. La data del colegio la gestionará el frontend 
        // llamando después al servicio de Eduardo si es necesario.
        return await this.userRepository.save({
            ...userData,
            password: hashedPassword,
            role: 'admin_colegio' // Rol por defecto según tu lógica anterior
        });
    }
}
module.exports = RegisterUser;