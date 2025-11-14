// src/infrastructure/config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '..', '..', '..', 'data', 'auth.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        
        // 1. TABLA 'colegios' (Debe crearse primero por la FK)
        db.run(`
            CREATE TABLE IF NOT EXISTS colegios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                direccion TEXT,
                telefono TEXT, -- Dato sensible
                ciudad TEXT,
                provincia TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error al crear la tabla colegios:', err.message);
            } else {
                console.log('Tabla colegios verificada o creada.');
            }
        });

        // 2. TABLA 'users' (Modificada con Roles y FK)
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                passwordHash TEXT NOT NULL,
                
                -- CAMPOS NUEVOS --
                role TEXT NOT NULL DEFAULT 'ESTUDIANTE',
                colegio_id INTEGER,
                
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (colegio_id) REFERENCES colegios(id) ON DELETE SET NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error al modificar/crear la tabla users:', err.message);
            } else {
                console.log('Tabla users verificada o creada.');
            }
        });
    }
});

module.exports = db;