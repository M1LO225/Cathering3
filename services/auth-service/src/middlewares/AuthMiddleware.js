// services/auth-service/src/middlewares/AuthMiddleware.js

module.exports = (userRepository, tokenService) => {
    return async (req, res, next) => {
        try {
            // 1. Obtener el header Authorization
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ error: 'Token no proporcionado.' });
            }

            // 2. Extraer el token (Bearer <token>)
            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'Formato de token inválido.' });
            }

            // 3. Verificar usando el TokenService (así comparten el mismo SECRETO)
            const decoded = tokenService.verify(token);

            // 4. Buscar usuario (Opcional: Verificar que siga existiendo)
            const user = await userRepository.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ error: 'El usuario del token ya no existe.' });
            }

            // 5. Inyectar usuario en la request
            req.user = user; 
            next();

        } catch (error) {
            // Token expirado o firma inválida
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
    };
};