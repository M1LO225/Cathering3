const ColegioRepository = require('../../domain/repositories/ColegioRepository');
const ColegioModel = require('../models/ColegioModel');

class SequelizeColegioRepository extends ColegioRepository {
    

    _toDomain(sequelizeColegio) {
        if (!sequelizeColegio) return null;
        return sequelizeColegio.toJSON();
    }

    async findById(id) {
        const colegio = await ColegioModel.findByPk(id);
        return this._toDomain(colegio);
    }

    async update(id, data) {
        const { nombre, direccion, telefono, ciudad, provincia } = data;
        

        await ColegioModel.update({
            nombre, direccion, telefono, ciudad, provincia
        }, {
            where: { id }
        });


        return this.findById(id);
    }
}

module.exports = SequelizeColegioRepository;