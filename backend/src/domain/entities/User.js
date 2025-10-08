// src/domain/entities/User.js
class User {
    constructor(id, username, passwordHash, email) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.email = email;
    }
}

module.exports = User;