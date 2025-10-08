// src/infrastructure/middlewares/AuthMiddleware.js
const TokenService = require('../../application/services/TokenService');

const AuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = TokenService.verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
    }

    req.userId = decoded.userId;
    next();
};

module.exports = AuthMiddleware;