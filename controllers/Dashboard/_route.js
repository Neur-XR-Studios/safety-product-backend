const express = require('express');
const Dashboard = require('./dashboard');
// const auth = require('../../middelwares/auth');

const router = express.Router();

// Fire Extinguisher
router.get('/fire-extinguisher/', Dashboard.fireExtinguisherIndex)
router.post('/fire-extinguisher/excel/', Dashboard.fireExtinguisherExcel)

// Work At Height
router.get('/work-at-height/', Dashboard.workAtHeightIndex)
router.post('/work-at-height/excel/', Dashboard.workAtHeightExcel)
module.exports = router