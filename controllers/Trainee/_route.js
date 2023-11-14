const express = require('express');
const Trainee = require('./trainee');
// const auth = require('../../middelwares/auth');

const router = express.Router();

router.get('/', Trainee.index)
router.post('/add', Trainee.add)
// router.get('/view/:id', Trainee.view)

module.exports = router