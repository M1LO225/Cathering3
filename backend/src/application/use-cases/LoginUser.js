// src/application/use-cases/LoginUser.js
const EncryptService = require('../services/EncryptService');
const TokenService = require('../services/TokenService');

class LoginUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(usernameOrEmail, password) {
        let user = await this.userRepository.findByUsername(usernameOrEmail);
        if (!user) {
            user = await this.userRepository.findByEmail(usernameOrEmail);
        }

        if (!user) {
            throw new Error('Invalid credentials.');
        }

        const isValid = await EncryptService.comparePassword(password, user.passwordHash);

        if (!isValid) {
            throw new Error('Invalid credentials.');
        }

        const token = TokenService.generateToken(user.id);

        return { user, token };
    }
}

module.exports = LoginUser;