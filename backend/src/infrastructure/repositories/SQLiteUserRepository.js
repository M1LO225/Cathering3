
const UserRepository = require('../../domain/repositories/UserRepository');
const User = require('../../domain/entities/User');

const { run, get, all } = require('./dbUtils'); 

class SQLiteUserRepository extends UserRepository {
    constructor(db) {
        super();
        this.db = db;
    }



    async findById(id) {
        const row = await get(this.db, 'SELECT id, username, passwordHash, email FROM users WHERE id = ?', [id]);
        if (!row) return null;
        return new User(row.id, row.username, row.passwordHash, row.email);
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
                'INSERT INTO users (username, passwordHash, email, createdAt) VALUES (?, ?, ?, DATETIME("now"))',
                [user.username, user.passwordHash, user.email],
                function (err) {
                    if (err) return reject(err);
                    user.id = this.lastID;
                    resolve(user);
                }
            );
        });
    }
    

    async findAll() {
        const stmt = `SELECT id, username, email, createdAt FROM users ORDER BY id DESC`;
        return all(this.db, stmt);
    }


    async delete(id) {
        const stmt = `DELETE FROM users WHERE id = ?`;
        await run(this.db, stmt, [id]);
        return true;
    }

    async update(id, username, email, passwordHash) {
        let updates = [];
        let params = [];
        
        if (username) { updates.push('username = ?'); params.push(username); }
        if (email) { updates.push('email = ?'); params.push(email); }
        if (passwordHash) { updates.push('passwordHash = ?'); params.push(passwordHash); }
        
        if (updates.length === 0) { return null; }

        const stmt = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        params.push(id);
        
        await run(this.db, stmt, params);

        return this.findById(id); 
    }
}

module.exports = SQLiteUserRepository;