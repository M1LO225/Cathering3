require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// DB
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './orders_database.sqlite',
    logging: false
});

// MODELOS
const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    colegioId: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const OrderItem = sequelize.define('OrderItem', {
    productName: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false }
});

// Relaciones
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'OrderId' }); 
OrderItem.belongsTo(Order, { foreignKey: 'OrderId' });

// Middleware de Auth (Copia el de Catalog a src/middlewares/AuthMiddleware.js)
// Si no tienes el archivo, créalo igual que en Catalog Service.
const AuthMiddleware = require('./src/middlewares/AuthMiddleware');

// Controlador
const OrderController = require('./src/controllers/OrderController');
const controller = new OrderController(Order, OrderItem);

// RUTAS
const router = express.Router();
router.post('/', AuthMiddleware, controller.createOrder.bind(controller));
router.get('/incoming', AuthMiddleware, controller.getIncomingOrders.bind(controller));
router.put('/:id/status', AuthMiddleware, controller.updateStatus.bind(controller));

app.use('/', router); 

sequelize.sync().then(() => {
    console.log('Order DB Sincronizada');
    app.listen(PORT, () => {
        console.log(`Order Service corriendo en puerto ${PORT}`);
    });
});