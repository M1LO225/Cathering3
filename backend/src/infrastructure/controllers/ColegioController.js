// src/infrastructure/controllers/ColegioController.js

class ColegioController {
    constructor(getColegioDetails, updateColegioDetails) {
        this.getColegioDetails = getColegioDetails;
        this.updateColegioDetails = updateColegioDetails;
    }

    /**
     * Obtiene los detalles del colegio del admin logueado
     */
    async getDetails(req, res) {
        try {
            // req.user.colegio_id es adjuntado por AuthMiddleware
            const colegioId = req.user.colegio_id;
            const colegio = await this.getColegioDetails.execute(colegioId);
            res.status(200).json(colegio);
        } catch (error) {
            console.error('Error al obtener detalles del colegio:', error);
            res.status(404).json({ error: error.message || 'Error interno.' });
        }
    }

    /**
     * Actualiza los detalles del colegio del admin logueado
     */
    async updateDetails(req, res) {
        try {
            const colegioId = req.user.colegio_id;
            const data = req.body;
            
            // La validación de 'data' (ej. teléfono) la hizo el middleware
            
            const updatedColegio = await this.updateColegioDetails.execute(colegioId, data);
            res.status(200).json({ 
                message: 'Institución actualizada correctamente.', 
                colegio: updatedColegio 
            });
        } catch (error) {
            console.error('Error al actualizar detalles del colegio:', error);
            res.status(500).json({ error: error.message || 'Error interno.' });
        }
    }
}

module.exports = ColegioController;