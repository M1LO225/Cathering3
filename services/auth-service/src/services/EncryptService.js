const bcrypt = require('bcryptjs');
const saltRounds = 10;

class EncryptService {
    async encrypt(password) {
        return bcrypt.hash(password, saltRounds);
    }


    async compare(password, hash) {
        return bcrypt.compare(password, hash);
    }
}

module.exports = EncryptService;