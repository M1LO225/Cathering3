class LoginUser {
    constructor(userRepository, tokenService, encryptService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.encryptService = encryptService;
    }

    async execute(usernameOrEmail, password) {
        const user = await this.userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
        if (!user) throw new Error('Credenciales inválidas');

        const isMatch = await this.encryptService.compare(password, user.password);
        if (!isMatch) throw new Error('Credenciales inválidas');

        const token = this.tokenService.generateToken({ 
            userId: user.id, 
            role: user.role,
            email: user.email 
        });

        return { token, user };
    }
}
module.exports = LoginUser;