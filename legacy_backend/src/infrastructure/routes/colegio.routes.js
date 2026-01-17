// src/infrastructure/routes/colegio.routes.js
const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const isColegioAdmin = require('../middlewares/isColegioAdmin');
const validateColegio = require('../middlewares/validateColegio');

module.exports = (colegioController) => {
    const router = Router();

    // Todas las rutas de este archivo requieren estar logueado
    router.use(AuthMiddleware);
    // Todas las rutas de este archivo requieren ser COLEGIO_ADMIN
    router.use(isColegioAdmin);

    /**
     * GET /api/colegio/me
     * Obtiene los detalles de la institución del admin logueado
     */
    router.get('/me', colegioController.getDetails.bind(colegioController));

    /**
     * PUT /api/colegio/me
     * Actualiza los detalles de la institución del admin logueado
     * Valida el teléfono (dato sensible) antes de actualizar.
     */
    router.put(
        '/me', 
        validateColegio, // Requisito 1: Validación de dato sensible
        colegioController.updateDetails.bind(colegioController)
    );

    return router;
};