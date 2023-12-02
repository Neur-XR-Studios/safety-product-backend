const express = require('express');
const userController = require('./login');
const router = express.Router();
const auth = require('../../middleware/auth');
const { Roles } = require('../../middleware/auth');

router.post('/login', userController.login);
router.post('/activation', auth.authorize(Roles.Admin), userController.activationCode);

module.exports = router