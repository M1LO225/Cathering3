require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar configuración DB centralizada
const { sequelize, Order, OrderItem, Wallet, Transaction } = require('./src/config/db');

// Importar Worker
const startWorker = require('./src/workers/PaymentWorker');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// 🔍 DEBUG 1: LOGUEAR TODO LO QUE ENTRA
// Esto nos dirá si el Request llega y qué datos trae
app.use((req, res, next) => {
    console.log(`------------------------------------------------`);
    console.log(`[INCOMING] ${req.method} ${req.url}`);
    console.log(`[HEADERS] Auth: ${req.headers.authorization ? 'SI' : 'NO'}`);
    
    // IMPORTANTE: Si esto sale vacío {}, el problema es el parseo del body
    console.log(`[BODY]`, JSON.stringify(req.body, null, 2)); 
    console.log(`------------------------------------------------`);
    next();
});

// RUTAS
const createOrderRoutes = require('./src/routes/order.routes');
const createWalletRoutes = require('./src/routes/wallet.routes');

const orderRouter = createOrderRoutes(Order, OrderItem, Wallet);
const walletRouter = createWalletRoutes(Wallet, Transaction);

// RUTAS
app.use('/api/orders', orderRouter);
app.use('/api/wallet', walletRouter);
app.use('/', walletRouter); 
app.use('/', orderRouter);

// 🔍 DEBUG 2: MANEJADOR DE ERRORES GLOBAL (Blindaje final)
// Si algo explota y no tiene try/catch, caerá aquí.
app.use((err, req, res, next) => {
    console.error("🔥 [FATAL ERROR] Excepción no controlada capturada en Index:");
    console.error(err); // Esto imprimirá el stack trace completo en CloudWatch
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno crítico del servidor',
        details: err.message 
    });
});

// SERVER
sequelize.sync({ force: false }).then(() => {
    console.log('✅ Base de datos sincronizada');
    app.listen(PORT, () => {
        console.log(`🚀 Order Service corriendo en puerto ${PORT}`);
    });
    startWorker().catch(err => console.error("Fallo al iniciar worker:", err));
}).catch(err => {
    console.error('Error DB:', err);
});