const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
        }

        // Verifica usando la misma clave secreta que usaste en Auth Service
        // Asegúrate de tener JWT_SECRET en el .env de catalog-service
        const secret = process.env.JWT_SECRET || 'tu_secreto_super_seguro';
        
        jwt.verify(token, secret, (err, user) => {
            if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
            
            // Inyectamos los datos del usuario en la request para que el Controlador los use
            req.user = user; 
            next();
        });
    } catch (error) {
        res.status(401).json({ error: 'Autenticación fallida' });
    }
};