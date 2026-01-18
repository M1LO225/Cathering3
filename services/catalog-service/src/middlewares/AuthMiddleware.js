const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Obtener el header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    // 2. Extraer el token (Bearer <token>)
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verificar token con la MISMA clave secreta que Auth Service
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Guardar datos del usuario en la request (Sin ir a la base de datos)
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};