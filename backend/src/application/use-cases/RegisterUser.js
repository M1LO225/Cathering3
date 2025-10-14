
const User = require('../../domain/entities/User');
const EncryptService = require('../services/EncryptService');

class RegisterUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(username, email, password) {
        if (await this.userRepository.findByUsername(username)) {
            throw new Error('Username already exists.');
        }
        if (await this.userRepository.findByEmail(email)) {
            throw new Error('Email already exists.');
        }

        const passwordHash = await EncryptService.hashPassword(password);

        const newUser = new User(null, username, passwordHash, email);
        return this.userRepository.save(newUser);
    }
}

module.exports = RegisterUser;