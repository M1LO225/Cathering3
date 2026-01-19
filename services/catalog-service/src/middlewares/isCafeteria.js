module.exports = (req, res, next) => {
    // El rol puede venir como 'cafeteria' o 'CAFETERIA', validamos ambos por si acaso
    if (req.user && (req.user.role === 'cafeteria' || req.user.role === 'CAFETERIA')) {
        next();
    } else {
        res.status(403).json({ error: 'Requiere rol de Cafetería' });
    }
};