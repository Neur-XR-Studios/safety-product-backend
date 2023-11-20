const express = require('express');
const Dashboard = require('./dashboard');
// const auth = require('../../middelwares/auth');

const router = express.Router();

router.get('/fire-extinguisher/', Dashboard.fireExtinguisherIndex)
router.post('/fire-extinguisher/excel/', Dashboard.fireExtinguisherExcel)

module.exports = router