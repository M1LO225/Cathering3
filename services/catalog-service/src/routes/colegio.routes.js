const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const isColegioAdmin = require('../middlewares/isColegioAdmin');
// Asegúrate de copiar este validador del legacy
const validateColegio = require('../middlewares/validateColegio'); 

module.exports = (colegioController) => {
    const router = Router();

    // Middleware global para estas rutas
    router.use(AuthMiddleware);
    router.use(isColegioAdmin);

    router.get('/me', colegioController.getDetails.bind(colegioController));
    
    router.put('/me', 
        validateColegio, 
        colegioController.updateDetails.bind(colegioController)
    );

    return router;
};