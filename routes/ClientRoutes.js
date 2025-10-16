const express = require('express');
const router = express.Router();
const clientController = require('../controllers/ClientControllers');
const { verifyToken } = require('../middleware/AuthClient');

router.post('/register', clientController.register);
router.post('/login', clientController.login);

// Routes protégées
router.get('/:uuid', verifyToken, clientController.getClient);
router.put('/:uuid', verifyToken, clientController.updateClient);
router.delete('/:uuid', verifyToken, clientController.deleteClient);

module.exports = router;
