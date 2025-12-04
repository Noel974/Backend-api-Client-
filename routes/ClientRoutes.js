const express = require('express');
const router = express.Router();
const clientController = require('../controllers/DasbordClientControllers');
const verifyToken = require('../middleware/Token');
const verifyRole = require('../middleware/Role');

// Middleware combiné
const protect = (role) => [verifyToken, verifyRole(role)];

// ✅ Routes protégées via token
router.get('/getclient', protect("client"), clientController.getClient);           // Récupère le client connecté
router.put('/updateclient', protect("client"), clientController.updateClient);        // Met à jour le client connecté
router.delete('/deleteclient', protect("client"), clientController.deleteClient);     // Supprime le client connecté

module.exports = router;