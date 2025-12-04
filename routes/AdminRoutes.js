const express = require('express');
const router = express.Router();
const dashboardAdminControllers = require('../controllers/DashboardAdminController');
const verifyToken = require('../middleware/Token');
const verifyRole = require('../middleware/Role');


// Middleware combiné
const protect = (role) => [verifyToken, verifyRole(role)];

// Exemple de routes

router.get('/stats', protect("admin"),dashboardAdminControllers.getDashboardStats);
router.get('/formateurs/pending', protect("admin"),dashboardAdminControllers.getPendingFormateurs);
router.put('/formateurs/approve/:uuid', protect("admin"),dashboardAdminControllers.approveFormateur);
router.put('/formateurs/block/:uuid', protect("admin"), dashboardAdminControllers.blockFormateur);

module.exports = router;
