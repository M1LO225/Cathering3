require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

// --- BASE DE DATOS CONFIGURADA PARA AWS ---
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
    process.env.DB_NAME || 'catalog_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || null,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: isProduction ? 'postgres' : 'sqlite',
        storage: isProduction ? null : './catalog_database.sqlite',
        logging: console.log, // Log activo para debug
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
    }
);

// Importar Modelos (Asegúrate que estas rutas existan en tu carpeta)
const ProductDef = require('./src/models/ProductModel');
const ColegioDef = require('./src/models/ColegioModel');
const IngredientDef = require('./src/models/IngredientModel');

const Product = ProductDef(sequelize, DataTypes);
const Colegio = ColegioDef(sequelize, DataTypes);
const Ingredient = IngredientDef(sequelize, DataTypes);

// Relaciones
Colegio.hasMany(Product, { foreignKey: 'colegioId' });
Product.belongsTo(Colegio, { foreignKey: 'colegioId' });

// Sincronización DB
sequelize.sync().then(() => {
    console.log("DB Catalog Sincronizada");
}).catch(err => console.error("Error DB Catalog:", err));

// Rutas
const productRoutes = require('./src/routes/product.routes');
// Inyección de modelos
app.use('/', productRoutes(Product, Colegio, Ingredient));

app.listen(PORT, () => {
    console.log(`Catalog Service corriendo en puerto ${PORT}`);
});