// src/application/use-cases/GetColegioDetails.js

class GetColegioDetails {
    constructor(colegioRepository) {
        this.colegioRepository = colegioRepository;
    }

    async execute(colegioId) {
        if (!colegioId) {
            throw new Error("ID del colegio no proporcionado.");
        }
        
        const colegio = await this.colegioRepository.findById(colegioId);
        
        if (!colegio) {
            throw new Error("Colegio no encontrado.");
        }
        
        return colegio;
    }
}

module.exports = GetColegioDetails;