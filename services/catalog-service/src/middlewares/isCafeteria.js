module.exports = (req, res, next) => {
    // Verificamos el rol directamente del token decodificado
    // Asegúrate que tu rol en el token se llame 'cafeteria' o ajusta este string
    if (req.user && req.user.role === 'cafeteria') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado: Se requiere rol Cafeteria.' });
    }
};