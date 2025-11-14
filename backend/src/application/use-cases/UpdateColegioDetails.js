// src/application/use-cases/UpdateColegioDetails.js

class UpdateColegioDetails {
    constructor(colegioRepository) {
        this.colegioRepository = colegioRepository;
    }

    async execute(colegioId, data) {
        if (!colegioId) {
            throw new Error("ID del colegio no proporcionado.");
        }
        
        // La validación de 'data' la hace el middleware 'validateColegio'
        
        const updatedColegio = await this.colegioRepository.update(colegioId, data);
        
        if (!updatedColegio) {
            throw new Error("Colegio no encontrado después de actualizar.");
        }
        
        return updatedColegio;
    }
}

module.exports = UpdateColegioDetails;