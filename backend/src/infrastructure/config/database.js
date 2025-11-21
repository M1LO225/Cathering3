const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.NODE_ENV === 'production') {

    sequelize = new Sequelize(process.env.DB_URL, {
        dialect: 'postgres',
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
        logging: false 
    });
}

module.exports = sequelize;