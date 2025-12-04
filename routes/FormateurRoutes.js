const express = require('express');
const router = express.Router();
const dashboardFormateurControllers = require('../controllers/DashboardFormateurController');
const verifyToken = require('../middleware/Token');
const verifyRole = require('../middleware/Role');

// Middleware combiné
const protect = (role) => [verifyToken, verifyRole(role)];

// Exemple de routes
router.get('/profil/formateur', protect("formateur"),dashboardFormateurControllers.getFormateur);
router.put('/update/formateur', protect("formateur"),dashboardFormateurControllers.updateFormateur);
router.put('/delete/formateur', protect("formateur"), dashboardFormateurControllers.deleteFormateur);

module.exports = router;
