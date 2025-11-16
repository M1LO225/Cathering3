const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

class TokenService {
    /**
     * (MODIFICADO) Genera un token con todo el payload del usuario
     * @param {object} user - El objeto de usuario (debe tener id, username, role, colegio_id)
     */
    static generateToken(user) {
        // Creamos un payload con toda la información necesaria para el frontend
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            colegio_id: user.colegio_id
        };
        
        // Firmamos el token con el nuevo payload
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
}

module.exports = TokenService;