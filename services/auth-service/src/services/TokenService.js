const jwt = require('jsonwebtoken');

// Aseguramos que haya un secreto, incluso si falta en el .env por error
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

class TokenService {
    
    generateToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
}

module.exports = TokenService;