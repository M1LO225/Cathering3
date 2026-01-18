const TokenService = require('../../application/services/TokenService');
// Con esto tenemos acceso directo a la DB y al Repo desde aquí
const db = require('../config/database');
const SQLiteUserRepository = require('../repositories/SQLiteUserRepository');
const userRepository = new SQLiteUserRepository(db);

const AuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = TokenService.verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
    }

    try {
        const user = await userRepository.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Access denied. User not found.' });
        }
        
        // Adjuntamos el usuario (incluye role y colegio_id)
        req.user = user; 
        req.userId = user.id; // Mantenemos compatibilidad
        next();
        
    } catch (error) {
         return res.status(500).json({ error: 'Auth middleware internal error.' });
    }
};

module.exports = AuthMiddleware;