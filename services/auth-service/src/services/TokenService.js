// services/auth-service/src/services/TokenService.js
const jwt = require('jsonwebtoken');

class TokenService {
    constructor() {
        // Usa una variable de entorno o una clave por defecto para desarrollo
        this.secret = process.env.JWT_SECRET || 'mi_secreto_super_seguro';
    }

    // Este es el método que LoginUser estaba buscando y no encontraba
    generate(payload) {
        return jwt.sign(payload, this.secret, { expiresIn: '24h' });
    }

    verify(token) {
        return jwt.verify(token, this.secret);
    }
}

module.exports = TokenService;