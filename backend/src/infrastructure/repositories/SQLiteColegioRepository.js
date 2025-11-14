// src/infrastructure/repositories/SQLiteColegioRepository.js
const ColegioRepository = require('../../domain/repositories/ColegioRepository');
const { get, run } = require('./dbUtils');

class SQLiteColegioRepository extends ColegioRepository {
    constructor(db) {
        super();
        this.db = db;
    }

    async findById(id) {
        const stmt = `SELECT id, nombre, direccion, telefono, ciudad, provincia FROM colegios WHERE id = ?`;
        const row = await get(this.db, stmt, [id]);
        return row;
    }

    async update(id, data) {
        const { nombre, direccion, telefono, ciudad, provincia } = data;
        
        const stmt = `
            UPDATE colegios 
            SET 
                nombre = ?, 
                direccion = ?, 
                telefono = ?, 
                ciudad = ?, 
                provincia = ?, 
                updatedAt = DATETIME("now")
            WHERE id = ?
        `;
        
        await run(this.db, stmt, [nombre, direccion, telefono, ciudad, provincia, id]);
        
        return this.findById(id);
    }
}

module.exports = SQLiteColegioRepository;