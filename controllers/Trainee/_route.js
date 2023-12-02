const express = require('express');
const Trainee = require('./trainee');
const auth = require('../../middleware/auth');
const { Roles } = require('../../middleware/auth');

const router = express.Router();

router.get('/', auth.authorize(Roles.Admin), Trainee.index)
router.post('/add', auth.authorize(Roles.Admin), Trainee.add)
// router.get('/view/:id', Trainee.view)

module.exports = router