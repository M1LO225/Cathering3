// src/infrastructure/repositories/SQLiteUserRepository.js
const UserRepository = require('../../domain/repositories/UserRepository');
const User = require('../../domain/entities/User');

class SQLiteUserRepository extends UserRepository {
    constructor(db) {
        super();
        this.db = db;
    }

    async findByUsername(username) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                
                resolve(new User(row.id, row.username, row.passwordHash, row.email));
            });
        });
    }

    async findByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                
                resolve(new User(row.id, row.username, row.passwordHash, row.email));
            });
        });
    }

    async save(user) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO users (username, passwordHash, email) VALUES (?, ?, ?)',
                [user.username, user.passwordHash, user.email],
                function (err) {
                    if (err) return reject(err);
                    user.id = this.lastID;
                    resolve(user);
                }
            );
        });
    }
}

module.exports = SQLiteUserRepository;