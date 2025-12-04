const express = require('express');
const router = express.Router();
const registerControllers = require('../controllers/RegisterController');

router.post('/register', registerControllers.register);


module.exports = router;
