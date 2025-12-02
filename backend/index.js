require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// 1. Configuración de Infraestructura y DB
const db = require('./src/infrastructure/config/database');
// IMPORTANTE: Cargar las asociaciones antes de sincronizar
require('./src/infrastructure/config/associations');

// --- Repositorios (Sequelize) --- //
const SequelizeUserRepository = require('./src/infrastructure/repositories/SQLiteUserRepository');
const SequelizeColegioRepository = require('./src/infrastructure/repositories/SQLiteColegioRepository');
const SequelizeProductRepository = require('./src/infrastructure/repositories/SequelizeProductRepository');
const SequelizeIngredientRepository = require('./src/infrastructure/repositories/SequelizeIngredientRepository');
const SequelizeWalletRepository = require('./src/infrastructure/repositories/SequelizeWalletRepository');
const SequelizeOrderRepository = require('./src/infrastructure/repositories/SequelizeOrderRepository');

// --- Middlewares --- //
const AuthMiddleware = require('./src/infrastructure/middlewares/AuthMiddleware');

// --- Controladores y Casos de Uso --- //

// > Auth & User
const authRoutes = require('./src/infrastructure/routes/auth.routes');
const AuthController = require('./src/infrastructure/controllers/AuthController');
const RegisterUser = require('./src/application/use-cases/RegisterUser'); 
const LoginUser = require('./src/application/use-cases/LoginUser');

const userRoutes = require('./src/infrastructure/routes/user.routes');
const GetAllUsers = require('./src/application/use-cases/GetAllUsers'); 
const UpdateUser = require('./src/application/use-cases/UpdateUser'); 
const DeleteUser = require('./src/application/use-cases/DeleteUser'); 

// > Colegio
const colegioRoutes = require('./src/infrastructure/routes/colegio.routes');
const ColegioController = require('./src/infrastructure/controllers/ColegioController');
const GetColegioDetails = require('./src/application/use-cases/GetColegioDetails');
const UpdateColegioDetails = require('./src/application/use-cases/UpdateColegioDetails');

// > Productos (Cafetería)
const productRoutes = require('./src/infrastructure/routes/product.routes');
const ProductController = require('./src/infrastructure/controllers/ProductController');
const CreateProduct = require('./src/application/use-cases/CreateProduct');
const GetMenu = require('./src/application/use-cases/GetMenu');
const DeleteProduct = require('./src/application/use-cases/DeleteProduct');
const GetSafeMenu = require('./src/application/use-cases/GetSafeMenu');

// > Pedidos y Wallet
const orderRoutes = require('./src/infrastructure/routes/order.routes'); 
const walletRoutes = require('./src/infrastructure/routes/wallet.routes');

const OrderController = require('./src/infrastructure/controllers/OrderController');
const WalletController = require('./src/infrastructure/controllers/WalletController');

const CreateOrder = require('./src/application/use-cases/CreateOrder');
const GetIncomingOrders = require('./src/application/use-cases/GetIncomingOrders');
const UpdateOrderStatus = require('./src/application/use-cases/UpdateOrderStatus'); // <-- FALTABA ESTO

const GetWalletBalance = require('./src/application/use-cases/GetWalletBalance');
const TopUpWallet = require('./src/application/use-cases/TopUpWallet');


// --- INYECCIÓN DE DEPENDENCIAS --- //

// 1. Instancias de Repositorios
const userRepository = new SequelizeUserRepository();
const colegioRepository = new SequelizeColegioRepository();
const productRepository = new SequelizeProductRepository();
const ingredientRepository = new SequelizeIngredientRepository();
const walletRepository = new SequelizeWalletRepository();
const orderRepository = new SequelizeOrderRepository();

// 2. Instancias de Casos de Uso

// Auth
const registerUser = new RegisterUser(userRepository); 
const loginUser = new LoginUser(userRepository);

// Users
const getAllUsers = new GetAllUsers(userRepository); 
const updateUser = new UpdateUser(userRepository);     
const deleteUser = new DeleteUser(userRepository); 

// Colegio
const getColegioDetails = new GetColegioDetails(colegioRepository);
const updateColegioDetails = new UpdateColegioDetails(colegioRepository);

// Productos
const createProduct = new CreateProduct(productRepository, ingredientRepository);
const getMenu = new GetMenu(productRepository);
const deleteProduct = new DeleteProduct(productRepository);
const getSafeMenu = new GetSafeMenu(productRepository, userRepository);

// Pedidos
const createOrder = new CreateOrder(orderRepository, walletRepository, productRepository);
const getIncomingOrders = new GetIncomingOrders(orderRepository);
const updateOrderStatus = new UpdateOrderStatus(orderRepository); // Instancia necesaria

// Wallet
const getWalletBalance = new GetWalletBalance(walletRepository);
const topUpWallet = new TopUpWallet(walletRepository);


// 3. Instancias de Controladores

const authController = new AuthController(registerUser, loginUser);
authController.userRepository = userRepository; // Inyección manual para alergias

const colegioController = new ColegioController(getColegioDetails, updateColegioDetails);

// Product Controller con todas sus dependencias
const productController = new ProductController(createProduct, getMenu, deleteProduct, getSafeMenu);
productController.ingredientRepository = ingredientRepository; // Inyección manual

// Order Controller
// IMPORTANTE: Pasamos 'updateOrderStatus' como tercer argumento en el constructor
const orderController = new OrderController(createOrder, getIncomingOrders, updateOrderStatus);

// Wallet Controller
const walletController = new WalletController(getWalletBalance, topUpWallet);


// --- CONFIGURACIÓN DE EXPRESS --- //
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(bodyParser.json());

// SERVIR IMÁGENES ESTÁTICAS
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- RUTAS --- //

// 1. Auth
app.use('/api/auth', authRoutes(authController));

// 2. Usuarios (Gestión Admin)
app.use('/api/users', userRoutes(
    { getAllUsers, updateUser, deleteUser, userRepository }, 
    AuthMiddleware
)); 

// 3. Colegio (Gestión Admin)
app.use('/api/colegio', colegioRoutes(colegioController)); 

// 4. Productos (Gestión Cafetería / Ver Estudiante)
app.use('/api/products', productRoutes(productController));

// 5. Pedidos (Gestión de Compra y Cocina)
app.use('/api/orders', orderRoutes(orderController));

// 6. Billetera (Gestión de Saldo)
app.use('/api/wallet', walletRoutes(walletController));

// Test Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', server: 'App Cathering Backend' });
});


// --- ARRANQUE DEL SERVIDOR ---
// Sincroniza modelos con la BD y luego inicia
db.sync({ force: false }) 
.then(() => {
    console.log("Base de datos sincronizada (Sequelize).");
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error("Error al sincronizar base de datos:", err);
});