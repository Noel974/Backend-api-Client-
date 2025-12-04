const express = require('express');
const router = express.Router();
const authController = require ('../controllers/AuthController')

// Routes pour chaque type d'utilisateur
router.post('/login', authController.loginAll);

module.exports = router;