// services/catalog-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// --- SERVIR IMÁGENES (Vital para el Frontend) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- BASE DE DATOS PROPIA ---
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './catalog_database.sqlite', // DB aislada
    logging: false
});

// --- IMPORTAR TUS MODELOS (Los copiaremos en el paso 3) ---
const ProductDef = require('./src/models/ProductModel');
const ColegioDef = require('./src/models/ColegioModel');
// const IngredientDef = require('./src/models/IngredientModel'); // Descomenta si lo usas

// Inicializar
const Product = ProductDef(sequelize, DataTypes);
const Colegio = ColegioDef(sequelize, DataTypes);

// Relaciones
Colegio.hasMany(Product, { foreignKey: 'colegioId' });
Product.belongsTo(Colegio, { foreignKey: 'colegioId' });

// --- RUTAS ---
const productRoutes = require('./src/routes/product.routes');
const colegioRoutes = require('./src/routes/colegio.routes');

// Inyección de Dependencias
app.use('/api/products', productRoutes(Product));
app.use('/api/colegio', colegioRoutes(Colegio));

// --- ARRANQUE ---
sequelize.sync({ force: false }).then(() => {
    console.log('✅ Catalog DB Sincronizada');
    app.listen(PORT, () => {
        console.log(`🥦 Catalog Service corriendo en puerto ${PORT}`);
    });
});