const UserRepository = require('../../domain/repositories/UserRepository');
const UserModel = require('../models/UserModel');
const ColegioModel = require('../models/ColegioModel');
const sequelize = require('../config/database');

class SequelizeUserRepository extends UserRepository {
    

    _toDomain(sequelizeUser) {
        if (!sequelizeUser) return null;
        const u = sequelizeUser.toJSON();

        return {
            id: u.id,
            username: u.username,
            passwordHash: u.passwordHash,
            email: u.email,
            role: u.role,
            colegio_id: u.colegio_id
        };
    }

    async findById(id) {
        const user = await UserModel.findByPk(id);
        return this._toDomain(user);
    }

    async findByUsername(username) {
        const user = await UserModel.findOne({ where: { username } });
        return this._toDomain(user);
    }

    async findByEmail(email) {
        const user = await UserModel.findOne({ where: { email } });
        return this._toDomain(user);
    }


    async save(user) {
        const newUser = await UserModel.create({
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role || 'ESTUDIANTE'
        });
        return this._toDomain(newUser);
    }


    async saveWithRole(user) {
        const newUser = await UserModel.create({
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            colegio_id: user.colegio_id
        });
        return this._toDomain(newUser);
    }


    async createColegioAdmin(user, colegioData) {
        const t = await sequelize.transaction(); 

        try {

            const newColegio = await ColegioModel.create(colegioData, { transaction: t });


            const newAdmin = await UserModel.create({
                username: user.username,
                email: user.email,
                passwordHash: user.passwordHash,
                role: 'COLEGIO_ADMIN',
                colegio_id: newColegio.id
            }, { transaction: t });


            await t.commit();


            const result = this._toDomain(newAdmin);
            result.colegio_id = newColegio.id;
            return result;

        } catch (error) {
            await t.rollback();
            console.error("Error en transacción Sequelize:", error);
            throw new Error("No se pudo registrar el colegio y el administrador.");
        }
    }

    async findAll() {
        const users = await UserModel.findAll({
            order: [['id', 'DESC']]
        });
        return users.map(u => this._toDomain(u));
    }

    async delete(id) {
        return await UserModel.destroy({ where: { id } });
    }

    async update(id, username, email, passwordHash) {
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (passwordHash) updateData.passwordHash = passwordHash;

        await UserModel.update(updateData, { where: { id } });
        return this.findById(id);
    }
}

module.exports = SequelizeUserRepository;