const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

class TokenService {
    /**
     * 
     * @param {object} user 
     */
    static generateToken(user) {

        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            colegio_id: user.colegio_id
        };
        

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