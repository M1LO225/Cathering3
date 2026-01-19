require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const services = {
    auth: 'http://localhost:3001',   
    catalog: 'http://localhost:3002', 
    orders: 'http://localhost:3003'  
};

// 1. Auth & Users & WALLET
app.use(['/api/auth', '/api/users', '/api/wallet'], createProxyMiddleware({ 
    target: services.auth, 
    changeOrigin: true,
    onError: (err, req, res) => res.status(500).json({ error: 'Auth Service Down' })
}));

app.use('/api/products', createProxyMiddleware({ 
    target: services.catalog, 
    changeOrigin: true,
    pathRewrite: {
        '^/api/products': '', // Elimina /api/products de la URL
    },
    onError: (err, req, res) => res.status(500).json({ error: 'Catalog Service Down' })
}));

app.use(['/api/colegio', '/api/ingredients'], createProxyMiddleware({ 
    target: services.catalog, 
    changeOrigin: true,
    onError: (err, req, res) => res.status(500).json({ error: 'Catalog Service Down' })
}));

// Servir Imágenes (Uploads)
app.use('/uploads', createProxyMiddleware({ 
    target: services.catalog, 
    changeOrigin: true 
}));

// 3. Orders (Solo Pedidos)
app.use('/api/orders', createProxyMiddleware({ 
    target: services.orders, 
    changeOrigin: true,
    pathRewrite: {
        '^/api/orders': '', // Limpia la URL para que llegue '/' al servicio 3003
    },
    onError: (err, req, res) => res.status(500).json({ error: 'Order Service Down' })
}));

// Iniciar Gateway (Solo una vez)
app.listen(PORT, () => {
    console.log(`API Gateway corriendo en puerto ${PORT}`);
    console.log(`Redirigiendo tráfico a microservicios internos...`);
});