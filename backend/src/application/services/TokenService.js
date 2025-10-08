// src/application/services/TokenService.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_por_defecto';

class TokenService {
    static generateToken(userId) {
        return jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '1d' });
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