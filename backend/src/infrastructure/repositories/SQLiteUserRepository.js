// src/infrastructure/repositories/SQLiteUserRepository.js

const UserRepository = require('../../domain/repositories/UserRepository');
const User = require('../../domain/entities/User');
const { run, get, all } = require('./dbUtils'); 

class SQLiteUserRepository extends UserRepository {
    constructor(db) {
        super();
        this.db = db;
    }

    /**
     * Busca un usuario por ID y devuelve todos los datos (incluyendo rol y colegio)
     * Usado por AuthMiddleware para obtener el perfil completo.
     */
    async findById(id) {
        const stmt = `
            SELECT id, username, passwordHash, email, role, colegio_id 
            FROM users 
            WHERE id = ?
        `;
        const row = await get(this.db, stmt, [id]);
        
        // Devuelve el objeto plano, no la entidad User, 
        // ya que la entidad no tiene 'role' o 'colegio_id'
        return row; 
    }
    
    /**
     * Busca un usuario por username (usado para Login)
     */
    async findByUsername(username) {
        const row = await get(this.db, 'SELECT * FROM users WHERE username = ?', [username]);
        if (!row) return null;
        return new User(row.id, row.username, row.passwordHash, row.email);
    }

    /**
     * Busca un usuario por email (usado para Login)
     */
    async findByEmail(email) {
        const row = await get(this.db, 'SELECT * FROM users WHERE email = ?', [email]);
        if (!row) return null;
        return new User(row.id, row.username, row.passwordHash, row.email);
    }

    /**
     * Método de guardado simple (ya no se usa para registro principal)
     */
    async save(user) {
        const stmt = 'INSERT INTO users (username, passwordHash, email, createdAt) VALUES (?, ?, ?, DATETIME("now"))';
        const { lastID } = await run(this.db, stmt, [user.username, user.passwordHash, user.email]);
        user.id = lastID;
        return user;
    }
    
    /**
     * (NUEVO) Crea un Colegio y un Usuario Admin en una transacción.
     * Usado por RegisterUser.
     */
    async createColegioAdmin(user, colegioData) {
        // 1. Iniciar transacción
        await run(this.db, 'BEGIN TRANSACTION');

        try {
            // 2. Crear el Colegio
            const { nombre, direccion, telefono, ciudad, provincia } = colegioData;
            const colegioStmt = `
                INSERT INTO colegios (nombre, direccion, telefono, ciudad, provincia, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, DATETIME("now"), DATETIME("now"))
            `;
            const { lastID: colegioId } = await run(this.db, colegioStmt, [nombre, direccion, telefono, ciudad, provincia]);

            // 3. Crear el Usuario (asignando rol y colegio_id)
            const userStmt = `
                INSERT INTO users (username, passwordHash, email, role, colegio_id, createdAt, updatedAt) 
                VALUES (?, ?, ?, 'COLEGIO_ADMIN', ?, DATETIME("now"), DATETIME("now"))
            `;
            const { lastID: userId } = await run(this.db, userStmt, [user.username, user.passwordHash, user.email, colegioId]);

            // 4. Confirmar transacción
            await run(this.db, 'COMMIT');
            
            user.id = userId;
            user.colegio_id = colegioId; // Devolvemos el ID del colegio
            return user;

        } catch (err) {
            // 5. Revertir si algo falla
            await run(this.db, 'ROLLBACK');
            console.error('Error en transacción createColegioAdmin:', err);
            
            if (err.message.includes('UNIQUE constraint')) {
                 throw new Error('El username o email ya existe.');
            }
            throw new Error('Error al registrar el colegio y admin.');
        }
    }

    /**
     * (NUEVO) Método para que un Admin cree un usuario (Cafeteria o Estudiante)
     * Usado por user.routes.js
     */
    async saveWithRole(user) { // user = { username, passwordHash, email, role, colegio_id }
        const stmt = `
            INSERT INTO users (username, passwordHash, email, role, colegio_id, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, DATETIME("now"), DATETIME("now"))
        `;
        const { lastID } = await run(this.db, stmt, [
            user.username, 
            user.passwordHash, 
            user.email, 
            user.role, 
            user.colegio_id
        ]);
        user.id = lastID;
        return user;
    }

    /**
     * Obtiene todos los usuarios
     */
    async findAll() {
        // Actualizado para incluir role y colegio_id
        const stmt = `
            SELECT id, username, email, role, colegio_id, createdAt 
            FROM users 
            ORDER BY id DESC
        `;
        return all(this.db, stmt);
    }


    /**
     * Elimina un usuario por ID
     */
    async delete(id) {
        const stmt = `DELETE FROM users WHERE id = ?`;
        await run(this.db, stmt, [id]);
        return true;
    }

    /**
     * Actualiza un usuario (usado por el CRUD básico)
     */
    async update(id, username, email, passwordHash) {
        let updates = [];
        let params = [];
        
        if (username) { updates.push('username = ?'); params.push(username); }
        if (email) { updates.push('email = ?'); params.push(email); }
        if (passwordHash) { updates.push('passwordHash = ?'); params.push(passwordHash); }
        
        if (updates.length === 0) { 
            // Si no hay nada que actualizar, igual devuelve el usuario
            return this.findById(id);
        }

        // Añadir siempre la actualización de 'updatedAt'
        updates.push('updatedAt = DATETIME("now")');

        const stmt = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        params.push(id);
        
        await run(this.db, stmt, params);

        // Devuelve el usuario actualizado (con todos los campos, usando el findById modificado)
        return this.findById(id); 
    }
}

module.exports = SQLiteUserRepository;