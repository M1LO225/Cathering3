// services/auth-service/src/services/EncryptService.js
const bcrypt = require('bcryptjs');

class EncryptService {
    constructor() {
        this.saltRounds = 10;
    }

    async hash(password) {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async compare(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = EncryptService;