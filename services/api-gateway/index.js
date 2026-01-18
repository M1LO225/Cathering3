// services/api-gateway/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', server: 'API Gateway Microservices' });
});

// --- DEFINICIÓN DE SERVICIOS (Discovery) ---
const services = {
    auth: 'http://localhost:3001',   // Auth Service
    catalog: 'http://localhost:3002', // Catalog Service
    orders: 'http://localhost:3003'   // Order Service
};

// --- ENRUTAMIENTO (PROXY) ---

// 1. Rutas de Autenticación y Usuarios -> Auth Service
app.use('/api/auth', createProxyMiddleware({ 
    target: services.auth, 
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '/api/auth', 
    },
    onError: (err, req, res) => res.status(500).json({ error: 'Auth Service Down' })
}));

app.use('/api/users', createProxyMiddleware({ 
    target: services.auth, 
    changeOrigin: true,
    onError: (err, req, res) => res.status(500).json({ error: 'Auth Service Down' })
}));

// 2. Rutas de Productos y Colegios -> Catalog Service
app.use('/api/products', createProxyMiddleware({ 
    target: services.catalog, 
    changeOrigin: true 
}));

app.use('/api/colegio', createProxyMiddleware({ 
    target: services.catalog, 
    changeOrigin: true 
}));

// Redirigir imágenes subidas al servicio de catálogo
app.use('/uploads', createProxyMiddleware({ 
    target: services.catalog, 
    changeOrigin: true 
}));

// 3. Rutas de Pedidos y Billetera -> Order Service
app.use('/api/orders', createProxyMiddleware({ 
    target: services.orders, 
    changeOrigin: true 
}));

app.use('/api/wallet', createProxyMiddleware({ 
    target: services.orders, 
    changeOrigin: true 
}));

// Iniciar Gateway
app.listen(PORT, () => {
    console.log(`API Gateway corriendo en puerto ${PORT}`);
    console.log(`Redirigiendo tráfico a microservicios internos...`);
});