const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFilePath = process.env.DB_PATH || 'data/auth.sqlite';

// Ruta relativa desde la carpeta raíz del proyecto (backend)
const dbPath = path.resolve(__dirname, '..', '..', '..', 'data', 'auth.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                passwordHash TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error al crear la tabla users:', err.message);
            } else {
                console.log('Tabla users verificada o creada.');
            }
        });
    }
});

module.exports = db;