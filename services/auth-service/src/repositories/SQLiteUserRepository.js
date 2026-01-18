// services/auth-service/src/repositories/SQLiteUserRepository.js
const { Op } = require('sequelize');

class SQLiteUserRepository {
    constructor(userModel) {
        this.userModel = userModel;
    }

    async save(userEntity) {
        return await this.userModel.create(userEntity);
    }

    async findById(id) {
        return await this.userModel.findByPk(id);
    }

    async findByEmail(email) {
        return await this.userModel.findOne({ where: { email } });
    }

    async findByUsernameOrEmail(username, email) {
        return await this.userModel.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });
    }

    async findAll(colegioId) {
        const options = {
            attributes: { exclude: ['password'] }
        };

        // Si el controlador envía un ID de colegio, filtramos.
        // Si no envía nada (undefined), trae TODOS los usuarios del sistema.
        if (colegioId) {
            options.where = { colegio_id: colegioId };
        }

        // CORRECCIÓN: Cambiado 'this.User' por 'this.userModel'
        return await this.userModel.findAll(options);
    }

    // --- Manejo de Alergias (Local) ---
    async getUserAllergies(userId) {
        const user = await this.userModel.findByPk(userId);
        // Si no existe usuario o el campo es null, retorna array vacío
        return user ? (user.allergies || []) : [];
    }

    async updateAllergies(userId, ingredientIds) {
        const user = await this.userModel.findByPk(userId);
        if (!user) throw new Error('Usuario no encontrado');
        
        // Guardamos los IDs directamente en la columna JSON
        user.allergies = ingredientIds;
        await user.save();
        return true;
    }
}

module.exports = SQLiteUserRepository;