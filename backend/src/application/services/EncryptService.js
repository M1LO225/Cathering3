// src/application/services/EncryptService.js
const bcrypt = require('bcrypt');
const saltRounds = 10;

class EncryptService {
    static async hashPassword(password) {
        return bcrypt.hash(password, saltRounds);
    }

    static async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
}

module.exports = EncryptService;