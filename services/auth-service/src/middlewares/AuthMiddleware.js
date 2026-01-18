// services/auth-service/src/middlewares/AuthMiddleware.js
module.exports = (userRepository, tokenService) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Acceso denegado. Falta token.' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = tokenService.verifyToken(token);
            if (!decoded) return res.status(401).json({ error: 'Token inválido.' });

            const user = await userRepository.findById(decoded.userId);
            if (!user) return res.status(401).json({ error: 'Usuario no encontrado.' });
            
            req.user = user; 
            req.userId = user.id;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
    };
};