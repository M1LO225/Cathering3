const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.NODE_ENV === 'production') {

    sequelize = new Sequelize(process.env.DB_URL, {
        dialect: 'postgres',
        protocol:'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    const dbPath = path.resolve(__dirname, '..', '..', '..', 'data', 'auth.sqlite');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: false,
        retry: {
            match: [/SQLITE_BUSY/], // Si ve este error
            name: 'query',
            max: 5 // Intenta 5 veces antes de fallar
        },
        pool: {
            max: 1, // Forzar a usar solo una conexión a la vez para evitar bloqueos
            min: 0,
            idle: 10000
        }
    });
}

module.exports = sequelize;