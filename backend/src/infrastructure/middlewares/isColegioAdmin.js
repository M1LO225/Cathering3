// src/infrastructure/middlewares/isColegioAdmin.js

const isColegioAdmin = (req, res, next) => {
    // Se asume que AuthMiddleware ya se ejecutó y adjuntó 'req.user'
    if (req.user && req.user.role === 'COLEGIO_ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Acción no autorizada. Requiere rol de Administrador de Colegio.' });
    }
};

module.exports = isColegioAdmin;