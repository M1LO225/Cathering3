require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const services = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',   
    catalog: process.env.CATALOG_SERVICE_URL || 'http://localhost:3002', 
    orders: process.env.ORDER_SERVICE_URL || 'http://localhost:3003'  
};

console.log('Configuración de Servicios:', services);

// 1. Auth & Users (SOLO Autenticación y Usuarios)
// ❌ ANTES AQUÍ ESTABA 'wallet', LO HEMOS QUITADO
app.use(['/api/auth', '/api/users'], createProxyMiddleware({ 
    target: services.auth, 
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '',
    },
    onError: (err, req, res) => res.status(500).json({ error: 'Auth Service Down' })
}));

// 2. Wallet & Orders (AHORA Wallet va a ORDERS) 
// ✅ AQUÍ ES DONDE DEBE ESTAR
app.use(['/api/orders', '/api/wallet'], createProxyMiddleware({ 
    target: services.orders, 
    changeOrigin: true,
    // NO usamos pathRewrite aquí porque order-service define app.use('/api/wallet'...)
    onError: (err, req, res) => res.status(500).json({ error: 'Order/Wallet Service Down' })
}));

// 3. Catalog (Productos e Ingredientes)
app.use(['/api/products', '/api/ingredients', '/api/colegio'], createProxyMiddleware({ 
    target: services.catalog, 
    changeOrigin: true,
    pathRewrite: {
        '^/api/products': '', 
        '^/api/ingredients': '/ingredients',
        '^/api/colegio': ''
    },
    onError: (err, req, res) => res.status(500).json({ error: 'Catalog Service Down' })
}));

// Servir Imágenes (Uploads)
app.use('/uploads', createProxyMiddleware({ 
    target: services.catalog, 
    changeOrigin: true,
    pathRewrite: {
        '^/': '/uploads/' 
    },
    onError: (err, req, res) => res.status(500).json({ error: 'Image Proxy Error' })
}));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', services });
});

app.listen(PORT, () => {
    console.log(`API Gateway corriendo en puerto ${PORT}`);
});