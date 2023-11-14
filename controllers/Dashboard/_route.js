const express = require('express');
const Dashboard = require('./dashboard');
// const auth = require('../../middelwares/auth');

const router = express.Router();

router.get('/dashboard-data/', Dashboard.index)

module.exports = router