const express = require('express');
const router = express.Router();
const clientController = require('../controllers/ClientControllers');
const { verifyToken } = require('../middleware/AuthClient');

// 🔐 Authentification
router.post('/register', clientController.register);
router.post('/login', clientController.login);

// ✅ Routes protégées via token
router.get('/', verifyToken, clientController.getClient);           // Récupère le client connecté
router.put('/', verifyToken, clientController.updateClient);        // Met à jour le client connecté
router.delete('/', verifyToken, clientController.deleteClient);     // Supprime le client connecté

module.exports = router;
