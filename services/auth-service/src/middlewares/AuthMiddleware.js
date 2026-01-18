// services/auth-service/src/middlewares/AuthMiddleware.js
module.exports = (userRepository, tokenService) => {
    
    // Retornamos la función middleware real de Express
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Access denied. No token provided.' });
            }

            const token = authHeader.split(' ')[1];
            
            const decoded = tokenService.verifyToken(token); 

            if (!decoded) {
                return res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
            }

            const user = await userRepository.findById(decoded.userId);
            
            if (!user) {
                return res.status(401).json({ error: 'Access denied. User not found.' });
            }

            req.user = user; 
            req.userId = user.id;
            
            next();

        } catch (error) {
            console.error('AuthMiddleware Error:', error);
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Invalid or expired token.' });
            }
            return res.status(500).json({ error: 'Auth middleware internal error.' });
        }
    };
};