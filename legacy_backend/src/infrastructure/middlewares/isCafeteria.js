const isCafeteria = (req, res, next) => {
    // Asume que AuthMiddleware ya se ejecutó y req.user existe
    if (req.user && req.user.role === 'CAFETERIA') {
        next();
    } else {
        res.status(403).json({ error: 'Acción no autorizada. Solo el usuario Cafetería puede gestionar el menú.' });
    }
};

module.exports = isCafeteria;